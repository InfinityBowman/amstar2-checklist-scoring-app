import { createStore, createMergeableStore } from 'tinybase';
import { createOpfsPersister } from 'tinybase/persisters/persister-browser';

/**
 * This will become the main database we read and write to.
 * It will use OPFS under the hood for persistance.
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
const store = createMergeableStore();

store.setSchema({
  projects: {
    id: { type: 'string' }, // Unique project ID
    name: { type: 'string' }, // Project name/title
    updated_at: { type: 'number' }, // Timestamp (ms)
    owner_id: { type: 'number' }, // FK to users.id
  },
  project_members: {
    project_id: { type: 'string' }, // FK to projects.id
    user_id: { type: 'string' }, // FK to users.id
    role: { type: 'string' }, // 'owner' or 'member'
    // Composite PK (projectId, userId)
  },
  reviews: {
    id: { type: 'string' }, // Unique review ID
    project_id: { type: 'string' }, // Foreign key to projects.id
    name: { type: 'string' }, // Review name/title
    created_at: { type: 'number' }, // Timestamp (ms)
    // pdf_file_name: { type: 'string' }, // PDF file name
  },
  review_assignments: {
    review_id: { type: 'string' }, // FK to reviews.id
    user_id: { type: 'string' }, // FK to users.id
    // Composite PK (reviewId, userId)
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
});

// --- Relationship helpers ---

/** Get all reviews for a given projectId */
export function getReviewsForProject(projectId) {
  return Object.values(store.getTable('reviews')).filter((r) => r.projectId === projectId);
}

/** Get all checklists for a given reviewId */
export function getChecklistsForReview(reviewId) {
  return Object.values(store.getTable('checklists')).filter((c) => c.reviewId === reviewId);
}

export function getAnswersForChecklist(checklistId) {
  return Object.values(store.getTable('answers')).filter((a) => a.checklistId === checklistId);
}

export function getAssignmentsForReview(reviewId) {
  return Object.values(store.getTable('review_assignments')).filter((a) => a.reviewId === reviewId);
}

/** Get all projects for a given userId (as member or owner) */
export function getProjectsForUser(userId) {
  // Find all projectIds where user is a member
  const memberProjectIds =
    store.getTable('project_members') ?
      Object.values(store.getTable('project_members'))
        .filter((pm) => pm.userId === userId)
        .map((pm) => pm.projectId)
    : [];
  // Return all matching projects
  return Object.values(store.getTable('projects')).filter((p) => memberProjectIds.includes(p.id));
}

/** Get all members for a given projectId */
export function getMembersForProject(projectId) {
  const memberUserIds =
    store.getTable('project_members') ?
      Object.values(store.getTable('project_members'))
        .filter((pm) => pm.projectId === projectId)
        .map((pm) => pm.userId)
    : [];
  return memberUserIds;
}

/** Get all assignments for a given userId */
export function getAssignmentsForUser(userId) {
  return Object.values(store.getTable('review_assignments')).filter((a) => a.userId === userId);
}

/** Get all reviews assigned to a user */
export function getReviewsAssignedToUser(userId) {
  const assignedReviewIds =
    store.getTable('review_assignments') ?
      Object.values(store.getTable('review_assignments'))
        .filter((a) => a.userId === userId)
        .map((a) => a.reviewId)
    : [];
  return Object.values(store.getTable('reviews')).filter((r) => assignedReviewIds.includes(r.id));
}

/** Get all answers for a given questionKey in a checklist */
export function getAnswersForQuestionInChecklist(checklistId, questionKey) {
  return Object.values(store.getTable('checklist_answers')).filter(
    (a) => a.checklistId === checklistId && a.questionKey === questionKey,
  );
}

export { store };
