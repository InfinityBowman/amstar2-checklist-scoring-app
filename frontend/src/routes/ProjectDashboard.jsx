import AMSTARRobvis from '../charts/AMSTARRobvis.jsx';
import AMSTARDistribution from '../charts/AMSTARDistribution.jsx';
import { useAppState } from '../AppState.jsx';
import { createEffect, Show, createSignal } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import AMSTAR2Checklist from '../AMSTAR2Checklist.js';

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
        <h2 class="text-2xl font-bold mb-4">{currentProject().name} Dashboard</h2>
        <button onClick={() => deleteProject(currentProject().id)} class="bg-red-500 text-white px-4 py-2 rounded">
          Delete Project
        </button>
        <div class="mb-4 text-gray-600">Created: {new Date(currentProject().createdAt).toLocaleDateString()}</div>
        <div class="mb-6">
          <strong>Total Checklists:</strong> {currentProject().checklists?.length || 0}
        </div>
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">Add New Checklist</h3>
          <div class="flex gap-2 items-center">
            <input
              type="text"
              class="px-3 py-2 border rounded w-64"
              placeholder="Checklist name"
              value={checklistName()}
              onInput={(e) => setChecklistName(e.target.value)}
            />
            <button
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              onClick={handleAddChecklist}
              disabled={!checklistName().trim()}
            >
              + Add Checklist
            </button>
          </div>
        </div>
        <div>
          <h3 class="text-xl font-semibold mb-2">Checklists</h3>
          <ul class="list-disc pl-6">
            {(currentProject().checklists || []).map((cl) => (
              <li key={cl.id}>{cl.name || cl.title || cl.id}</li>
            ))}
          </ul>
        </div>
        <AMSTARRobvis data={checklistData()} width={900} height={600} />
        <AMSTARDistribution data={checklistData()} width={900} height={600} />
      </div>
    </Show>
  );
}
