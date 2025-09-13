import { createSignal } from 'solid-js';
import { useAppState } from './AppState.jsx';
import { useNavigate } from '@solidjs/router';
import { createExampleProject } from './offline/CreateExampleProject.js';
import { createProject } from './offline/Project.js';
import { generateUUID } from './offline/LocalDB.js';

export default function AppDashboard() {
  const { projects, currentProject, addProject, deleteProject } = useAppState();
  const navigate = useNavigate();
  const [projectName, setProjectName] = createSignal('');

  const handleProjectClick = (project) => {
    // navigate(`/project/${project.id}`);
    const matches = projects().filter((p) => p.name === project.name);
    const index = matches.findIndex((p) => p.id === project.id);
    navigate(`/project/${encodeURIComponent(project.name)}/${index}`);
  };

  const handleAddProject = async () => {
    if (!projectName().trim()) return;
    const newProject = await addProject(
      createProject({
        id: generateUUID(),
        name: projectName().trim(),
        createdAt: Date.now(),
        checklists: [],
      }),
    );
    setProjectName('');
    navigate(`/project/${newProject.id}`);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(projectId);
    }
  };

  return (
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Your Projects</h2>
      {projects().length === 0 ?
        <div>No projects found.</div>
      : <ul class="space-y-2">
          {projects().map((project) => (
            <li
              key={project.id}
              class={`p-4 border rounded cursor-pointer transition ${
                currentProject() && currentProject().id === project.id ? 'bg-blue-100 border-blue-400' : 'hover:bg-gray-100'
              }`}
              onClick={() => handleProjectClick(project)}
            >
              <div class="font-semibold">{project.name}</div>
              <div class="text-sm text-gray-600">{project.description}</div>
              <div class="text-xs text-gray-400">Created: {new Date(project.createdAt).toLocaleDateString()}</div>
              <button
                class="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={() => handleDeleteProject(project.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      }
      <div class="mt-6 flex items-center gap-2">
        <input
          type="text"
          class="px-3 py-2 border rounded w-64"
          placeholder="Project name"
          value={projectName()}
          onInput={(e) => setProjectName(e.target.value)}
        />
        <button
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          onClick={handleAddProject}
          disabled={!projectName().trim()}
        >
          + Add New Project
        </button>
      </div>
      <div class="mt-6">
        <button
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
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
