import { For } from 'solid-js';
import ReviewItem from './ReviewItem';

export default function ReviewsList(props) {
  return (
    <div class="mb-4">
      <h3 class="text-base font-semibold mb-1">Reviews &amp; Checklists</h3>
      <ul class="divide-y divide-gray-100 border rounded bg-white shadow-sm">
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
          <li class="px-4 py-2 text-xs text-gray-400">No reviews yet.</li>
        )}
      </ul>
    </div>
  );
}
