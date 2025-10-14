import { Shape, ShapeStream, ShapeStreamOptions, Row, GetExtensions } from '@electric-sql/client';
import { createSignal, onCleanup } from 'solid-js';

type UnknownShape = Shape<Row<unknown>>;
type UnknownShapeStream = ShapeStream<Row<unknown>>;

const streamCache = new Map<string, UnknownShapeStream>();
const shapeCache = new Map<UnknownShapeStream, UnknownShape>();

export async function preloadShape<T extends Row<unknown> = Row>(options: ShapeStreamOptions<GetExtensions<T>>): Promise<Shape<T>> {
  const shapeStream = getShapeStream<T>(options);
  const shape = getShape<T>(shapeStream);
  await shape.rows;
  return shape;
}

function sortObjectKeys(obj: any): any {
  if (typeof obj === `function`) return Function.prototype.toString.call(obj);
  if (typeof obj !== `object` || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  return Object.keys(obj)
    .sort()
    .reduce<Record<string, any>>((sorted, key) => {
      sorted[key] = sortObjectKeys(obj[key]);
      return sorted;
    }, {});
}

export function sortedOptionsHash<T = unknown>(options: ShapeStreamOptions<T>): string {
  return JSON.stringify(sortObjectKeys(options));
}

export function getShapeStream<T extends Row<unknown>>(options: ShapeStreamOptions<GetExtensions<T>>): ShapeStream<T> {
  const shapeHash = sortedOptionsHash(options);

  // If the stream is already cached, return it if valid
  if (streamCache.has(shapeHash)) {
    const stream = streamCache.get(shapeHash)! as ShapeStream<T>;
    if (!stream.options.signal?.aborted) {
      return stream;
    }

    // if stream is aborted, remove it and related shapes
    streamCache.delete(shapeHash);
    shapeCache.delete(stream);
  }

  const newShapeStream = new ShapeStream<T>(options);
  streamCache.set(shapeHash, newShapeStream);

  // Return the created shape
  return newShapeStream;
}

export function getShape<T extends Row<unknown>>(shapeStream: ShapeStream<T>): Shape<T> {
  // If the stream is already cached, return it if valid
  if (shapeCache.has(shapeStream)) {
    if (!shapeStream.options.signal?.aborted) {
      return shapeCache.get(shapeStream)! as Shape<T>;
    }

    // if stream is aborted, remove it and related shapes
    streamCache.delete(sortedOptionsHash(shapeStream.options));
    shapeCache.delete(shapeStream);
  }

  const newShape = new Shape<T>(shapeStream);
  shapeCache.set(shapeStream, newShape);

  // Return the created shape
  return newShape;
}

// Result type for internal data processing
export interface ShapeDataResult<T extends Row<unknown> = Row> {
  /**
   * The array of rows that make up the Shape.
   * @type {T[]}
   */
  data: T[];
  /**
   * The Shape instance used by this createShape
   * @type {Shape<T>}
   */
  shape: Shape<T>;
  /**
   * The ShapeStream instance used by this Shape
   * @type {ShapeStream<T>}
   */
  stream: ShapeStream<T>;
  /** True during initial fetch. False afterwise. */
  isLoading: boolean;
  /** Unix time at which we last synced. Undefined when `isLoading` is true. */
  lastSyncedAt?: number;
  error: Shape<T>[`error`];
  isError: boolean;
}

// Type for the exported accessor functions
export interface CreateShapeResult<T extends Row<unknown> = Row> {
  /**
   * Accessor function that returns the array of rows.
   */
  data: () => T[];
  /**
   * Accessor function that returns whether the shape is loading.
   */
  isLoading: () => boolean;
  /**
   * Accessor function that returns whether the shape has an error.
   */
  isError: () => boolean;
  /**
   * Accessor function that returns the error, if any.
   */
  error: () => Shape<T>[`error`];
  /**
   * Accessor function that returns the timestamp of the last sync.
   */
  lastSyncedAt: () => number | undefined;
  /**
   * The Shape instance used by this createShape.
   */
  shape: Shape<T>;
  /**
   * The ShapeStream instance used by this Shape.
   */
  stream: ShapeStream<T>;
  /**
   * Legacy accessor for getting all values in one object.
   */
  get: () => ShapeDataResult<T>;
}

// function shapeSubscribe<T extends Row<unknown>>(
//   shape: Shape<T>,
//   callback: () => void
// ) {
//   const unsubscribe = shape.subscribe(callback)
//   return () => {
//     unsubscribe()
//   }
// }

function parseShapeData<T extends Row<unknown>>(shape: Shape<T>): ShapeDataResult<T> {
  return {
    data: shape.currentRows,
    isLoading: shape.isLoading(),
    lastSyncedAt: shape.lastSyncedAt(),
    isError: shape.error !== false,
    shape,
    stream: shape.stream as ShapeStream<T>,
    error: shape.error,
  };
}

function shapeResultChanged<T extends Row<unknown>>(oldRes: ShapeDataResult<T> | undefined, newRes: ShapeDataResult<T>): boolean {
  return (
    !oldRes ||
    oldRes.isLoading !== newRes.isLoading ||
    oldRes.lastSyncedAt !== newRes.lastSyncedAt ||
    oldRes.isError !== newRes.isError ||
    oldRes.error !== newRes.error ||
    oldRes.shape.lastOffset !== newRes.shape.lastOffset ||
    oldRes.shape.handle !== newRes.shape.handle
  );
}

function identity<T>(arg: T): T {
  return arg;
}

interface CreateShapeOptions<SourceData extends Row<unknown>, Selection> extends ShapeStreamOptions<GetExtensions<SourceData>> {
  selector?: (value: CreateShapeResult<SourceData>) => Selection;
}

export function createShape<SourceData extends Row<unknown> = Row, Selection = CreateShapeResult<SourceData>>({
  selector = identity as (arg: CreateShapeResult<SourceData>) => Selection,
  ...options
}: CreateShapeOptions<SourceData, Selection>) {
  const shapeStream = getShapeStream<SourceData>(options);
  const shape = getShape<SourceData>(shapeStream);

  const [data, setData] = createSignal<SourceData[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [isError, setIsError] = createSignal(false);
  const [error, setError] = createSignal<unknown>(null);
  const [lastSyncedAt, setLastSyncedAt] = createSignal<number | undefined>(undefined);

  // initial parse
  const initial = parseShapeData(shape);
  setData(initial.data);
  setIsLoading(initial.isLoading);
  setIsError(initial.isError);
  setError(initial.error);
  setLastSyncedAt(initial.lastSyncedAt);

  // Keep track of the latest result for better change detection
  let latestResult = initial;

  // subscription
  const unsubscribe = shape.subscribe(() => {
    const newRes = parseShapeData(shape);
    if (shapeResultChanged(latestResult, newRes)) {
      setData(newRes.data);
      setIsLoading(newRes.isLoading);
      setIsError(newRes.isError);
      setError(newRes.error);
      setLastSyncedAt(newRes.lastSyncedAt);
      latestResult = newRes;
    }
  });

  onCleanup(() => unsubscribe());

  // Create an object of accessor functions that can be destructured
  const result: CreateShapeResult<SourceData> = {
    // Data accessors
    data,
    isLoading,
    isError,
    error: error as () => Shape<SourceData>[`error`],
    lastSyncedAt,

    // Non-reactive properties
    shape,
    stream: shapeStream,

    // Original accessor pattern preserved for backward compatibility
    get: () => {
      return {
        data: data(),
        isLoading: isLoading(),
        isError: isError(),
        error: error() as Shape<SourceData>[`error`],
        lastSyncedAt: lastSyncedAt(),
        shape,
        stream: shapeStream,
      };
    },
  };

  // Apply selector if provided (for advanced use cases)
  const selected = selector(result);

  // Return the object with accessors
  return selected;
}
