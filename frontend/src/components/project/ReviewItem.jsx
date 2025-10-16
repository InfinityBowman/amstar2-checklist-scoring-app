import ChecklistsSection from './ChecklistsSection';

export default function ReviewItem(props) {
  return (
    <li class="p-3">
      <div class="flex items-center justify-between">
        <div>
          <span class="font-semibold">{props.review.name}</span>
          <span class="ml-2 text-xs text-gray-400">
            Created: {new Date(props.review.createdAt).toLocaleDateString()}
          </span>
        </div>
        <button
          class="px-2 py-1 bg-red-400 text-white rounded hover:bg-red-500 text-xs"
          onClick={() => props.onDeleteReview(props.review.id)}
        >
          Delete Review
        </button>
      </div>
      <ChecklistsSection
        checklists={props.review.checklists}
        reviewId={props.review.id}
        onChecklistClick={props.onChecklistClick}
        onDeleteChecklist={props.onDeleteChecklist}
        onAddChecklist={props.onAddChecklist}
      />
    </li>
  );
}
