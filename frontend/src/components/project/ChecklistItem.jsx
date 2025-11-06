import { solidStore } from '@offline/solidStore.js';

export default function ChecklistItem(props) {
  const { getReviewerForChecklist } = solidStore;

  return (
    <li class="list-none p-0 m-0">
      <div class="flex items-center justify-between border rounded px-2 py-1 bg-white hover:bg-blue-50">
        <button
          class="flex-grow text-left bg-transparent border-0 cursor-pointer py-1"
          onClick={() => props.onChecklistClick(getReviewerForChecklist(props.checklist.id), props.checklist)}
        >
          <span class="font-semibold">{props.checklist.name}</span>
          <span class="ml-2 text-xs text-gray-600">
            Reviewer:{' '}
            {getReviewerForChecklist(props.checklist.id)?.name || <span class="italic text-gray-400">Unassigned</span>}
          </span>
        </button>
        <button
          class="ml-2 px-2 py-0.5 bg-red-400 text-white rounded hover:bg-red-500 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            props.onDeleteChecklist(props.checklist.id);
          }}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
