import { For } from 'solid-js';
import ChecklistItem from './ChecklistItem';

export default function ChecklistsSection(props) {
  const handleAddChecklist = async () => {
    await props.onAddChecklist(props.reviewId);
  };

  return (
    <div>
      {/* Checklists List */}
      <div class="space-y-1">
        <For each={props.checklists() || []}>
          {(cl) => (
            <ChecklistItem
              checklist={cl}
              onChecklistClick={props.onChecklistClick}
              onDeleteChecklist={(checklistId) => props.onDeleteChecklist(checklistId)}
            />
          )}
        </For>

        {(!props.checklists() || props.checklists().length === 0) && (
          <div class="text-center py-4 text-gray-500">
            <p class="text-xs">No checklists yet. Add one above to get started.</p>
          </div>
        )}
      </div>

      {/* Add New Checklist */}
      <div class="mt-3 p-2  rounded ">
        <div class="flex gap-2">
          <button
            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
            onClick={handleAddChecklist}
          >
            + Add Checklist
          </button>
        </div>
      </div>
    </div>
  );
}
