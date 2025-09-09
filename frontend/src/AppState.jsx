import { createStore } from 'solid-js/store';
import { createContext, useContext } from 'solid-js';
import {
  saveProject as saveProjectToDB,
  getAllProjects,
  getProject,
  deleteProject as deleteProjectFromDB,
  deleteChecklistFromProject,
  saveChecklistToProject,
} from './offline/LocalDB.js';

const StateContext = createContext();

export function StateProvider(props) {
  const [state, setState] = createStore({
    projects: [],
    currentProject: null,
    currentChecklist: null,
    loading: true,
  });

  // Load all projects from IndexedDB
  async function loadProjects() {
    try {
      setState('loading', true);
      const allProjects = await getAllProjects();
      allProjects.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setState('projects', allProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      throw error;
    } finally {
      setState('loading', false);
    }
  }

  // Add a new project to both state and IndexedDB
  async function addProject(project) {
    try {
      await saveProjectToDB(project);
      setState('projects', (prev) => [...prev, project]);
      return project;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  }

  // Delete a project from both state and IndexedDB
  async function deleteProject(projectId) {
    try {
      await deleteProjectFromDB(projectId);
      setState('projects', (prev) => prev.filter((p) => p.id !== projectId));

      // If current project was deleted, reset current selections
      if (state.currentProject?.id === projectId) {
        setState('currentProject', null);
        setState('currentChecklist', null);
      }
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  function setProjects(newProjects) {
    setState('projects', newProjects);
  }

  function setCurrentProject(projectOrId) {
    let project = projectOrId;
    if (typeof projectOrId === 'string') {
      project = state.projects.find((p) => p.id === projectOrId);
    }
    project = project ? { ...project } : null; // Create a new object to avoid reference issues
    setState('currentProject', project);
    setState('currentChecklist', { ...(project?.checklists?.[0] ?? null) });
  }

  function setCurrentChecklist(checklistOrId) {
    let checklist = null;

    if (typeof checklistOrId === 'string') {
      // Find the checklist by ID across all projects
      for (const project of state.projects) {
        const found = project.checklists.find((c) => c.id === checklistOrId);
        if (found) {
          checklist = { ...found }; // Create a new object to avoid reference issues
          break;
        }
      }

      if (!checklist) {
        console.warn(`setCurrentChecklist: Checklist with ID "${checklistOrId}" not found.`);
        setState('currentChecklist', null);
        return;
      }
    } else if (typeof checklistOrId === 'object') {
      // If object was passed directly, create a copy to avoid reference issues
      checklist = { ...checklistOrId };
    } else {
      // Handle null/undefined case
      setState('currentChecklist', null);
      return;
    }

    setState('currentChecklist', checklist);
  }

  // Add a new checklist to a project in both state and IndexedDB
  async function addChecklist(projectId, checklist) {
    try {
      // Use the new saveChecklistToProject function
      const updatedProject = await saveChecklistToProject(projectId, checklist);

      // Find the project to update in state
      const projectIndex = state.projects.findIndex((p) => p.id === projectId);
      if (projectIndex !== -1) {
        // Update the project in state
        setState('projects', projectIndex, updatedProject);
      }

      return checklist;
    } catch (error) {
      console.error('Error adding checklist:', error);
      throw error;
    }
  }

  // Update a checklist in both state and IndexedDB
  async function updateChecklist(updatedChecklist) {
    try {
      // Find the project index that contains this checklist
      const projectIndex = state.projects.findIndex((p) => p.checklists.some((c) => c.id === updatedChecklist.id));

      if (projectIndex >= 0) {
        // Get the project ID
        const projectId = state.projects[projectIndex].id;

        // Save to IndexedDB (both checklist store and in the project)
        await saveChecklistToProject(projectId, updatedChecklist);

        // Update the checklist in the project in state
        setState('projects', projectIndex, 'checklists', (checklists) => {
          const checklistIndex = checklists.findIndex((c) => c.id === updatedChecklist.id);

          if (checklistIndex >= 0) {
            return [...checklists.slice(0, checklistIndex), { ...updatedChecklist }, ...checklists.slice(checklistIndex + 1)];
          }
          return checklists;
        });

        // Update currentChecklist if it's the same one
        if (state.currentChecklist?.id === updatedChecklist.id) {
          setState('currentChecklist', { ...updatedChecklist });
        }

        // console.log('Checklist updated successfully', updatedChecklist);
        return updatedChecklist;
      } else {
        console.warn('Could not find project containing checklist:', updatedChecklist.id);
        throw new Error(`Could not find project containing checklist: ${updatedChecklist.id}`);
      }
    } catch (error) {
      console.error('Error updating checklist:', error);
      throw error;
    }
  }

  // Delete a checklist from both state and IndexedDB
  async function deleteChecklist(projectId, checklistId) {
    try {
      // Delete from IndexedDB
      await deleteChecklistFromProject(projectId, checklistId);

      // Find project index
      const projectIndex = state.projects.findIndex((p) => p.id === projectId);
      if (projectIndex >= 0) {
        // Update project's checklists in state
        setState('projects', projectIndex, 'checklists', (checklists) => checklists.filter((c) => c.id !== checklistId));

        // Reset current checklist if it was deleted
        if (state.currentChecklist?.id === checklistId) {
          const project = state.projects[projectIndex];
          setState('currentChecklist', project.checklists.length > 0 ? project.checklists[0] : null);
        }
      }

      return true;
    } catch (error) {
      console.error('Error removing checklist:', error);
      throw error;
    }
  }

  return (
    <StateContext.Provider
      value={{
        // State access
        projects: () => state.projects,
        currentProject: () => state.currentProject,
        currentChecklist: () => state.currentChecklist,
        loading: () => state.loading,

        // State operations
        loadProjects,
        setProjects,
        addProject,
        deleteProject,
        setCurrentProject,
        setCurrentChecklist,
        addChecklist,
        updateChecklist,
        deleteChecklist,
      }}
    >
      {props.children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  return useContext(StateContext);
}
