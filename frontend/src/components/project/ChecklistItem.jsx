import { solidStore } from '@offline/solidStore.js';
import { FiUser } from 'solid-icons/fi';

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  if (isToday) {
    // Show time in HH:MM am/pm
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    // Show date in locale format
    return date.toLocaleDateString();
  }
}

export default function ChecklistItem(props) {
  const { getReviewerForChecklist } = solidStore;
  const reviewer = getReviewerForChecklist(props.checklist.id);

  return (
    <div class="group bg-white border border-gray-200 rounded  hover:shadow-sm hover:border-blue-300 transition-all duration-200">
      <div class="flex items-center justify-between">
        <button
          class="flex-1 text-left min-w-0 p-2 cursor-pointer"
          onClick={() => props.onChecklistClick(reviewer, props.checklist)}
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center text-xs text-gray-500">
              <FiUser class="w-4 h-4 mr-2 text-gray-500" />
              Reviewer: {reviewer?.name || <span class="italic text-gray-400">Unassigned</span>}
              <span class="ml-3">Updated: {formatDate(props.checklist.updated_at)}</span>
            </div>
            <span class="ml-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs">Open →</span>
          </div>
        </button>

        <button
          class="ml-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            props.onDeleteChecklist(props.checklist.id);
          }}
          title="Delete checklist"
        >
          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
