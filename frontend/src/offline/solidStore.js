import { createSignal, batch } from 'solid-js';
import { createStore as createSolidStore } from 'solid-js/store';
import { createMergeableStore } from 'tinybase';
import { createOpfsPersister } from 'tinybase/persisters/persister-browser';
// import { enqueueOperation } from '@api/syncService.js';
// import { syncOperation } from './syncWrapper.js';
// import { API_ENDPOINTS } from '../api/config.js';

const tinyStore = createMergeableStore();

export const schema = {
  users: {
    id: { type: 'string' }, // Unique user ID
    name: { type: 'string' }, // User's name
    email: { type: 'string' }, // User's email address
  },
  projects: {
    id: { type: 'string' }, // Unique project ID
    name: { type: 'string' }, // Project name/title
    updated_at: { type: 'string' }, // Timestamp (ISO 8601)
    owner_id: { type: 'number' }, // FK to users.id
    sync_status: { type: 'string' }, // 'synced', 'unsynced'
  },
  project_members: {
    id: { type: 'string' }, // Will contain "project_id::user_id"
    project_id: { type: 'string' }, // FK to projects.id
    user_id: { type: 'string' }, // FK to users.id
    role: { type: 'string' }, // 'owner' or 'member'
  },
  reviews: {
    id: { type: 'string' }, // Unique review ID
    project_id: { type: 'string' }, // Foreign key to projects.id
    name: { type: 'string' }, // Review name/title
    created_at: { type: 'number' }, // Timestamp (ms)
    // pdf_file_name: { type: 'string' }, // PDF file name
  },
  review_assignments: {
    id: { type: 'string' }, // Will contain "review_id::user_id"
    review_id: { type: 'string' }, // FK to reviews.id
    user_id: { type: 'string' }, // FK to users.id
  },
  checklists: {
    id: { type: 'string' }, // Unique checklist ID
    review_id: { type: 'string' }, // Foreign key to reviews.id
    reviewer_id: { type: 'string' }, // Optional, for multi-user
    type: { type: 'string' }, // e.g. 'amstar'
    completed_at: { type: 'number' }, // Timestamp (ms), optional
    updated_at: { type: 'number' }, // Timestamp (ms)
  },
  checklist_answers: {
    id: { type: 'string' }, // Unique answer ID (UUID)
    checklist_id: { type: 'string' }, // Foreign key to checklists.id
    question_key: { type: 'string' }, // e.g. 'q1', 'q2', etc.
    answers: { type: 'string' }, // JSON stringified array
    critical: { type: 'boolean' }, // true/false
    updated_at: { type: 'number' }, // Timestamp (ms)
  },
};

/**
 * This will become the main database we read and write to.
 * It uses OPFS under the hood for persistance.
 * When offline, there will be another table in here to track pending changes.
 * These changes will have, in addition to what they need to change, a field
 * for the id of the item they are reliant on exiting
 * if they are reliant on anything. e.g. changing review name requires the review to exist first.
 * They will also have the state of the store before the change was made to allow for easy rollback.
 * When back online, we will attempt to push these changes to the server in the order they were made.
 * Operations that succeed will return the item from the server. Changes that create new items will need to have
 * their temp IDs replaced with the server IDs and any items dependent on them updated to use the new IDs. And we
 * will have to check for any other overlapping temp ids in the store and update those to a new random ID and so on.
 * Operations that fail will be retried a few times. Otherwise rollback the state and remove any dependent changes.
 * The state of the store can be retrieved for rollback like so: store.getTablesSnapshot()
 * This will return an object with all tables and their current state.
 * e.g. {projects: {...}, reviews: {...}, checklists: {...}, answers: {...}}
 * We can then use store.setTablesSnapshot(snapshot) to rollback to that state.
 *
 * Once we are online we can then fetch latest data with electric sync into a mergeable store and merge it in here.
 * But we will wait until the transaction queue is empty to avoid conflicts.
 */
