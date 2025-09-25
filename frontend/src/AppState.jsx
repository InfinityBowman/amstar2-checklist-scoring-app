import { createStore } from 'solid-js/store';
import { createContext, useContext, onMount } from 'solid-js';
import * as localDB from './offline/localDB.js';

// TODO use produce or batch for updates to store

const StateContext = createContext();

export function StateProvider(props) {
  const [state, setState] = createStore({
    projects: [],
    currentProject: null,
    currentChecklist: null,
    dataLoading: true,
    checklists: [],
  });

  // Load all projects and checklists on mount
  onMount(async () => {
    try {
      await loadData();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setState('dataLoading', false);
    }

    // try {
    //   // TODO figure this out
    //   if (navigator.storage && navigator.storage.persist) {
    //     navigator.storage.persist().then((granted) => {
    //       console.log(granted ? 'Storage is now persistent' : 'Storage is not persistent');
    //     });
    //   }
    // } catch (error) {
    //   console.error('Error requesting persistent storage:', error);
    // }
  });

  // Load all projects and checklists from IndexedDB
  async function loadData() {
    try {
      setState('loading', true);
      const allProjects = await localDB.getAllProjects();
      allProjects.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setState('projects', allProjects);

      const allChecklists = await localDB.getAllChecklists();
      setState('checklists', allChecklists);
    } catch (error) {
      console.error('Error loading IndexedDB data:', error);
      throw error;
    } finally {
      setState('loading', false);
    }
  }

  // Add a new project to both state and IndexedDB
  async function addProject(project) {
    try {
      await localDB.saveProject(project);
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
      await localDB.deleteProject(projectId);
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

  /**
   * Sets the current project in state.
   *
   * Accepts:
   *   - An object: { project } to set directly, { id } to search by ID, or { name, index } to search by name and index (for duplicates).
   *   - A string: treated as an ID first, then as a name (first match).
   *
   * Also sets the current checklist to the first checklist of the selected project (or null).
   *
   * Examples:
   *   setCurrentProject({ id: 'abc123' })
   *   setCurrentProject({ name: 'Project Name', index: 1 })
   *   setCurrentProject({ project: projectObj })
   *   setCurrentProject('abc123')
   *   setCurrentProject('Project Name')
   */
  function setCurrentProject(arg) {
    let project = null;

    if (typeof arg === 'object' && arg !== null) {
      if ('project' in arg && arg.project) {
        project = { ...arg.project };
      } else if ('id' in arg) {
        project = state.projects.find((p) => p.id === arg.id);
      } else if ('name' in arg) {
        const matches = state.projects.filter((p) => p.name === arg.name);
        project = matches[arg.index ?? 0] ? { ...matches[arg.index ?? 0] } : null;
      }
    } else if (typeof arg === 'string') {
      // For backward compatibility: treat as id
      project = state.projects.find((p) => p.id === arg);
      if (!project) {
        project = state.projects.find((p) => p.name === arg);
      }
      project = project ? { ...project } : null;
    }

    setState('currentProject', project);
    setState('currentChecklist', { ...(project?.checklists?.[0] ?? null) });
  }

  // Set the current checklist by object or ID
  // Looks in both projects and checklists store
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

      // If not found in projects, check checklists store
      if (!checklist) {
        const found = state.checklists.find((c) => c.id === checklistOrId);
        if (found) {
          checklist = { ...found };
        }
      }

      if (!checklist) {
        console.warn(`setCurrentChecklist: Checklist with ID "${checklistOrId}" not found.`);
        setState('currentChecklist', null);
        return false;
      }
    } else if (typeof checklistOrId === 'object') {
      // If object was passed directly, create a copy to avoid reference issues
      checklist = { ...checklistOrId };
    } else {
      // Handle null/undefined case
      setState('currentChecklist', null);
      return false;
    }

    setState('currentChecklist', checklist);
    return true;
  }

  // Add a new checklist in both state and IndexedDB
  // If projectId is null, save to checklists store
  async function addChecklist(projectId, checklist) {
    if (projectId === null) {
      try {
        // Save checklist independently if no projectId is provided
        await localDB.saveChecklist(checklist);
        setState('checklists', (prev) => [...prev, checklist]);

        return checklist;
      } catch (error) {
        console.error('Error adding checklist without project:', error);
        throw error;
      }
    }
    try {
      // Use the saveChecklistToProject function
      const updatedProject = await localDB.saveChecklistToProject(projectId, checklist);

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
        const projectId = state.projects[projectIndex].id;

        // Save to IndexedDB
        await localDB.saveChecklistToProject(projectId, updatedChecklist);

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

        return updatedChecklist;
      } else {
        // Independent checklist: Try to update in checklists array
        const checklistIndex = state.checklists.findIndex((c) => c.id === updatedChecklist.id);
        if (checklistIndex >= 0) {
          // Save to IndexedDB
          await localDB.saveChecklist(updatedChecklist);

          // Update in state
          setState('checklists', checklistIndex, { ...updatedChecklist });

          // Update currentChecklist if it's the same one
          if (state.currentChecklist?.id === updatedChecklist.id) {
            setState('currentChecklist', { ...updatedChecklist });
          }

          return updatedChecklist;
        } else {
          console.warn('Could not find checklist:', updatedChecklist.id);
          throw new Error(`Could not find checklist: ${updatedChecklist.id}`);
        }
      }
    } catch (error) {
      console.error('Error updating checklist:', error);
      throw error;
    }
  }

  // Delete a checklist from both state and IndexedDB
  // If projectId is null, delete from checklists store
  async function deleteChecklist(projectId, checklistId) {
    if (projectId === null) {
      try {
        // Delete checklist independently if no projectId is provided
        await localDB.deleteChecklist(checklistId);
        setState('checklists', (prev) => prev.filter((c) => c.id !== checklistId));

        // Reset current checklist if it was deleted
        if (state.currentChecklist?.id === checklistId) {
          setState('currentChecklist', null);
        }

        return true;
      } catch (error) {
        console.error('Error adding checklist without project:', error);
        return false;
      }
    }
    try {
      // Delete from IndexedDB
      await localDB.deleteChecklistFromProject(projectId, checklistId);

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
      return false;
    }
  }

  function getChecklist(checklistId) {
    // Search in projects first
    for (const project of state.projects) {
      const found = project.checklists.find((c) => c.id === checklistId);
      if (found) return found;
    }

    // Then search in independent checklists
    return state.checklists.find((c) => c.id === checklistId) || null;
  }

  return (
    <StateContext.Provider
      value={{
        // State access
        projects: () => state.projects,
        currentProject: () => state.currentProject,
        currentChecklist: () => state.currentChecklist,
        dataLoading: () => state.dataLoading,
        checklists: () => state.checklists,

        // State operations
        loadData,
        setProjects,
        addProject,
        deleteProject,
        setCurrentProject,
        setCurrentChecklist,
        addChecklist,
        updateChecklist,
        deleteChecklist,
        getChecklist,
      }}
    >
      {props.children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  return useContext(StateContext);
}
