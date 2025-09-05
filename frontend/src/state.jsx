import { createSignal, createContext, useContext } from 'solid-js';

const StateContext = createContext();

export function StateProvider(props) {
  const [projects, setProjects] = createSignal([]);
  const [currentProject, setCurrentProject] = createSignal(null);
  const [currentChecklist, setCurrentChecklist] = createSignal(null);

  // Helper: set current checklist and update project data
  function setChecklistAndUpdateProject(checklist) {
    // console.log('Setting current checklist:', checklist);
    setCurrentChecklist(checklist);

    if (!currentProject()) {
      projects().find((proj) => proj.checklists.some((c) => c.id === checklist.id)) &&
        setCurrentProject(projects().find((proj) => proj.checklists.some((c) => c.id === checklist.id))); // Update current project if not already
    }

    // If currentProject exists, update its checklists
    if (currentProject() && currentProject().id) {
      console.log('Updating project checklists for:', currentProject());
      setProjects((prev) =>
        prev.map((proj) =>
          proj.id === currentProject().id ?
            { ...proj, checklists: proj.checklists.map((c) => (c.id === checklist.id ? checklist : c)) }
          : proj,
        ),
      );
      // setCurrentProject((prev) =>
      //   prev ? { ...prev, checklists: prev.checklists.map((c) => (c.id === checklist.id ? checklist : c)) } : prev,
      // );
    }
  }

  // Helper: set current project and update current checklist
  function setProjectAndUpdateChecklist(project) {
    // console.log('Setting current project:', project);
    setCurrentProject(project);
    // Set currentChecklist to first checklist in project
    if (project && project.checklists && project.checklists.length > 0) {
      setCurrentChecklist(project.checklists[0]);
    } else {
      setCurrentChecklist(null);
    }
  }

  const state = {
    projects,
    setProjects,
    currentProject,
    setCurrentProject: setProjectAndUpdateChecklist,
    currentChecklist,
    setCurrentChecklist: setChecklistAndUpdateProject,
  };

  return <StateContext.Provider value={state}>{props.children}</StateContext.Provider>;
}

export function useAppState() {
  return useContext(StateContext);
}
