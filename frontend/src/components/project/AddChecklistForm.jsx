import { createSignal } from 'solid-js';

export default function AddChecklistForm(props) {
  const [checklistName, setChecklistName] = createSignal('');

  const handleAddChecklist = async () => {
    if (!checklistName().trim()) return;
    await props.onAddChecklist(checklistName());
    setChecklistName('');
  };

  return (
    <div class="flex gap-2 mt-2">
      <input
        type="text"
        class="px-2 py-1 border rounded w-40 text-xs"
        placeholder="Checklist name"
        value={checklistName()}
        onInput={(e) => setChecklistName(e.target.value)}
      />
      <button
        class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
        onClick={handleAddChecklist}
        disabled={!checklistName().trim()}
      >
        + Checklist
      </button>
    </div>
  );
}
