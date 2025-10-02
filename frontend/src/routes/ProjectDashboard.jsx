import AMSTARRobvis from '../charts/AMSTARRobvis.jsx';
import AMSTARDistribution from '../charts/AMSTARDistribution.jsx';
import { useAppState } from '../AppState.jsx';
import { createEffect, Show, createSignal } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { createChecklist, getAnswers, exportChecklistsToCSV } from '../offline/AMSTAR2Checklist.js';
import { uploadAndStoreFile, getStoredFile } from '../offline/fileStorage.js';

export default function ProjectDashboard() {
  const { currentProject, setCurrentProject, addChecklist, deleteProject, getChecklistIndex } = useAppState();
  const params = useParams();
  const navigate = useNavigate();
  const [checklistName, setChecklistName] = createSignal('');
  const [checklistData, setChecklistData] = createSignal([]);

  createEffect(() => {
    if (params.name && params.index !== undefined) {
      const projectName = decodeURIComponent(params.name);
      const projectIndex = Number(params.index);
      setCurrentProject({ name: projectName, index: projectIndex });
    }
    if (!currentProject()) {
      console.warn('ProjectDashboard: No current project found for', params.name, params.index);
      navigate(`/dashboard`);
    }
  });

  const handleAddChecklist = async () => {
    if (!checklistName().trim()) return;
    const checklist = createChecklist({
      name: checklistName(),
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    });
    await addChecklist(currentProject().id, checklist);
    setChecklistName('');
  };

  const handleChecklistExport = () => {
    let csv = exportChecklistsToCSV(currentProject().checklists);
    console.log(csv);
  };

  const questionOrder = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15', 'q16'];

  createEffect(() => {
    const data = (currentProject()?.checklists || []).map((cl) => {
      const answersObj = getAnswers(cl);

      return {
        label: cl.name || cl.title || cl.id,
        questions: questionOrder.map((q) => answersObj[q]),
      };
    });
    setChecklistData(data);
  });

  const handleGetStoredFile = async () => {
    const fileName = prompt('Enter the name of the file to retrieve (including extension):');
    if (!fileName) return;
    try {
      const file = await getStoredFile(fileName);
      if (!file) {
        alert(`File "${fileName}" not found.`);
        return;
      }
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name || fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error retrieving file:', error);
      alert('Error retrieving file. See console for details.');
    }
  };

  const handleDisplayStoredFile = async () => {
    const fileName = prompt('Enter the name of the PDF file to display (including .pdf):');
    if (!fileName) return;
    try {
      const file = await getStoredFile(fileName);
      if (!file) {
        alert(`File "${fileName}" not found.`);
        return;
      }
      // Only display if it's a PDF
      if (file.type !== 'application/pdf' && !fileName.toLowerCase().endsWith('.pdf')) {
        alert('Selected file is not a PDF.');
        return;
      }
      const url = URL.createObjectURL(file);
      // Open in a new tab using the browser's PDF viewer
      window.open(url, '_blank');
      // Revoke the URL after some time since this is an example implementation
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('Error displaying file:', error);
      alert('Error displaying file. See console for details.');
    }
  };

  return (
    <Show when={currentProject()} fallback={<div class="p-8">Project not found.</div>}>
      <div class="p-6 max-w-4xl mx-auto">
        <div class="flex flex-wrap items-center justify-between mb-4 gap-2">
          <h2 class="text-xl font-bold">{currentProject().name} Dashboard</h2>
          <button
            onClick={() => deleteProject(currentProject().id)}
            class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
          >
            Delete Project
          </button>
        </div>
        <div class="mb-2 text-xs text-gray-500">Created: {new Date(currentProject().createdAt).toLocaleDateString()}</div>
        <div class="mb-3 text-sm">
          <strong>Total Checklists:</strong> {currentProject().checklists?.length || 0}
        </div>
        <div class="mb-4">
          <h3 class="text-base font-semibold mb-1">Add New Checklist</h3>
          <div class="flex gap-2 items-center">
            <input
              type="text"
              class="px-2 py-1 border rounded w-48 text-sm"
              placeholder="Checklist name"
              value={checklistName()}
              onInput={(e) => setChecklistName(e.target.value)}
            />
            <button
              class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
              onClick={handleAddChecklist}
              disabled={!checklistName().trim()}
            >
              + Add Checklist
            </button>
          </div>
        </div>
        <div class="mb-4">
          <h3 class="text-base font-semibold mb-1">Checklists</h3>
          <ul class="divide-y divide-gray-100 border rounded bg-white shadow-sm">
            {(currentProject().checklists || []).map((cl) => (
              <li
                key={cl.id}
                class="flex items-center justify-between px-4 py-2 hover:bg-blue-50 transition cursor-pointer"
                onClick={() => navigate(`/checklist/${encodeURIComponent(cl.name)}/${getChecklistIndex(cl.id, cl.name)}`)}
                tabIndex={0}
                role="button"
                aria-label={`Open checklist ${cl.name || cl.title || cl.id}`}
              >
                <div>
                  <div class="font-medium text-sm">{cl.name || cl.title || cl.id}</div>
                  <div class="text-xs text-gray-500">Created: {new Date(cl.createdAt).toLocaleDateString()}</div>
                </div>
                <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </li>
            ))}
            {(!currentProject().checklists || currentProject().checklists.length === 0) && (
              <li class="px-4 py-2 text-xs text-gray-400">No checklists yet.</li>
            )}
          </ul>
        </div>
        <div class="mb-4 flex gap-2">
          <button class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm" onClick={handleChecklistExport}>
            Export Checklists CSV
          </button>
          <button class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm" onClick={uploadAndStoreFile}>
            Upload file
          </button>
          <button class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm" onClick={handleGetStoredFile}>
            Download File
          </button>
          <button class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm" onClick={handleDisplayStoredFile}>
            Display File
          </button>
        </div>
        <div class="mb-6">
          <AMSTARRobvis data={checklistData()} />
        </div>
        <div>
          <AMSTARDistribution data={checklistData()} />
        </div>
      </div>
    </Show>
  );
}
