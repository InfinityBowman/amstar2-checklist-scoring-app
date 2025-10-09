import type { LiveQuery, LiveQueryResults } from '@electric-sql/pglite/live';
import { query as buildQuery } from '@electric-sql/pglite/template';
import { createEffect, createSignal, onCleanup } from 'solid-js';
import { usePGlite } from './provider.tsx';

function paramsEqual(a1: unknown[] | undefined | null, a2: unknown[] | undefined | null) {
  if (!a1 && !a2) return true;
  if (a1?.length !== a2?.length) return false;
  for (let i = 0; i < a1!.length; i++) {
    if (!Object.is(a1![i], a2![i])) {
      return false;
    }
  }
  return true;
}

function useLiveQueryImpl<T = { [key: string]: unknown }>(
  query: string | LiveQuery<T> | Promise<LiveQuery<T>>,
  params: unknown[] | undefined | null,
  key?: string,
): () => Omit<LiveQueryResults<T>, 'affectedRows'> | undefined {
  const db = usePGlite();
  const [results, setResults] = createSignal<LiveQueryResults<T> | undefined>(undefined);
  let liveQueryRef: LiveQuery<T> | undefined = undefined;
  let paramsRef: unknown[] | undefined | null = params;

  createEffect(() => {
    let cancelled = false;
    let liveQuery: LiveQuery<T> | undefined;
    let currentParams = paramsRef;

    if (!paramsEqual(paramsRef, params)) {
      paramsRef = params;
      currentParams = params;
    }

    const cb = (results_: LiveQueryResults<T>) => {
      if (cancelled) return;
      setResults(results_);
    };

    if (typeof query === 'string') {
      const ret =
        key !== undefined ? db.live.incrementalQuery<T>(query, currentParams, key, cb) : db.live.query<T>(query, currentParams, cb);

      ret.then(({ unsubscribe }: { unsubscribe: () => void }) => {
        onCleanup(() => {
          cancelled = true;
          unsubscribe();
        });
      });
    } else if (query instanceof Promise) {
      query.then((lq) => {
        if (cancelled) return;
        liveQueryRef = lq;
        setResults(lq.initialResults);
        lq.subscribe(cb);
        onCleanup(() => {
          console.trace('useLiveQueryImpl called');
          cancelled = true;
          lq.unsubscribe(cb);
        });
      });
    } else if (typeof query === 'object' && query !== null) {
      liveQuery = query as LiveQuery<T>;
      setResults(liveQuery.initialResults);
      liveQuery.subscribe(cb);
      onCleanup(() => {
        cancelled = true;
        liveQuery!.unsubscribe(cb);
      });
    } else {
      throw new Error('Should never happen');
    }
  });

  return () =>
    results() && {
      rows: results().rows,
      fields: results().fields,
      totalCount: results().totalCount,
      offset: results().offset,
      limit: results().limit,
    };
}

export function useLiveQuery<T = { [key: string]: unknown }>(
  query: string,
  params?: unknown[] | null,
): () => LiveQueryResults<T> | undefined;

export function useLiveQuery<T = { [key: string]: unknown }>(liveQuery: LiveQuery<T>): () => LiveQueryResults<T> | undefined;

export function useLiveQuery<T = { [key: string]: unknown }>(
  liveQueryPromise: Promise<LiveQuery<T>>,
): () => LiveQueryResults<T> | undefined;

export function useLiveQuery<T = { [key: string]: unknown }>(
  query: string | LiveQuery<T> | Promise<LiveQuery<T>>,
  params?: unknown[] | null,
): () => LiveQueryResults<T> | undefined {
  return useLiveQueryImpl<T>(query, params);
}

useLiveQuery.sql = function <T = { [key: string]: unknown }>(
  strings: TemplateStringsArray,
  ...values: any[]
): () => LiveQueryResults<T> | undefined {
  const { query, params } = buildQuery(strings, ...values);
  return useLiveQueryImpl<T>(query, params);
};

export function useLiveIncrementalQuery<T = { [key: string]: unknown }>(
  query: string,
  params: unknown[] | undefined | null,
  key: string,
): () => LiveQueryResults<T> | undefined {
  return useLiveQueryImpl<T>(query, params, key);
}
