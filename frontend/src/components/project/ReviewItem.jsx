import ChecklistsSection from './ChecklistsSection';
import { solidStore } from '@offline/solidStore.js';

export default function ReviewItem(props) {
  const { getChecklistsForReview } = solidStore;
  const checklists = () => getChecklistsForReview(props.review.id);

  return (
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div class="px-4 py-2 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <h4 class="text-base font-semibold text-gray-900 truncate">{props.review.name}</h4>
          </div>
          <button
            class="ml-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            onClick={() => props.onDeleteReview()}
            title="Delete review"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <div class="p-4">
        <ChecklistsSection
          checklists={checklists()}
          reviewId={props.review.id}
          onChecklistClick={props.onChecklistClick}
          onDeleteChecklist={props.onDeleteChecklist}
          onAddChecklist={props.onAddChecklist}
        />
      </div>
    </div>
  );
}
