import AMSTARRobvis from '../charts/AMSTARRobvis.jsx';
import AMSTARDistribution from '../charts/AMSTARDistribution.jsx';
import { useAppState } from '../AppState.jsx';
import { createEffect, Show, createSignal } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import AMSTAR2Checklist from '../offline/AMSTAR2Checklist.js';

/**
 * This will be a dashboard for a project
 * a project holds many reviews (checklists)
 *
 * Currently uses fake data for the charts, TODO: change to use actual checklist data
 */

export default function ProjectDashboard() {
  const { currentProject, setCurrentProject, addChecklist, deleteProject } = useAppState();
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
      // Go back to dashboard
      navigate(`/dashboard`);
    }
  });

  const handleAddChecklist = async () => {
    if (!checklistName().trim()) return;
    const checklist = AMSTAR2Checklist.CreateChecklist({
      name: checklistName(),
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    });
    await addChecklist(currentProject().id, checklist);
    setChecklistName('');
  };

  const handleChecklistExport = () => {
    let csv = AMSTAR2Checklist.exportChecklistsToCSV(currentProject().checklists);
    console.log(csv);
  };

  createEffect(() => {
    // Set checklist data for charts
    const data = (currentProject()?.checklists || []).map((cl) => {
      const answersObj = AMSTAR2Checklist.getAnswers(cl);
      return {
        label: cl.name || cl.title || cl.id,
        questions: Object.values(answersObj || {}),
      };
    });
    // console.log('Checklist data for charts:', data, currentProject()?.checklists);
    setChecklistData(data);
  });

  return (
    <Show when={currentProject()} fallback={<div class="p-8">Project not found.</div>}>
      <div class="p-8">
        <h2 class="text2xl font-bold mb-4">{currentProject().name} Dashboard</h2>
        <button
          onClick={() => deleteProject(currentProject().id)}
          class="bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 transition"
        >
          Delete Project
        </button>
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
              class="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
              onClick={handleAddChecklist}
              disabled={!checklistName().trim()}
            >
              + Add Checklist
            </button>
          </div>
        </div>
        <div class="mb-4">
          <h3 class="text-base font-semibold mb-1">Checklists</h3>
          <ul class="list-disc pl-5 space-y-1 text-sm">
            {(currentProject().checklists || []).map((cl) => (
              <li key={cl.id}>{cl.name || cl.title || cl.id}</li>
            ))}
          </ul>
        </div>
        <div class="mb-4 flex gap-2">
          <button class="px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm" onClick={handleChecklistExport}>
            Export Checklists CSV
          </button>
        </div>
        <AMSTARRobvis data={checklistData()} width={700} height={500} />
        <AMSTARDistribution data={checklistData()} width={700} height={500} />
      </div>
    </Show>
  );
}
