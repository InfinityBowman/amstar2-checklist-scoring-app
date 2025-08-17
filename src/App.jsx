import { createSignal, createEffect, onCleanup, onMount, Show } from 'solid-js';
import AMSTAR2Checklist from './AMSTAR2Checklist.jsx';
import { saveChecklist, getAllChecklists, removeAllChecklists, generateUUID, deleteChecklist } from './db.js';
import ChecklistState from './ChecklistState.js';
import { ExportChecklist, ImportChecklist } from './ChecklistIO.js';
import SharedCheckbox from './Shared.jsx';

/**
 * TODO
 * Save review title, name, date for each checklist
 * Initialize all options to 'No' on new checklists
 * Implement my own service worker instead of vite pwa
 */
export default function App() {
  const [checklists, setChecklists] = createSignal([]);
  const [currentId, setCurrentId] = createSignal(null);
  const [currentChecklistState, setCurrentChecklistState] = createSignal(null);
  const [sharedTab, setSharedTab] = createSignal(false);
  let autosaveTimeout = null;

  // Load all checklists on mount
  onMount(async () => {
    try {
      const all = await getAllChecklists();
      all.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setChecklists(all);
      setCurrentId(all.length > 0 ? all[0].id : null);
    } catch (error) {
      console.error('Error loading checklists:', error);
    }
  });

  // Update currentChecklistState when currentId or checklists change
  createEffect(() => {
    const currentChecklistObj = checklists().find((c) => c.id === currentId());
    setCurrentChecklistState(currentChecklistObj ? new ChecklistState(currentChecklistObj) : null);
  });

  // Autosave effect: save whenever currentChecklistState changes
  createEffect(() => {
    if (!currentChecklistState()) return;

    // Clear existing timeout
    if (autosaveTimeout) {
      clearTimeout(autosaveTimeout);
      autosaveTimeout = null;
    }

    autosaveTimeout = setTimeout(async () => {
      try {
        const checklist = {
          id: currentChecklistState().state.id || generateUUID(),
          createdAt: currentChecklistState().state.createdAt || Date.now(),
          ...currentChecklistState().state,
        };
        await saveChecklist(checklist);

        setChecklists((prev) => {
          const idx = prev.findIndex((c) => c.id === checklist.id);
          if (idx === -1) {
            // New checklist
            const updated = [...prev, checklist];
            updated.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            return updated;
          } else if (JSON.stringify(prev[idx]) !== JSON.stringify(checklist)) {
            // Changed checklist
            const updated = [...prev];
            updated[idx] = checklist;
            return updated;
          }
          // No change
          return prev;
        });

        setCurrentId((prevId) => prevId || checklist.id);
      } catch (error) {
        console.error('Error saving checklist:', error);
      }
      autosaveTimeout = null;
    }, 400);
  });

  // Cleanup timeout on component unmount
  onCleanup(() => {
    if (autosaveTimeout) {
      clearTimeout(autosaveTimeout);
    }
  });

  // Handler to clear all checklists
  const handleRemoveAll = async () => {
    if (window.confirm('Are you sure you want to delete all saved checklists?')) {
      try {
        await removeAllChecklists();
        setChecklists([]);
        setCurrentId(null);
        setCurrentChecklistState(null);
        alert('All checklists deleted!');
      } catch (error) {
        console.error('Error removing all checklists:', error);
        alert('Error deleting checklists!');
      }
    }
  };

  // Handler to add a new checklist
  const handleAddChecklist = async () => {
    try {
      const newChecklist = {
        id: generateUUID(),
        createdAt: Date.now(),
        ...new ChecklistState().state,
      };
      await saveChecklist(newChecklist);
      const updated = await getAllChecklists();
      updated.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setChecklists(updated);
      setCurrentId(newChecklist.id);
    } catch (error) {
      console.error('Error adding new checklist:', error);
    }
  };

  // Handler to switch between checklists
  const handleSelectChecklist = (id) => {
    console.log('handleselectchecklist');
    setCurrentId(id);
  };

  // Handler to update checklist state from AMSTAR2Checklist
  const handleChecklistChange = (newState) => {
    console.log('handlecheckchange');
    setCurrentChecklistState(new ChecklistState(newState));
  };

  // Handler to delete the currently selected checklist
  const handleDeleteCurrentChecklist = async () => {
    if (!currentId()) return;
    if (window.confirm('Are you sure you want to delete this checklist?')) {
      try {
        await deleteChecklist(currentId());
        const updated = checklists().filter((c) => c.id !== currentId());
        setChecklists(updated);
        if (updated.length > 0) {
          setCurrentId(updated[0].id);
        } else {
          setCurrentId(null);
          setCurrentChecklistState(null);
        }
      } catch (error) {
        console.error('Error deleting checklist:', error);
        alert('Error deleting checklist!');
      }
    }
  };

  const handleExportCSV = () => {
    if (!currentChecklistState()) return;
    try {
      ExportChecklist(currentChecklistState());
    } catch (error) {
      console.error('Error exporting checklist:', error);
      alert('Error exporting checklist!');
    }
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const flat = ImportChecklist(text);
      // Create a new ChecklistState and import the flat object
      const checklistState = new ChecklistState();
      checklistState.importFlat(flat);

      // Optionally, set title if present
      if (flat.title) checklistState.state.title = flat.title;

      // Save as a new checklist
      const newChecklist = {
        id: generateUUID(),
        createdAt: Date.now(),
        ...checklistState.state,
      };
      await saveChecklist(newChecklist);
      const updated = await getAllChecklists();
      updated.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setChecklists(updated);
      setCurrentId(newChecklist.id);
    } catch (error) {
      console.error('Error importing checklist:', error);
      alert('Error importing checklist!');
    } finally {
      // Reset file input value so the same file can be imported again if needed
      event.target.value = '';
    }
  };

  return (
    <div>
      <div class="flex flex-wrap gap-2 justify-center my-4">
        <button
          onClick={handleAddChecklist}
          class="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
        >
          + New Checklist
        </button>
        <button
          onClick={handleRemoveAll}
          class="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition"
        >
          Clear All Data
        </button>
        <button
          onClick={handleDeleteCurrentChecklist}
          disabled={!currentId()}
          class="bg-yellow-600 text-white px-4 py-2 rounded shadow hover:bg-yellow-700 transition disabled:opacity-50"
        >
          Delete This Checklist
        </button>
        <button
          onClick={handleExportCSV}
          disabled={!currentChecklistState()}
          class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition disabled:opacity-50"
        >
          Export as CSV
        </button>
        <button
          onClick={() => setSharedTab(!sharedTab())}
          class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          Toggle Shared
        </button>
        <label class="bg-blue-100 text-blue-800 px-4 py-2 rounded shadow hover:bg-blue-200 transition cursor-pointer">
          Import CSV
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleImportCSV}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      <div class="flex flex-wrap gap-2 justify-center mb-6">
        {checklists().map((c, idx) => (
          <button
            onClick={() => handleSelectChecklist(c.id)}
            class={`px-3 py-1 rounded border ${
              c.id === currentId() ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'
            }`}
            title={new Date(c.createdAt).toLocaleString()}
          >
            {c.title && c.title.trim() !== '' ? c.title : `Review ${idx + 1}`}{' '}
          </button>
        ))}
      </div>
      <Show when={sharedTab()}>
        <SharedCheckbox />
      </Show>
      <Show
        when={currentChecklistState() && !sharedTab()}
        fallback={<div class="p-8 text-center text-gray-600">No checklist selected.</div>}
      >
        <AMSTAR2Checklist
          checklistState={currentChecklistState()}
          onChecklistChange={handleChecklistChange}
        />
      </Show>
    </div>
  );
}
