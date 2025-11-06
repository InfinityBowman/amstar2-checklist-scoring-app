import { createSignal, Show, For } from 'solid-js';
import { useAppStore } from '@/AppStore.js';
import { useNavigate } from '@solidjs/router';
import { createExampleProject } from '@offline/createExampleProject.js';
import { createProject } from '@offline/project.js';
import { generateUUID } from '@offline/localDB.js';
import { slugify } from './Routes.jsx';

export default function AppDashboard() {
  const { projects, currentProject, addProject, deleteProject } = useAppStore();
  const navigate = useNavigate();
  const [projectName, setProjectName] = createSignal('');

  const handleProjectClick = (project) => {
    const slug = slugify(project.name);
    navigate(`/projects/${slug}-${project.id}`);
  };

  const handleAddProject = async () => {
    if (!projectName().trim()) return;
    const newProject = await addProject(
      createProject({
        id: await generateUUID(),
        name: projectName().trim(),
        createdAt: Date.now(),
        checklists: [],
      }),
    );
    setProjectName('');
    handleProjectClick(newProject);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(projectId);
    }
  };

  return (
    <div class="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800">📁 Your Projects</h1>
          <p class="text-sm text-gray-500">Manage and explore your projects easily</p>
        </div>
        <div class="mt-4 sm:mt-0 flex gap-2">
          <input
            type="text"
            class="px-3 py-2 border border-gray-300 rounded-lg w-56 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="New project name"
            value={projectName()}
            onInput={(e) => setProjectName(e.target.value)}
          />
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            onClick={handleAddProject}
            disabled={!projectName().trim()}
          >
            + Create
          </button>
        </div>
      </div>

      {/* Project list */}
      <Show
        when={projects().length > 0}
        fallback={
          <div class="text-gray-500 text-center py-10 border border-dashed border-gray-300 rounded-lg bg-white">
            No projects yet. Start by creating one above!
          </div>
        }
      >
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <For each={projects()}>
            {(project) => (
              <div
                class={`p-5 rounded-xl border bg-white shadow-sm cursor-pointer transition hover:shadow-md ${
                  currentProject() && currentProject().id === project.id ?
                    'border-blue-400 bg-blue-50'
                  : 'border-gray-200'
                }`}
                onClick={() => handleProjectClick(project)}
              >
                <div class="flex items-start justify-between">
                  <h3 class="text-lg font-medium text-gray-800">{project.name}</h3>
                  <button
                    class="text-red-500 hover:text-red-700 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                <p class="text-sm text-gray-600 mt-2 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Example project */}
      <div class="mt-10 text-center">
        <button
          class="px-5 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition text-sm"
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
