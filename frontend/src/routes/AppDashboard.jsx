import { createSignal, Show, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { createExampleProject } from '@offline/createExampleProject.js';
import { createProject } from '@api/projectService.js';
import { generateUUID } from '@offline/localDB.js';
import { solidStore } from '@offline/solidStore';
import { useAuth } from '@/auth/AuthStore.js';

export default function AppDashboard() {
  const { getProjectsForUser, deleteProject } = solidStore;
  const { user } = useAuth();

  const navigate = useNavigate();
  const [projectName, setProjectName] = createSignal('');

  const handleProjectClick = (project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleAddProject = async () => {
    if (!projectName().trim()) return;
    try {
      await createProject(projectName());
    } catch (error) {
      console.error('Error creating project:', error);
    }
    setProjectName('');
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(projectId);
    }
  };

  return (
    <div class="p-4">
      <h2 class="text-xl font-bold mb-3">Your Projects</h2>
      <Show
        when={user() && getProjectsForUser(user().id).length !== 0}
        fallback={<div class="text-sm text-gray-500">No projects found.</div>}
      >
        <ul class="space-y-1">
          <For each={getProjectsForUser(user().id)}>
            {(project) => (
              <li
                class={`p-2 border rounded cursor-pointer transition text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-100`}
                onClick={() => handleProjectClick(project)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleProjectClick(project);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Open project ${project.name}`}
              >
                <div>
                  <div class="font-medium">{project.name}</div>
                  <div class="text-xs text-gray-600">{project.description}</div>
                  <div class="text-xs text-gray-400">
                    Last updated: {new Date(project.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  class="ml-0 sm:ml-4 mt-2 sm:mt-0 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id);
                  }}
                >
                  Delete
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>

      <div class="mt-4 flex items-center gap-2">
        <input
          type="text"
          class="px-2 py-1 border rounded w-48 text-sm"
          placeholder="Project name"
          value={projectName()}
          onInput={(e) => setProjectName(e.target.value)}
        />
        <button
          class="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
          onClick={handleAddProject}
          disabled={!projectName().trim()}
        >
          + Add New Project
        </button>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <button
          class="px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm"
          onClick={async () => {
            const exampleProject = await createExampleProject();
            console.log('Loaded example project:', exampleProject);
            window.location.reload();
          }}
        >
          Load Example Project
        </button>
      </div>
    </div>
  );
}
