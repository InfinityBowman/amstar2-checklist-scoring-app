import { createSignal, createEffect, onCleanup, onMount, Show, For, Match } from 'solid-js';
import AMSTAR2Checklist from './AMSTAR2Checklist.jsx';
import {
  saveChecklist,
  getAllChecklists,
  deleteAllChecklists,
  generateUUID,
  deleteChecklist,
  saveProject,
  getAllProjects,
  getProject,
  deleteProject,
} from './LocalDB.js';
import AMSTARChecklist from './AMSTARChecklist.js';
import { ExportChecklist, ImportChecklist } from './ChecklistIO.js';
import Sidebar from './Sidebar.jsx';
import Dialog from './Dialog.jsx';
import Resizable from './Resizable.jsx';
import { createProject } from './Project.js';
import ProjectDashboard from './ProjectDashboard.jsx';

/**
 * TODO
 * Save review title, name, date for each checklist
 * Implement my own service worker instead of vite pwa
 * pdfs might need to be linked to or owned by checklists
 * ensure scorechecklist is correct
 * AMSTAR folder for all AMSTAR stuff
 * black and white export option for d3
 * finish handling of different projects
 * search pdf
 * 
 * Change from using checklists in the state to just using projects
 */
export default function App() {
  const [checklists, setChecklists] = createSignal([]);
  const [currentId, setCurrentId] = createSignal(null);
  const [currentChecklistState, setCurrentChecklistState] = createSignal(null);
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = createSignal(false);
  const [dialogOpen, setDialogOpen] = createSignal(false);
  const [pendingDeleteId, setPendingDeleteId] = createSignal(null);
  const [pdfUrl, setPdfUrl] = createSignal(null);
  const [project, setProject] = createSignal(null);
  const [projects, setProjects] = createSignal([]);

  let autosaveTimeout = null;

  // Load all projects and checklists on mount
  onMount(async () => {
    try {
      const all = await getAllChecklists();
      all.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setChecklists(all);
      setCurrentId(all.length > 0 ? all[0].id : null);

      const allProjects = await getAllProjects();
      console.log('All Projects:', allProjects);
      allProjects.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setProjects(allProjects);
    } catch (error) {
      console.error('Error loading checklists:', error);
    }
  });

  // Update currentChecklistState when currentId or checklists change
  createEffect(() => {
    const currentChecklistObj = checklists().find((c) => c.id === currentId());
    console.log(currentChecklistObj);
    if (currentChecklistObj) {
      setCurrentChecklistState(new AMSTARChecklist(currentChecklistObj));
    } else {
      setCurrentChecklistState(null);
    }
  });

  // Autosave effect: save whenever currentChecklistState changes
  createEffect(() => {
    const stateObj = currentChecklistState();
    if (!stateObj || !stateObj.state) return;

    // Clear existing timeout
    if (autosaveTimeout) {
      clearTimeout(autosaveTimeout);
      autosaveTimeout = null;
    }

    autosaveTimeout = setTimeout(async () => {
      try {
        const checklist = stateObj.state;
        await saveChecklist(JSON.parse(JSON.stringify(checklist)));

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

  // Handlers for delete all checklists dialog
  const handleDeleteAll = () => {
    setDeleteAllDialogOpen(true);
  };

  const confirmDeleteAll = async () => {
    try {
      await deleteAllChecklists();
      setChecklists([]);
      setCurrentId(null);
      setCurrentChecklistState(null);
      alert('All checklists deleted!');
    } catch (error) {
      console.error('Error removing all checklists:', error);
      alert('Error deleting checklists!');
    } finally {
      setDeleteAllDialogOpen(false);
    }
  };

  const cancelDeleteAll = () => setDeleteAllDialogOpen(false);

  // Handler to add a new checklist
  const handleAddChecklist = async () => {
    try {
      const newChecklist = {
        ...new AMSTARChecklist({ id: generateUUID(), createdAt: Date.now() }).state,
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
    setCurrentId(id);
    setProject(null);
  };

  // Handler to update checklist state from AMSTAR2Checklist
  const handleChecklistChange = (newState) => {
    const updatedState = new AMSTARChecklist(newState);
    setCurrentChecklistState(updatedState);

    // Update the checklists array with the new state
    setChecklists((prev) => {
      const idx = prev.findIndex((c) => c.id === updatedState.state.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...updatedState.state };
        return updated;
      }
      return prev;
    });
  };

  // Handler to delete a checklist by id
  const handleDeleteChecklist = (id) => {
    setPendingDeleteId(id);
    setDialogOpen(true);
  };

  // Handlers for the delete checklist dialog
  const confirmDelete = async () => {
    const id = pendingDeleteId();
    if (!id) return;
    try {
      await deleteChecklist(id);
      const updated = checklists().filter((c) => c.id !== id);
      setChecklists(updated);

      if (currentId() === id) {
        if (updated.length > 0) {
          setCurrentId(updated[0].id);
        } else {
          setCurrentId(null);
          setCurrentChecklistState(null);
        }
      }
    } catch (error) {
      console.error('Error deleting checklist:', error);
      alert('Error deleting checklist!');
    } finally {
      setDialogOpen(false);
      setPendingDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setDialogOpen(false);
    setPendingDeleteId(null);
  };

  // Handler to add a new project
  const handleAddProject = async () => {
    try {
      const newProject = {
        ...new createProject({ name: 'New Project1', id: generateUUID(), createdAt: Date.now(), checklists: checklists() }),
      };
      console.log('saving', newProject);
      await saveProject(newProject);
      const updated = await getAllProjects();
      updated.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setProjects(updated);
      setCurrentId(newProject.id);
    } catch (error) {
      console.error('Error adding new project:', error);
    }
  };

  const handleSelectProject = (project) => {
    setProject(project);
  };

  const handleExportCSV = () => {
    const stateObj = currentChecklistState();
    if (!stateObj || !stateObj.state) return;
    try {
      ExportChecklist(stateObj);
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
      const checklistState = new AMSTARChecklist();
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
    <div class="flex h-screen">
      <div>
        <Sidebar
          open={sidebarOpen()}
          onClose={() => setSidebarOpen(false)}
          onAddChecklist={handleAddChecklist}
          onDeleteAll={handleDeleteAll}
          onDeleteChecklist={handleDeleteChecklist}
          onExportCSV={handleExportCSV}
          onImportCSV={handleImportCSV}
          checklists={checklists()}
          projects={projects()}
          currentId={currentId()}
          currentChecklistState={currentChecklistState()}
          onSelectChecklist={handleSelectChecklist}
          onSelectProject={handleSelectProject}
        />
      </div>

      {/* Open sidebar button */}
      <Show when={!sidebarOpen()}>
        <button
          class="fixed top-4 left-4 z-40 bg-white/90 backdrop-blur-sm text-slate-700 p-3 rounded-xl shadow-lg border border-slate-200 hover:bg-white hover:shadow-xl transition-all duration-200 group"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </Show>

      {/* Mobile overlay backdrop */}
      <Show when={sidebarOpen()}>
        <div class="sm:hidden fixed inset-0 bg-black/50 z-20 transition-opacity duration-300" onClick={() => setSidebarOpen(false)} />
      </Show>

      {/* Project Dashboard */}
      <Show when={project()}>
        <div class="flex-1 h-screen overflow-y-auto">
          <ProjectDashboard project={project()} />
        </div>
      </Show>

      {/* Checklist */}
      <Show when={!project()}>
        <Show
          when={currentChecklistState() && currentChecklistState().state}
          fallback={<div class="p-8 text-center text-gray-600">No checklist selected.</div>}
        >
          <div class="flex-1 h-screen overflow-y-auto">
            <div class="p-4 border-b border-gray-100">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setPdfUrl(URL.createObjectURL(file));
                }}
              />
              {/* <input type="text" placeholder="PDF URL" onBlur={e => setPdfUrl(e.target.value)} /> */}
            </div>
            <AMSTAR2Checklist checklistState={currentChecklistState} onChecklistChange={handleChecklistChange} />
          </div>
        </Show>
      </Show>

      {/* PDF Viewer */}
      <Show when={pdfUrl()}>
        <Resizable direction="horizontal" min={250} max={1600} initial={500} position="left">
          <div class="h-full border-l border-gray-200 bg-white flex flex-col">
            <iframe src={pdfUrl()} class="w-full h-full" style="min-width:300px;" title="PDF Viewer" />
          </div>
        </Resizable>
      </Show>

      {/* Dialogs */}
      <Dialog
        open={dialogOpen()}
        title="Delete checklist?"
        description={`Are you sure you want to delete ${
          checklists().find((c) => c.id === pendingDeleteId()).title
        }? This action cannot be undone.`}
        confirmText="Delete"
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
      <Dialog
        open={deleteAllDialogOpen()}
        title="Delete all checklists?"
        description="Are you sure you want to delete all saved checklists? This action cannot be undone."
        confirmText="Delete all"
        onCancel={cancelDeleteAll}
        onConfirm={confirmDeleteAll}
      />
    </div>
  );
}
