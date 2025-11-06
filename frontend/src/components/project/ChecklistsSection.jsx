import { For } from 'solid-js';
import ChecklistItem from './ChecklistItem';
import AddChecklistForm from './AddChecklistForm';

export default function ChecklistsSection(props) {
  return (
    <div class="mt-2">
      <h4 class="text-sm font-medium mb-1">Checklists</h4>
      <ul class="space-y-1">
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
          <li class="px-2 py-1 text-xs text-gray-400">No checklists yet.</li>
        )}
      </ul>
      <AddChecklistForm onAddChecklist={(name) => props.onAddChecklist(props.reviewId, name)} />
    </div>
  );
}
