export default function ProjectHeader(props) {
  function handleCreateProject() {
    props.project
      .save()
      .then((newProject) => {
        console.log('Project created successfully:', newProject);
      })
      .catch((error) => {
        console.error('Failed to create project:', error);
      });
  }

  return (
    <div class="flex flex-wrap items-center justify-between mb-4 gap-2">
      <h2 class="text-xl font-bold">{props.project.name} Dashboard</h2>
      <div class="flex gap-2">
        <button
          onClick={handleCreateProject}
          class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
        >
          Upload Project
        </button>
        <button
          onClick={props.onManageMembers}
          class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition flex items-center"
        >
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          Manage Members
        </button>
        <button
          onClick={() => props.project.delete()}
          class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
        >
          Delete Project
        </button>
      </div>
    </div>
  );
}
