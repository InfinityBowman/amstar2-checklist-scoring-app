import { createSignal, Show, For, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { createExampleProject } from '@offline/createExampleProject.js';
import { createProject } from '@api/projectService.js';
import { solidStore } from '@offline/solidStore';
import { useAuth } from '@/auth/AuthStore.js';

export default function AppDashboard() {
  const { projects, getProjectsForUser, deleteProject } = solidStore;
  const { user } = useAuth();

  const navigate = useNavigate();
  const [projectName, setProjectName] = createSignal('');
  const [userProjects, setUserProjects] = createSignal([]);

  createEffect(() => {
    if (user() && projects().length > 0) {
      setUserProjects(getProjectsForUser(user().id));
    }
  });

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
    <div class="mx-auto p-6 min-h-screen">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Projects</h1>
            <p class="text-gray-600 mt-1">Manage your projects</p>
          </div>
        </div>

        {/* Add New Project Section */}
        <div class="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 class="text-lg font-semibold text-blue-900 mb-3">Create New Project</h3>
          <div class="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              class="flex-1 px-4 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter project name..."
              value={projectName()}
              onInput={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && projectName().trim()) {
                  handleAddProject();
                }
              }}
            />
            <button
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddProject}
              disabled={!projectName().trim()}
            >
              <span class="mr-2">+</span>
              Create Project
            </button>
            <button
              class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              onClick={async () => {
                const exampleProject = await createExampleProject();
                console.log('Loaded example project:', exampleProject);
                window.location.reload();
              }}
            >
              Load Example
            </button>
          </div>
        </div>

        {/* Projects List */}
        <Show
          when={user() && userProjects().length !== 0}
          fallback={
            <div class="text-center py-12">
              <div class="text-gray-400 mb-4">
                <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p class="text-gray-500">Get started by creating your first project above.</p>
            </div>
          }
        >
          <div class="grid gap-4 md:grid-cols-2">
            <For each={getProjectsForUser(user().id)}>
              {(project) => (
                <div
                  class="group bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
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
                  <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                      <h3 class="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </h3>
                      <Show when={project.description}>
                        <p class="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                      </Show>
                    </div>
                    <button
                      class="ml-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      title="Delete project"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                  <div class="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span class="flex items-center">
                      <svg class="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Updated {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                    <span class="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Open →</span>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
}
