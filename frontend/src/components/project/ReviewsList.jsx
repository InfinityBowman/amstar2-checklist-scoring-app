import { For } from 'solid-js';
import ReviewItem from './ReviewItem';

export default function ReviewsList(props) {
  return (
    <div class="mb-6">
      <div class="flex items-center mb-3">
        <h3 class="text-lg font-semibold text-gray-900">Reviews</h3>
        <div class="ml-auto">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {props.reviews?.length || 0} reviews
          </span>
        </div>
      </div>

      <div class="space-y-3">
        <For each={props.reviews || []}>
          {(review) => (
            <ReviewItem
              review={review}
              onDeleteReview={() => props.onDeleteReview(review.id)}
              onChecklistClick={props.onChecklistClick}
              onDeleteChecklist={props.onDeleteChecklist}
              onAddChecklist={props.onAddChecklist}
            />
          )}
        </For>

        {(!props.reviews || props.reviews.length === 0) && (
          <div class="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div class="text-gray-400 mb-3">
              <svg class="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h4 class="text-base font-medium text-gray-900 mb-1">No reviews yet</h4>
            <p class="text-sm text-gray-500">Add your first review to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
