import { For, createSignal } from 'solid-js';
import ChecklistItem from './ChecklistItem';

export default function ChecklistsSection(props) {
  const [checklistName, setChecklistName] = createSignal('');

  const handleAddChecklist = async () => {
    if (!checklistName().trim()) return;
    await props.onAddChecklist(props.reviewId, checklistName());
    setChecklistName('');
  };

  return (
    <div>
      {/* Checklists List */}
      <div class="space-y-1">
        <For each={props.checklists || []}>
          {(cl) => (
            <ChecklistItem
              checklist={cl}
              onChecklistClick={props.onChecklistClick}
              onDeleteChecklist={(checklistId) => props.onDeleteChecklist(checklistId)}
            />
          )}
        </For>

        {(!props.checklists || props.checklists.length === 0) && (
          <div class="text-center py-4 text-gray-500">
            <p class="text-xs">No checklists yet. Add one above to get started.</p>
          </div>
        )}
      </div>

      {/* Add New Checklist */}
      <div class="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
        <div class="flex gap-2">
          <input
            type="text"
            class="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Enter checklist name..."
            value={checklistName()}
            onInput={(e) => setChecklistName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && checklistName().trim()) {
                handleAddChecklist();
              }
            }}
          />
          <button
            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddChecklist}
            disabled={!checklistName().trim()}
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
