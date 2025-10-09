import { createStore } from 'solid-js/store';
import { createContext, useContext, onMount } from 'solid-js';
import * as localDB from '@offline/localDB';
import * as electricSync from '@offline/electricSync';

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
      localDB.subscribeToDBChanges(loadData); // reload data if another tab changes it

      // Set up Electric sync
      electricSync.syncProjects({
        onUpdate: (projects) => setState('projects', projects),
      });
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
      // search by id first, then name
      project = state.projects.find((p) => p.id === arg);
      if (!project) {
        project = state.projects.find((p) => p.name === arg);
      }
      project = project ? { ...project } : null;
    }

    setState('currentProject', project);
  }

  /**
   * Sets the current checklist in state.
   *
   * Accepts:
   *   - An object:
   *       { checklist } — set directly from a checklist object
   *       { id } — find checklist by ID (searches all projects and independent checklists)
   *       { name, index } — find checklist(s) by name, use index for duplicates (searches all projects and independent checklists)
   *   - A string:
   *       Treated as an ID first (searches all projects and independent checklists), then as a name (first match).
   *
   * Examples:
   *   setCurrentChecklist({ id: 'abc123' })
   *   setCurrentChecklist({ name: 'Checklist Name', index: 1 })
   *   setCurrentChecklist({ checklist: checklistObj })
   *   setCurrentChecklist('abc123')
   *   setCurrentChecklist('Checklist Name')
   *
   * Returns true if a checklist was found and set, false otherwise.
   */
  function setCurrentChecklist(arg) {
    if (arg === undefined || arg === null) {
      setState('currentChecklist', null);
      return false;
    }
    const checklist = getChecklist(arg);
    setState('currentChecklist', checklist || null);
    return !!checklist;
  }

  // Add a new checklist in both state and IndexedDB
  // If projectId or reviewId is null, save to checklists store (independent checklist)
  async function addChecklist(projectId, reviewId, checklist) {
    if (!projectId || !reviewId) {
      try {
        // Save checklist independently if no projectId or reviewId is provided
        await localDB.saveChecklist(checklist);
        setState('checklists', (prev) => [...prev, checklist]);
        return checklist;
      } catch (error) {
        console.error('Error adding checklist without project/review:', error);
        throw error;
      }
    }
    try {
      // Save to IndexedDB (implement saveChecklistToReview in your localDB)
      const updatedProject = await localDB.saveChecklistToReview(projectId, reviewId, checklist);

      // Find the project and review to update in state
      const projectIndex = state.projects.findIndex((p) => p.id === projectId);
      if (projectIndex !== -1) {
        const reviewIndex = (state.projects[projectIndex].reviews || []).findIndex((r) => r.id === reviewId);
        if (reviewIndex !== -1) {
          setState('projects', projectIndex, 'reviews', reviewIndex, updatedProject.reviews[reviewIndex]);
        }
      }

      return checklist;
    } catch (error) {
      console.error('Error adding checklist:', error);
      throw error;
    }
  }

  // Update a checklist in both state and IndexedDB
  async function updateChecklist(updatedChecklist) {
    const found = findProjectAndReviewAndChecklist(updatedChecklist.id);
    if (!found) {
      console.warn('Could not find checklist to update:', updatedChecklist.id);
      throw new Error(`Could not find checklist to update: ${updatedChecklist.id}`);
    }
    try {
      // Find the project index that contains this checklist
      const { projectIndex, reviewIndex, checklistIndex, review, project } = found;
      if (projectIndex >= 0) {
        // Save to IndexedDB
        await localDB.saveChecklistToReview(project.id, review.id, updatedChecklist);

        // Update the checklist in the project in state
        setState('projects', projectIndex, 'reviews', reviewIndex, 'checklists', checklistIndex, { ...updatedChecklist });
      } else {
        // Independent checklist: Try to update in checklists array
        const checklistIndex = state.checklists.findIndex((c) => c.id === updatedChecklist.id);
        if (checklistIndex >= 0) {
          // Save to IndexedDB
          await localDB.saveChecklist(updatedChecklist);

          // Update in state
          setState('checklists', checklistIndex, { ...updatedChecklist });
        } else {
          console.warn('Could not find checklist:', updatedChecklist.id);
          throw new Error(`Could not find checklist: ${updatedChecklist.id}`);
        }
      }

      // Update currentChecklist if it's the same one
      if (state.currentChecklist?.id === updatedChecklist.id) {
        setState('currentChecklist', { ...updatedChecklist });
      }

      return updatedChecklist;
    } catch (error) {
      console.error('Error updating checklist:', error);
      throw error;
    }
  }

  // Delete a checklist from both state and IndexedDB
  // If projectId or reviewId is null, delete from independent checklists store
  async function deleteChecklist(projectId, reviewId, checklistId) {
    if (!projectId || !reviewId) {
      try {
        // Delete checklist independently if no projectId or reviewId is provided
        await localDB.deleteChecklist(checklistId);
        setState('checklists', (prev) => prev.filter((c) => c.id !== checklistId));

        // Reset current checklist if it was deleted
        if (state.currentChecklist?.id === checklistId) {
          setState('currentChecklist', null);
        }

        return true;
      } catch (error) {
        console.error('Error deleting checklist without project/review:', error);
        return false;
      }
    }
    try {
      // Delete from IndexedDB
      await localDB.deleteChecklistFromReview(projectId, reviewId, checklistId);

      // Update state: remove checklist from the correct review in the correct project
      const projectIndex = state.projects.findIndex((p) => p.id === projectId);
      if (projectIndex !== -1) {
        const reviewIndex = (state.projects[projectIndex].reviews || []).findIndex((r) => r.id === reviewId);
        if (reviewIndex !== -1) {
          setState('projects', projectIndex, 'reviews', reviewIndex, 'checklists', (arr) => arr.filter((c) => c.id !== checklistId));
        }
      }

      // Reset current checklist if it was deleted
      if (state.currentChecklist?.id === checklistId) {
        setState('currentChecklist', null);
      }

      return true;
    } catch (error) {
      console.error('Error deleting checklist:', error);
      return false;
    }
  }

  /**
   * Finds and returns a checklist object from state.
   *
   * Accepts:
   *   - An object:
   *       { checklist } — returns a copy of the provided checklist object
   *       { id } — finds checklist by ID (searches all projects and independent checklists)
   *       { name, index } — finds checklist(s) by name, uses index for duplicates (searches all projects and independent checklists)
   *   - A string:
   *       Treated as an ID first (searches all projects and independent checklists), then as a name (first match).
   *
   * Examples:
   *   getChecklist({ id: 'abc123' })
   *   getChecklist({ name: 'Checklist Name', index: 1 })
   *   getChecklist({ checklist: checklistObj })
   *   getChecklist('abc123')
   *   getChecklist('Checklist Name')
   *
   * Returns the found checklist object (copied), or null if not found.
   */
  function getChecklist(arg) {
    let found = findProjectAndReviewAndChecklist(arg);
    const checklist = found?.checklist ? { ...found.checklist } : null;
    return checklist;
  }

  function getChecklistIndex(checklistId, name) {
    let found = findProjectAndReviewAndChecklist(checklistId);
    if (found && typeof found.checklistIndex === 'number') {
      return found.checklistIndex;
    }
    // else search independent checklists
    let idx = -1;
    if (checklistId) {
      idx = state.checklists.findIndex((c) => c.id === checklistId);
    } else if (name) {
      idx = state.checklists.findIndex((c) => c.name === name);
    }
    return idx;
  }

  /**
   * { checklist }
   * { id }
   * { name, index }
   * string (id or name)
   * note: does not search independent checklists
   * @returns { project, projectIndex, review, reviewIndex, checklist, checklistIndex } or null
   */
  function findProjectAndReviewAndChecklist(arg) {
    // If a checklist object is passed directly
    if (typeof arg === 'object' && arg !== null) {
      if ('checklist' in arg && arg.checklist) {
        // Find by checklist id
        return findProjectAndReviewAndChecklist({ id: arg.checklist.id });
      } else if ('id' in arg) {
        // Search by checklist id
        for (let pIdx = 0; pIdx < state.projects.length; pIdx++) {
          const project = state.projects[pIdx];
          for (let rIdx = 0; rIdx < (project.reviews || []).length; rIdx++) {
            const review = project.reviews[rIdx];
            const cIdx = (review.checklists || []).findIndex((c) => c.id === arg.id);
            if (cIdx !== -1) {
              return {
                project,
                projectIndex: pIdx,
                review,
                reviewIndex: rIdx,
                checklist: review.checklists[cIdx],
                checklistIndex: cIdx,
              };
            }
          }
        }
      } else if ('name' in arg) {
        // Search by checklist name and optional index
        let matches = [];
        for (let pIdx = 0; pIdx < state.projects.length; pIdx++) {
          const project = state.projects[pIdx];
          for (let rIdx = 0; rIdx < (project.reviews || []).length; rIdx++) {
            const review = project.reviews[rIdx];
            (review.checklists || []).forEach((c, cIdx) => {
              if (c.name === arg.name) {
                matches.push({
                  project,
                  projectIndex: pIdx,
                  review,
                  reviewIndex: rIdx,
                  checklist: c,
                  checklistIndex: cIdx,
                });
              }
            });
          }
        }
        return matches[arg.index ?? 0] || null;
      }
    } else if (typeof arg === 'string') {
      // Try as id first
      for (let pIdx = 0; pIdx < state.projects.length; pIdx++) {
        const project = state.projects[pIdx];
        for (let rIdx = 0; rIdx < (project.reviews || []).length; rIdx++) {
          const review = project.reviews[rIdx];
          const cIdx = (review.checklists || []).findIndex((c) => c.id === arg);
          if (cIdx !== -1) {
            return {
              project,
              projectIndex: pIdx,
              review,
              reviewIndex: rIdx,
              checklist: review.checklists[cIdx],
              checklistIndex: cIdx,
            };
          }
        }
      }
      // Try as name
      let matches = [];
      for (let pIdx = 0; pIdx < state.projects.length; pIdx++) {
        const project = state.projects[pIdx];
        for (let rIdx = 0; rIdx < (project.reviews || []).length; rIdx++) {
          const review = project.reviews[rIdx];
          (review.checklists || []).forEach((c, cIdx) => {
            if (c.name === arg) {
              matches.push({
                project,
                projectIndex: pIdx,
                review,
                reviewIndex: rIdx,
                checklist: c,
                checklistIndex: cIdx,
              });
            }
          });
        }
      }
      return matches[0] || null;
    }
    return null;
  }

  // Add a new review to a project (and save to IndexedDB)
  async function addReview(projectId, review) {
    try {
      // Find the project index
      const projectIndex = state.projects.findIndex((p) => p.id === projectId);
      if (projectIndex === -1) throw new Error('Project not found');

      // Save to IndexedDB (implement saveReviewToProject in your localDB)
      const updatedProject = await localDB.saveReviewToProject(projectId, review);

      // Update the project in state
      setState('projects', projectIndex, updatedProject);

      return review;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  // Update an existing review in a project (and save to IndexedDB)
  async function updateReview(projectId, updatedReview) {
    try {
      // Find the project index
      const projectIndex = state.projects.findIndex((p) => p.id === projectId);
      if (projectIndex === -1) throw new Error('Project not found');

      // Save to IndexedDB (implement saveReviewToProject in your localDB)
      const updatedProject = await localDB.saveReviewToProject(projectId, updatedReview);

      // Update the review in the project in state
      setState('projects', projectIndex, updatedProject);

      return updatedReview;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  // Delete a review from a project (and save to IndexedDB)
  async function deleteReview(projectId, reviewId) {
    try {
      // Find the project index
      const projectIndex = state.projects.findIndex((p) => p.id === projectId);
      if (projectIndex === -1) throw new Error('Project not found');

      // Delete from IndexedDB
      const deleted = await localDB.deleteReviewFromProject(projectId, reviewId);
      if (!deleted) throw new Error('Review not found or could not be deleted');

      // Update the project in state
      setState('projects', projectIndex, (project) => ({
        ...project,
        reviews: (project.reviews || []).filter((r) => r.id !== reviewId),
      }));

      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
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
        dataLoading: () => state.dataLoading,
        checklists: () => state.checklists,

        // State operations
        loadData,

        // Projects
        setProjects,
        addProject,
        deleteProject,
        setCurrentProject,

        // Checklists
        setCurrentChecklist,
        addChecklist,
        updateChecklist,
        deleteChecklist,
        getChecklist,
        getChecklistIndex,

        // Reviews
        addReview,
        updateReview,
        deleteReview,
      }}
    >
      {props.children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  return useContext(StateContext);
}
