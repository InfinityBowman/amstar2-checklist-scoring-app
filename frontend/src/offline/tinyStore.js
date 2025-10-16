import { createStore, createMergeableStore } from 'tinybase';
import { createOpfsPersister } from 'tinybase/persisters/persister-browser';

const store = createMergeableStore();

store.setSchema({
  projects: {
    id: { type: 'string' }, // Unique project ID
    name: { type: 'string' }, // Project name/title
    createdAt: { type: 'number' }, // Timestamp (ms)
    // reviews: not stored here, see reviews table
  },
  reviews: {
    id: { type: 'string' }, // Unique review ID
    projectId: { type: 'string' }, // Foreign key to projects.id
    name: { type: 'string' }, // Review name/title
    createdAt: { type: 'number' }, // Timestamp (ms)
    pdfFileName: { type: 'string' }, // Optional PDF file name
    // checklists: not stored here, see checklists table
  },
  checklists: {
    id: { type: 'string' }, // Unique checklist ID
    reviewId: { type: 'string' }, // Foreign key to reviews.id
    reviewerId: { type: 'string' }, // Optional, for multi-user
    type: { type: 'string' }, // e.g. 'amstar'
    completedAt: { type: 'number' }, // Timestamp (ms), optional
    updatedAt: { type: 'number' }, // Timestamp (ms)
    // answers: not included here, would be a separate table
  },
  answers: {
    id: { type: 'string' }, // Unique answer ID
    checklistId: { type: 'string' }, // Foreign key to checklists.id
    questionId: { type: 'string' }, // ID of the question
    value: { type: 'string' }, // The answer value (e.g. Yes/No/Partial)
    comment: { type: 'string' }, // Optional comment
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

export { store };
