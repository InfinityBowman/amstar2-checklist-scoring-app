import AMSTARRobvis from '../charts/AMSTARRobvis.jsx';
import AMSTARDistribution from '../charts/AMSTARDistribution.jsx';
import { useAppState } from '../state.jsx';
import { createEffect, Show } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';

/**
 * This will be a dashboard for a project
 * a project holds many reviews (checklists)
 */

export default function ProjectDashboard({ onDeleteProject }) {
  const { currentProject, setCurrentProject } = useAppState();
  const params = useParams();
  const navigate = useNavigate();

  createEffect(() => {
    if (params.id) {
      setCurrentProject(params.id);
    }
    if (!currentProject()) {
      console.warn('ProjectDashboard: No current project found for id', params.id);
      // Go back to dashboard
      navigate(`/dashboard`);
    }
  });

  let sampleData = [
    {
      label: 'Review 1',
      questions: [
        'yes',
        'partial yes',
        'no',
        'no ma',
        'yes',
        'yes',
        'partial yes',
        'no',
        'yes',
        'partial yes',
        'no',
        'no ma',
        'yes',
        'partial yes',
        'no',
        'invalid',
      ],
    },
    {
      label: 'Review 2',
      questions: [
        'partial yes',
        'partial yes',
        'yes',
        'no',
        'yes',
        'no',
        'partial yes',
        'yes',
        'no',
        'partial yes',
        'yes',
        'no',
        'yes',
        'partial yes',
        'no',
        'yes',
      ],
    },
    {
      label: 'Review 3',
      questions: [
        'yes',
        'yes',
        'partial yes',
        'no',
        'no ma',
        'yes',
        'partial yes',
        'no',
        'yes',
        'partial yes',
        'no',
        'no ma',
        'yes',
        'partial yes',
        'no',
        'yes',
      ],
    },
    {
      label: 'Review 4',
      questions: [
        'no',
        'no',
        'no ma',
        'partial yes',
        'yes',
        'yes',
        'partial yes',
        'no',
        'yes',
        'partial yes',
        'no',
        'no ma',
        'yes',
        'partial yes',
        'no',
        'yes',
      ],
    },
    {
      label: 'Review 5',
      questions: [
        'partial yes',
        'yes',
        'yes',
        'yes',
        'partial yes',
        'no',
        'no ma',
        'yes',
        'partial yes',
        'no',
        'yes',
        'partial yes',
        'no',
        'no ma',
        'yes',
        'yes',
      ],
    },
    {
      label: 'Review 6',
      questions: [
        'no ma',
        'no',
        'partial yes',
        'yes',
        'yes',
        'partial yes',
        'no',
        'yes',
        'partial yes',
        'no',
        'yes',
        'partial yes',
        'no',
        'no ma',
        'yes',
        'yes',
      ],
    },
  ];

  return (
    <Show when={currentProject()} fallback={<div class="p-8">Project not found.</div>}>
      <div class="p-8">
        <h2 class="text-2xl font-bold mb-4">{currentProject().name} Dashboard</h2>
        <button onClick={() => onDeleteProject(currentProject().id)} class="bg-red-500 text-white px-4 py-2 rounded">
          Delete Project
        </button>
        <div class="mb-4 text-gray-600">Created: {new Date(currentProject().createdAt).toLocaleDateString()}</div>
        <div class="mb-6">
          <strong>Total Checklists:</strong> {currentProject().checklists?.length || 0}
        </div>
        <div>
          <h3 class="text-xl font-semibold mb-2">Checklists</h3>
          <ul class="list-disc pl-6">
            {(currentProject().checklists || []).map((cl) => (
              <li key={cl.id}>{cl.title || cl.name || cl.id}</li>
            ))}
          </ul>
        </div>
        <AMSTARRobvis data={sampleData} width={900} height={600} />
        <AMSTARDistribution data={sampleData} width={900} height={600} />
      </div>
    </Show>
  );
}
