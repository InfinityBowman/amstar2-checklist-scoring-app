import { createStore, createMergeableStore } from 'tinybase';
import { createOpfsPersister } from 'tinybase/persisters/persister-browser';

const store = createMergeableStore();

store.setSchema({
  projects: {
    id: { type: 'string' }, // Unique project ID
    name: { type: 'string' }, // Project name/title
    createdAt: { type: 'number' }, // Timestamp (ms)
  },
  project_members: {
    projectId: { type: 'string' }, // FK to projects.id
    userId: { type: 'string' }, // FK to users.id
    role: { type: 'string' }, // 'owner' or 'member'
    // Composite PK (projectId, userId)
  },
  reviews: {
    id: { type: 'string' }, // Unique review ID
    projectId: { type: 'string' }, // Foreign key to projects.id
    name: { type: 'string' }, // Review name/title
    createdAt: { type: 'number' }, // Timestamp (ms)
    pdfFileName: { type: 'string' }, // Optional PDF file name
  },
  review_assignments: {
    reviewId: { type: 'string' }, // FK to reviews.id
    userId: { type: 'string' }, // FK to users.id
    // Composite PK (reviewId, userId)
  },
  checklists: {
    id: { type: 'string' }, // Unique checklist ID
    reviewId: { type: 'string' }, // Foreign key to reviews.id
    reviewerId: { type: 'string' }, // Optional, for multi-user
    type: { type: 'string' }, // e.g. 'amstar'
    completedAt: { type: 'number' }, // Timestamp (ms), optional
    updatedAt: { type: 'number' }, // Timestamp (ms)
  },
  checklist_answers: {
    id: { type: 'string' }, // Unique answer ID (UUID)
    checklistId: { type: 'string' }, // Foreign key to checklists.id
    questionKey: { type: 'string' }, // e.g. 'q1', 'q2', etc.
    answers: { type: 'string' }, // JSON stringified array
    critical: { type: 'boolean' }, // true/false
    updatedAt: { type: 'number' }, // Timestamp (ms)
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
