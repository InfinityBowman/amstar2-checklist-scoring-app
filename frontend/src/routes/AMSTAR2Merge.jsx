import { createSignal, For, Show } from 'solid-js';
import { useParams } from '@solidjs/router';
// import { AMSTAR_CHECKLIST } from '../offline/checklistMap.js';
import { useAppStore } from '../AppStore.js';

/**
 * Maybe the interface should be like separate pages for each question with differences highlighted?
 * with a navbar at the top with question numbers to jump to each question and a next/prev
 */
export default function AMSTAR2Merge() {
  const params = useParams();
  const { getChecklist } = useAppStore();
  console.log('Route params:', decodeURIComponent(params.nameA), params.indexA, decodeURIComponent(params.nameB), params.indexB);

  // Load checklists based on route params
  const checklistA = getChecklist(decodeURIComponent(params.nameA), params.indexA);
  const checklistB = getChecklist(decodeURIComponent(params.nameB), params.indexB);
  console.log('Merging checklists:', checklistA, checklistB);

  // The merged checklist, initialized to checklistA or empty
  const [merged, setMerged] = createSignal({ ...checklistA });

  const questionKeys = [
    'q1',
    'q2',
    'q3',
    'q4',
    'q5',
    'q6',
    'q7',
    'q8',
    'q9a',
    'q9b',
    'q10',
    'q11a',
    'q11b',
    'q12',
    'q13',
    'q14',
    'q15',
    'q16',
  ];

  // compare answers (shallow for demo; deep compare for real use)
  function isDifferent(q) {
    const a = checklistA[q]?.answers;
    const b = checklistB[q]?.answers;
    return JSON.stringify(a) !== JSON.stringify(b);
  }

  // select value from A or B
  function selectFrom(which, q) {
    setMerged((m) => ({
      ...m,
      [q]: which === 'A' ? { ...checklistA[q] } : { ...checklistB[q] },
    }));
  }

  // save merged checklist
  function handleSave() {
    alert('not implemented');
  }

  return (
    <div class="max-w-5xl mx-auto p-6">
      <h2 class="text-xl font-bold mb-4">Merge AMSTAR2 Checklists</h2>
      <div class="grid grid-cols-3 gap-4 font-mono text-xs">
        <div class="font-bold text-center">Checklist A</div>
        <div class="font-bold text-center">Checklist B</div>
        <div class="font-bold text-center">Merged Result</div>
        <For each={questionKeys}>
          {(q) => (
            <div class="contents">
              {/* Checklist A */}
              <div class={`p-2 border ${isDifferent(q) ? 'bg-yellow-100' : ''}`}>
                <pre>{JSON.stringify(checklistA[q]?.answers, null, 1)}</pre>
                <Show when={isDifferent(q)}>
                  <button class="mt-1 text-blue-600 underline" onClick={() => selectFrom('A', q)}>
                    Use this
                  </button>
                </Show>
              </div>
              {/* Checklist B */}
              <div class={`p-2 border ${isDifferent(q) ? 'bg-yellow-100' : ''}`}>
                <pre>{JSON.stringify(checklistB[q]?.answers, null, 1)}</pre>
                <Show when={isDifferent(q)}>
                  <button class="mt-1 text-blue-600 underline" onClick={() => selectFrom('B', q)}>
                    Use this
                  </button>
                </Show>
              </div>
              {/* Merged */}
              <div class="p-2 border bg-green-50">
                <pre>{JSON.stringify(merged()[q]?.answers, null, 1)}</pre>
              </div>
            </div>
          )}
        </For>
      </div>
      <button class="mt-6 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSave}>
        Save Merged Checklist
      </button>
    </div>
  );
}
