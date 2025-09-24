import { createSignal, createEffect, onCleanup, onMount, Show, For, Match } from 'solid-js';

import Sidebar from './Sidebar.jsx';
import Dialog from './components/Dialog.jsx';
import Resizable from './components/Resizable.jsx';
import { useAppState } from './AppState.jsx';
import Navbar from './Navbar.jsx';
import { useAuth } from './auth/AuthProvider.jsx';
import FullScreenLoader from './components/FullScreenLoader.jsx';

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
  const { authLoading } = useAuth();

  const {
    projects,
    dataLoading,
    loadData,
    setProjects,
    currentProject,
    addProject,
    deleteChecklist,
    currentChecklist,
    setCurrentChecklist,
    updateChecklist,
  } = useAppState();

  // Handlers for delete all checklists dialog
  const handleDeleteAll = () => {
    setDeleteAllDialogOpen(true);
  };

  const confirmDeleteAll = async () => {
    try {
      // await deleteAllChecklists();
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
    const pending = pendingDeleteId();
    if (pending && pending.projectId && pending.checklistId) {
      const project = projects().find((p) => p.id === pending.projectId);
      if (project) {
        const checklist = project.checklists.find((c) => c.id === pending.checklistId);
        if (checklist) {
          checklistName = checklist.title || checklist.name || 'Untitled Checklist';
        }
      }
    }
    return `Are you sure you want to delete ${checklistName}? This action cannot be undone.`;
  };

  const cancelDeleteAll = () => setDeleteAllDialogOpen(false);

  // Handler to delete a checklist by id
  const handleDeleteChecklist = (projectId, checklistId) => {
    console.log('Request to delete checklist id:', checklistId, 'from project:', projectId);
    setPendingDeleteId({ projectId, checklistId });
    setDialogOpen(true);
  };

  // Handlers for the delete checklist dialog
  const confirmDelete = async () => {
    const pending = pendingDeleteId();
    if (!pending || !pending.projectId || !pending.checklistId) return;
    try {
      console.log('Deleting checklist id:', pending.checklistId, 'from project:', pending.projectId);
      await deleteChecklist(pending.projectId, pending.checklistId);
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

  return (
    <div class="flex flex-col h-screen overflow-y-hidden">
      {/* Navbar at the top */}
      <Navbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} open={sidebarOpen()} />

      <div class="flex flex-1 h-0 min-h-0">
        <div>
          <Sidebar
            open={sidebarOpen()}
            onClose={() => setSidebarOpen(false)}
            setPdfUrl={setPdfUrl}
            onDeleteChecklist={handleDeleteChecklist}
          />
        </div>

        <Show when={!dataLoading() && !authLoading()} fallback={<div class="p-8 text-center">Loading projects...</div>}>
          <div class="flex-1 min-h-0 overflow-y-auto">{props.children}</div>
        </Show>

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