// Main reactive store based on TinyBase
export async function createReactiveStore() {
  const opfs = await navigator.storage.getDirectory();
  const handle = await opfs.getFileHandle('tinybase.json', { create: true });

  tinyStore.setSchema(schema);

  const persister = createOpfsPersister(tinyStore, handle);
  // Make sure to load first so we dont save an empty DB over existing data
  // await persister.startAutoLoad();
  // await persister.startAutoSave();
  console.log(tinyStore.getTables());

  // Create solid signals for each table in the schema
  const [projects, setProjects] = createSignal([]);
  const [users, setUsers] = createSignal([]);
  const [reviews, setReviews] = createSignal([]);
  const [checklists, setChecklists] = createSignal([]);
  const [checklistAnswers, setChecklistAnswers] = createSignal([]);
  const [projectMembers, setProjectMembers] = createSignal([]);
  const [reviewAssignments, setReviewAssignments] = createSignal([]);

  // Create UI state store
  const [state, setState] = createSolidStore({
    currentProject: null,
    currentReview: null,
    currentChecklist: null,
    dataLoading: true,
  });

  // Subscribe to TinyBase changes for each table
  function setupListeners() {
    // Projects listener
    const projectsListener = tinyStore.addTableListener('projects', () => {
      console.log('Projects table changed');
      // return;
      const projectsData = Object.entries(tinyStore.getTable('projects') || {}).map(([id, project]) => ({
        ...project,
        id,
      }));
      setProjects(projectsData);
    });

    // Users listener
    const usersListener = tinyStore.addTableListener('users', () => {
      console.log('Users table changed');
      // return;
      const usersData = Object.entries(tinyStore.getTable('users') || {}).map(([id, user]) => ({
        ...user,
        id,
      }));
      setUsers(usersData);
    });

    // Reviews listener
    const reviewsListener = tinyStore.addTableListener('reviews', () => {
      console.log('Reviews table changed');
      // return;

      const reviewsData = Object.entries(tinyStore.getTable('reviews') || {}).map(([id, review]) => ({
        ...review,
        id,
      }));
      setReviews(reviewsData);
    });

    // Checklists listener
    const checklistsListener = tinyStore.addTableListener('checklists', () => {
      console.log('Checklists table changed');
      // return;
      const checklistsData = Object.entries(tinyStore.getTable('checklists') || {}).map(([id, checklist]) => ({
        ...checklist,
        id,
      }));
      setChecklists(checklistsData);
    });

    // Checklist answers listener
    const answersListener = tinyStore.addTableListener('checklist_answers', () => {
      console.log('Checklist answers table changed');
      // return;
      const answersData = Object.entries(tinyStore.getTable('checklist_answers') || {}).map(([id, answer]) => {
        // Parse JSON answers field if it's a string
        if (typeof answer.answers === 'string') {
          try {
            return {
              ...answer,
              id,
              answers: JSON.parse(answer.answers),
            };
          } catch (e) {
            console.warn('Failed to parse answers JSON:', answer.answers);
            return { ...answer, id };
          }
        }
        return { ...answer, id };
      });
      setChecklistAnswers(answersData);
    });

    // Project members listener
    const membersListener = tinyStore.addTableListener('project_members', () => {
      console.log('Project members table changed');
      // return;
      const membersData = Object.entries(tinyStore.getTable('project_members') || {}).map(([id, member]) => ({
        ...member,
        id,
      }));
      setProjectMembers(membersData);
    });

    // Review assignments listener
    const assignmentsListener = tinyStore.addTableListener('review_assignments', () => {
      console.log('Review assignments table changed');
      // return;
      const assignmentsData = Object.entries(tinyStore.getTable('review_assignments') || {}).map(
        ([id, assignment]) => ({ ...assignment, id }),
      );
      setReviewAssignments(assignmentsData);
    });

    // Return cleanup function
    return () => {
      tinyStore.removeTableListener(projectsListener);
      tinyStore.removeTableListener(reviewsListener);
      tinyStore.removeTableListener(checklistsListener);
      tinyStore.removeTableListener(answersListener);
      tinyStore.removeTableListener(membersListener);
      tinyStore.removeTableListener(assignmentsListener);
    };
  }

  // Initialize the listeners
  setupListeners();

  // Trigger initial data load
  batch(() => {
    const projectsData = Object.entries(tinyStore.getTable('projects') || {}).map(([id, project]) => ({
      ...project,
      id,
    }));
    setProjects(projectsData);

    const usersData = Object.entries(tinyStore.getTable('users') || {}).map(([id, user]) => ({
      ...user,
      id,
    }));
    setUsers(usersData);

    const reviewsData = Object.entries(tinyStore.getTable('reviews') || {}).map(([id, review]) => ({ ...review, id }));
    setReviews(reviewsData);

    const checklistsData = Object.entries(tinyStore.getTable('checklists') || {}).map(([id, checklist]) => ({
      ...checklist,
      id,
    }));
    setChecklists(checklistsData);

    const answersData = Object.entries(tinyStore.getTable('checklist_answers') || {}).map(([id, answer]) => {
      if (typeof answer.answers === 'string') {
        try {
          return { ...answer, id, answers: JSON.parse(answer.answers) };
        } catch (e) {
          return { ...answer, id };
        }
      }
      return { ...answer, id };
    });
    setChecklistAnswers(answersData);

    const membersData = Object.entries(tinyStore.getTable('project_members') || {}).map(([id, member]) => ({
      ...member,
      id,
    }));
    setProjectMembers(membersData);

    const assignmentsData = Object.entries(tinyStore.getTable('review_assignments') || {}).map(([id, assignment]) => ({
      ...assignment,
      id,
    }));
    setReviewAssignments(assignmentsData);

    setState('dataLoading', false);
  });

  // CRUD Operations for Projects
  const saveProject = async (project) => {
    if (!project.id) throw new Error('Project must have an ID');
    let item = {
      id: project.id,
      name: project.name,
      owner_id: 1234,
      updated_at: new Date().toISOString(),
      sync_status: project.sync_status || 'synced',
    };
    // enqueueOperation('CREATE_PROJECT', project.name, project.id, getStoreSnapshot(tinyStore));
    tinyStore.setRow('projects', project.id, item);
    console.log('Saved project:', item, tinyStore.getTable('projects'));
  };

  function changeProjectId(oldId, newId) {
    const project = solidStore.projects().find((p) => p.id === oldId);
    if (!project) return false;

    // Remove old project
    solidStore.tinyStore.delRow('projects', oldId);

    // Add new project with new id
    const newProject = { ...project, id: newId };
    solidStore.tinyStore.setRow('projects', newId, newProject);

    return true;
  }

  const deleteProject = async (projectId) => {
    tinyStore.delRow('projects', projectId);

    // Also delete related data (project members, reviews, etc.)
    // Find and delete all project members
    const members = projectMembers().filter((m) => m.project_id === projectId);
    members.forEach((member) => {
      tinyStore.delRow('project_members', member.id);
    });

    // Find and delete all reviews for this project
    const projectReviews = reviews().filter((r) => r.project_id === projectId);
    projectReviews.forEach((review) => {
      // Delete review assignments
      const assignments = reviewAssignments().filter((a) => a.review_id === review.id);
      assignments.forEach((assignment) => {
        tinyStore.delRow('review_assignments', assignment.id);
      });

      // Delete checklists
      const reviewChecklists = checklists().filter((c) => c.review_id === review.id);
      reviewChecklists.forEach((checklist) => {
        // Delete checklist answers
        const answers = checklistAnswers().filter((a) => a.checklist_id === checklist.id);
        answers.forEach((answer) => {
          tinyStore.delRow('checklist_answers', answer.id);
        });

        tinyStore.delRow('checklists', checklist.id);
      });

      tinyStore.delRow('reviews', review.id);
    });

    // Reset current selections if needed
    if (state.currentProject?.id === projectId) {
      setState({
        currentProject: null,
        currentReview: null,
        currentChecklist: null,
      });
    }

    return true;
  };

  // Set current selections
  const setCurrentProject = (projectId) => {
    const project = projects().find((p) => p.id === projectId) || null;
    setState('currentProject', project);

    // Reset related selections
    setState({
      currentReview: null,
      currentChecklist: null,
    });

    return project;
  };

  const setCurrentReview = (reviewId) => {
    const review = reviews().find((r) => r.id === reviewId) || null;
    setState('currentReview', review);

    // Reset current checklist
    setState('currentChecklist', null);

    return review;
  };

  const setCurrentChecklist = (checklistId) => {
    const checklist = checklists().find((c) => c.id === checklistId) || null;
    setState('currentChecklist', checklist);
    return checklist;
  };

  // CRUD Operations for Reviews
  const addReview = async (review) => {
    if (!review.id) throw new Error('Review must have an ID');
    if (!review.project_id) throw new Error('Review must have a project_id');
    tinyStore.setRow('reviews', review.id, review);
    return review;
  };

  const deleteReview = async (reviewId) => {
    // Find review first to get its data
    const review = reviews().find((r) => r.id === reviewId);
    if (!review) return false;

    // Delete review assignments
    const assignments = reviewAssignments().filter((a) => a.review_id === reviewId);
    assignments.forEach((assignment) => {
      tinyStore.delRow('review_assignments', assignment.id);
    });

    // Delete checklists
    const reviewChecklists = checklists().filter((c) => c.review_id === reviewId);
    reviewChecklists.forEach((checklist) => {
      // Delete checklist answers
      const answers = checklistAnswers().filter((a) => a.checklist_id === checklist.id);
      answers.forEach((answer) => {
        tinyStore.delRow('checklist_answers', answer.id);
      });

      tinyStore.delRow('checklists', checklist.id);
    });

    // Delete the review
    tinyStore.delRow('reviews', reviewId);

    // Reset current selections if needed
    if (state.currentReview?.id === reviewId) {
      setState({
        currentReview: null,
        currentChecklist: null,
      });
    }

    return true;
  };

  // CRUD Operations for Checklists
  const addChecklist = async (checklist) => {
    if (!checklist.id) throw new Error('Checklist must have an ID');
    if (!checklist.review_id) throw new Error('Checklist must have a review_id');
    tinyStore.setRow('checklists', checklist.id, checklist);
    return checklist;
  };

  const deleteChecklist = async (checklistId) => {
    // Delete checklist answers first
    const answers = checklistAnswers().filter((a) => a.checklist_id === checklistId);
    answers.forEach((answer) => {
      tinyStore.delRow('checklist_answers', answer.id);
    });

    // Delete the checklist
    tinyStore.delRow('checklists', checklistId);

    // Reset current checklist if needed
    if (state.currentChecklist?.id === checklistId) {
      setState('currentChecklist', null);
    }

    return true;
  };

  // CRUD Operations for Checklist Answers
  const addChecklistAnswer = async (answer) => {
    if (!answer.id) throw new Error('Answer must have an ID');
    if (!answer.checklist_id) throw new Error('Answer must have a checklist_id');

    // Ensure answers field is stringified JSON if it's an array or object
    const processedAnswer = { ...answer };
    if (
      typeof processedAnswer.answers !== 'string' &&
      (Array.isArray(processedAnswer.answers) || typeof processedAnswer.answers === 'object')
    ) {
      processedAnswer.answers = JSON.stringify(processedAnswer.answers);
    }

    tinyStore.setRow('checklist_answers', answer.id, processedAnswer);
    return answer;
  };

  const deleteChecklistAnswer = async (answerId) => {
    tinyStore.delRow('checklist_answers', answerId);
    return true;
  };

  // Project Members operations
  const addProjectMember = async (projectId, userId, role = 'member') => {
    const id = `${projectId}::${userId}`;
    const member = {
      project_id: projectId,
      user_id: userId,
      role: role,
    };
    tinyStore.setRow('project_members', id, member);
    return member;
  };

  const deleteProjectMember = async (projectId, userId) => {
    const id = `${projectId}::${userId}`;
    tinyStore.delRow('project_members', id);
    return true;
  };

  // CRUD Operations for  Review Assignments
  const addReviewAssignment = async (reviewId, userId) => {
    const id = `${reviewId}::${userId}`;
    const assignment = {
      review_id: reviewId,
      user_id: userId,
    };
    tinyStore.setRow('review_assignments', id, assignment);
    return assignment;
  };

  const deleteReviewAssignment = async (reviewId, userId) => {
    const id = `${reviewId}::${userId}`;
    tinyStore.delRow('review_assignments', id);
    return true;
  };

  // Helper methods for data relationships
  const getReviewsForProject = (projectId) => {
    return reviews().filter((r) => r.project_id === projectId);
  };

  const getChecklistsForReview = (reviewId) => {
    return checklists().filter((c) => c.review_id === reviewId);
  };

  const getAnswersForChecklist = (checklistId) => {
    return checklistAnswers().filter((a) => a.checklist_id === checklistId);
  };

  const getProjectMembers = (projectId) => {
    return projectMembers().filter((m) => m.project_id === projectId);
  };

  const getReviewAssignments = (reviewId) => {
    return reviewAssignments().filter((a) => a.review_id === reviewId);
  };

  const getProjectsForUser = (userId) => {
    // Get all project IDs where this user is a member
    const memberProjectIds = projectMembers()
      .filter((m) => m.user_id === userId)
      .map((m) => m.project_id);

    // Return all matching projects
    return projects().filter((p) => memberProjectIds.includes(p.id));
  };

  const getStoreSnapshot = () => {
    return {
      projects: tinyStore.getTable('projects') || {},
      project_members: tinyStore.getTable('project_members') || {},
      reviews: tinyStore.getTable('reviews') || {},
      review_assignments: tinyStore.getTable('review_assignments') || {},
      checklists: tinyStore.getTable('checklists') || {},
      checklist_answers: tinyStore.getTable('checklist_answers') || {},
    };
  };

  const loadStoreSnapshot = (snapshot) => {
    batch(() => {
      // Clear existing data
      Object.keys(schema).forEach((tableName) => {
        tinyStore.delTable(tableName);
      });

      // Load snapshot data
      Object.entries(snapshot).forEach(([tableName, data]) => {
        Object.entries(data).forEach(([id, row]) => {
          tinyStore.setRow(tableName, id, row);
        });
      });
    });
  };

  return {
    // Data signals
    projects,
    users,
    reviews,
    checklists,
    checklistAnswers,
    projectMembers,
    reviewAssignments,

    // UI state
    state,
    setState,
    isLoaded: () => !state.dataLoading,

    // Project operations
    saveProject,
    deleteProject,
    setCurrentProject,
    changeProjectId,

    // Review operations
    addReview,
    deleteReview,
    setCurrentReview,

    // Checklist operations
    addChecklist,
    deleteChecklist,
    setCurrentChecklist,

    // Checklist answer operations
    addChecklistAnswer,
    deleteChecklistAnswer,

    // Project member operations
    addProjectMember,
    deleteProjectMember,

    // Review assignment operations
    addReviewAssignment,
    deleteReviewAssignment,

    // Relationship helpers
    getReviewsForProject,
    getChecklistsForReview,
    getAnswersForChecklist,
    getProjectMembers,
    getReviewAssignments,
    getProjectsForUser,

    // Store
    tinyStore,
    getStoreSnapshot,
    loadStoreSnapshot,
  };
}

// Export a singleton instance
export const solidStore = await createReactiveStore();
