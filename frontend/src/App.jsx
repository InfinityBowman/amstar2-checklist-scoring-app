import { createSignal, Show } from 'solid-js';
import Sidebar from './Sidebar.jsx';
import Dialog from './components/Dialog.jsx';
import Resizable from './components/Resizable.jsx';
import { useAppStore } from './AppStore.js';
import Navbar from './Navbar.jsx';
import { useAuth } from './auth/AuthStore.js';
import { AnimatedShow } from './components/AnimatedShow.jsx';

/**
 * TODO
 * Save review title, name, date for each checklist
 * pdfs might need to be linked to or owned by checklists
 * black and white export option for d3
 * search pdf
 */
export default function App(props) {
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = createSignal(false);
  const [dialogOpen, setDialogOpen] = createSignal(false);
  const [pendingDeleteId, setPendingDeleteId] = createSignal(null);
  const [pdfUrl, setPdfUrl] = createSignal(null);
  const { authLoading } = useAuth();

  const { dataLoading, deleteChecklist, setCurrentChecklist, getChecklist } = useAppStore();

  // Handlers for delete all checklists dialog
  // const handleDeleteAll = () => {
  //   setDeleteAllDialogOpen(true);
  // };

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
    let checklist = getChecklist(pending.checklistId);
    if (checklist) {
      checklistName = checklist.name || checklist.title || 'Untitled Checklist';
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

  // When confirmed, delete the checklist
  const confirmDelete = async () => {
    const pending = pendingDeleteId();
    if (!pending || !pending.checklistId) return;
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

      <div class="flex flex-1 min-h-0">
        <Sidebar
          open={sidebarOpen()}
          onClose={() => setSidebarOpen(false)}
          setPdfUrl={setPdfUrl}
          onDeleteChecklist={handleDeleteChecklist}
        />

        {/* Main content area, fades in after page refresh */}
        <AnimatedShow class="flex flex-1" when={!dataLoading() && !authLoading()}>
          <div class="flex-1 min-h-0 overflow-y-auto">{props.children}</div>
        </AnimatedShow>

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
