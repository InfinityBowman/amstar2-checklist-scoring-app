import { useEffect, useState } from 'preact/hooks';
import AMSTAR2Checklist from './AMSTAR2Checklist.jsx';
import { saveChecklist, getAllChecklists, removeAllChecklists, generateUUID } from './db.js';
import ChecklistState from './ChecklistState.js';

export default function App() {
  const [checklistState, setChecklistState] = useState(null);

  // Load the oldest checklist on mount
  useEffect(() => {
    getAllChecklists().then((all) => {
      if (all.length > 0) {
        console.log('Loaded checklists from IndexedDB:', all);
        // Sort by createdAt ascending, load the oldest
        all.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        setChecklistState(new ChecklistState(all[0]));
      } else {
        console.log('No checklists found, initializing new state');
        setChecklistState(new ChecklistState());
      }
    });
  }, []);

  // Handler to save checklist to IndexedDB
  const handleSave = async () => {
    if (!checklistState) return;
    const checklist = {
      id: checklistState.state.id || generateUUID(),
      createdAt: checklistState.state.createdAt || Date.now(),
      ...checklistState.state,
    };
    await saveChecklist(checklist);
    alert('Checklist saved!');
  };

  // Handler to clear all checklists
  const handleRemoveAll = async () => {
    if (window.confirm('Are you sure you want to delete all saved checklists?')) {
      await removeAllChecklists();
      setChecklistState(new ChecklistState());
      alert('All checklists deleted!');
    }
  };

  if (!checklistState) {
    return <div className="p-8 text-center text-gray-600">Loading checklist...</div>;
  }

  // clicking next/back will load new state from indexedDB
  return (
    <div>
      <AMSTAR2Checklist checklistState={checklistState} />
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          Save Checklist
        </button>

        {/* Warning this action is irreversible */}
        <button
          onClick={handleRemoveAll}
          className="bg-red-600 text-white px-6 py-2 rounded shadow hover:bg-red-700 transition"
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
}
