export default function ChecklistItem(props) {
  return (
    <li
      class="flex items-center justify-between border rounded px-2 py-1 bg-white hover:bg-blue-50 cursor-pointer"
      onClick={() => props.onChecklistClick(props.checklist)}
    >
      <span>
        <span class="font-semibold">{props.checklist.name}</span>
        <span class="ml-2 text-xs text-gray-600">
          Reviewer: {props.checklist.reviewerName || <span class="italic text-gray-400">Unassigned</span>}
        </span>
      </span>
      <button
        class="ml-2 px-2 py-0.5 bg-red-400 text-white rounded hover:bg-red-500 text-xs"
        onClick={(e) => {
          e.stopPropagation();
          props.onDeleteChecklist(props.checklist.id);
        }}
      >
        Delete
      </button>
    </li>
  );
}
