import { useAppState } from './state.jsx';
import { useNavigate } from '@solidjs/router';

export default function AppDashboard() {
  const { projects, currentProject } = useAppState();
  const navigate = useNavigate();

  const handleProjectClick = (project) => {
    navigate(`/project/${project.id}`);
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
            </li>
          ))}
        </ul>
      }
    </div>
  );
}
