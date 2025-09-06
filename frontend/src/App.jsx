import { createSignal, createEffect, onCleanup, onMount, Show, For, Match } from 'solid-js';
import { deleteAllChecklists, generateUUID } from './offline/LocalDB.js';

// import { ExportChecklist, ImportChecklist } from './offline/ChecklistIO.js';
import Sidebar from './Sidebar.jsx';
import Dialog from './Dialog.jsx';
import Resizable from './Resizable.jsx';
import { createProject } from './Project.js';
import { useAppState } from './state.jsx';
import Navbar from './Navbar.jsx';

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
export default function App(props) {
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = createSignal(false);
  const [dialogOpen, setDialogOpen] = createSignal(false);
  const [pendingDeleteId, setPendingDeleteId] = createSignal(null);
  const [pdfUrl, setPdfUrl] = createSignal(null);

  const {
    projects,
    loading,
    loadProjects,
    setProjects,
    currentProject,
    addProject,
    removeChecklist,
    currentChecklist,
    setCurrentChecklist,
    updateChecklist,
  } = useAppState();

  // Load all projects and checklists on mount
  onMount(async () => {
    try {
      await loadProjects();
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  });

  // Handlers for delete all checklists dialog
  const handleDeleteAll = () => {
    setDeleteAllDialogOpen(true);
  };

  const confirmDeleteAll = async () => {
    try {
      await deleteAllChecklists();
      setCurrentChecklist(null);
      alert('All checklists deleted!');
    } catch (error) {
      console.error('Error removing all checklists:', error);
      alert('Error deleting checklists!');
    } finally {
      setDeleteAllDialogOpen(false);
    }
  };

  const deleteChecklistMessage = () => {
    let checklistName = 'this checklist';
    const project = projects().find((p) => p.checklists.some((c) => c.id === pendingDeleteId()));
    if (project) {
      const checklist = project.checklists.find((c) => c.id === pendingDeleteId());
      if (checklist) {
        checklistName = checklist.title || 'Untitled Checklist';
      }
    }
    return `Are you sure you want to delete ${checklistName}? This action cannot be undone.`;
  };

  const cancelDeleteAll = () => setDeleteAllDialogOpen(false);

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
      console.log('Deleting checklist id:', id);
      await removeChecklist(currentProject().id, id);
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
        ...new createProject({ name: 'New Project1', id: generateUUID(), createdAt: Date.now(), checklists: [] }),
      };
      console.log('saving', newProject);
      await addProject(newProject);
      // setCurrentId(newProject.id);
    } catch (error) {
      console.error('Error adding new project:', error);
    }
  };

  // const handleExportCSV = () => {
  //   const stateObj = currentChecklistState();
  //   if (!stateObj || !stateObj.state) return;
  //   try {
  //     ExportChecklist(stateObj);
  //   } catch (error) {
  //     console.error('Error exporting checklist:', error);
  //     alert('Error exporting checklist!');
  //   }
  // };

  // const handleImportCSV = async (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   try {
  //     const text = await file.text();
  //     const flat = ImportChecklist(text);
  //     // Create a new ChecklistState and import the flat object
  //     const checklistState = new AMSTARChecklist();
  //     checklistState.importFlat(flat);

  //     // Optionally, set title if present
  //     if (flat.title) checklistState.state.title = flat.title;

  //     // Save as a new checklist
  //     const newChecklist = {
  //       id: generateUUID(),
  //       createdAt: Date.now(),
  //       ...checklistState.state,
  //     };
  //     await saveChecklist(newChecklist);
  //     const updated = await getAllChecklists();
  //     updated.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  //     setChecklists(updated);
  //     setCurrentId(newChecklist.id);
  //   } catch (error) {
  //     console.error('Error importing checklist:', error);
  //     alert('Error importing checklist!');
  //   } finally {
  //     // Reset file input value so the same file can be imported again if needed
  //     event.target.value = '';
  //   }
  // };

  return (
    <div class="flex flex-col h-screen">
      {/* Navbar at the top */}
      <Navbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} open={sidebarOpen()} />

      <div class="flex flex-1 h-full">
        <div>
          <Sidebar
            open={sidebarOpen()}
            onClose={() => setSidebarOpen(false)}
            // onDeleteAll={handleDeleteAll}
            // onDeleteChecklist={handleDeleteChecklist}
            // onAddProject={handleAddProject}
          />
        </div>

        <div class="flex-1 h-full overflow-y-auto">
          <Show when={!loading()} fallback={<div class="p-8 text-center">Loading projects...</div>}>
            {props.children}
          </Show>
        </div>

        {/* Mobile overlay backdrop */}
        <Show when={sidebarOpen()}>
          <div class="sm:hidden fixed inset-0 bg-black/50 z-20 transition-opacity duration-300" onClick={() => setSidebarOpen(false)} />
        </Show>

        {/* PDF Viewer */}
        <Show when={pdfUrl()}>
          <Resizable direction="horizontal" min={250} max={1600} initial={500} position="left">
            <div class="h-full border-l border-gray-200 bg-white flex flex-col">
              <iframe src={pdfUrl()} class="w-full h-full" style="min-width:300px;" title="PDF Viewer" />
            </div>
          </Resizable>
        </Show>
      </div>

      {/* Dialogs */}
      <Dialog
        open={dialogOpen()}
        title="Delete checklist?"
        description={deleteChecklistMessage()}
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
