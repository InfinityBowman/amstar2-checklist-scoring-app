import { authFetch } from './authService';
import * as projectAPI from './projectService';
import * as reviewAPI from './reviewService';
import * as checklistAPI from './checklistService';
import { solidStore } from '@offline/solidStore';

/**
 * Responsible for syncing local store operations with remote API.
 * SolidStore does optimistic updates, it then needs to call an intermediate queue with a rollback
 * state if the API call fails. That queue uses the respective services to call the API. It will
 * also save itself to local storage. It needs to be responsible for understanding if it is online.
 * It also needs to update IDs for new entities created offline.
 */

export function generateTempId(prefix = 'temp') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

const transactionQueue = [];

export const OperationType = {
  CREATE_PROJECT: 'CREATE_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
};

export function enqueueOperation(type, data, id, snapshot = null) {
  console.log('Enqueuing operation:', type, data, id, snapshot);
  const operation = {
    id,
    type,
    data,
    status: 'pending',
    snapshot,
  };
  transactionQueue.push(operation);
  processQueue();
  return operation;
}

// Process the queue
async function processQueue() {
  if (transactionQueue.length === 0) return;

  const operation = transactionQueue[0];
  console.log('Processing operation:', transactionQueue.length, operation);

  try {
    let result;
    switch (operation.type) {
      case OperationType.CREATE_PROJECT:
        result = await projectAPI.createProject(operation.data);
        console.log('Created project on server:', result);
        if (operation.id) {
          // Replace temp ID with server ID in store and queue
          console.log(`Replacing tempId ${operation.id} with server id ${result.id}`);
          swapEntityIds(operation.id, result.id, 'project');
        }
        break;

      case OperationType.UPDATE_PROJECT:
        // result = await projectAPI.updateProject(operation.data.id, operation.data);
        break;

      case OperationType.DELETE_PROJECT:
        // result = await projectAPI.deleteProject(operation.data.id);
        break;
    }

    operation.status = 'completed';
    transactionQueue.shift(); // Remove completed operation

    // Process next operation if any
    if (transactionQueue.length > 0) {
      processQueue();
    }
  } catch (error) {
    operation.status = 'failed';
    operation.error = error.message;
    console.error('Operation failed:', error);
    // Maybe want to implement retry logic here

    // Apply snapshot
    solidStore.loadStoreSnapshot(operation.snapshot);
    console.log('Applied snapshot:', operation.snapshot);

    // Remove failed operation from queue
    transactionQueue.shift();

    // Remove any dependent operations that would fail without this one
    removeDependendentOperations(operation.id);

    // Continue processing queue if there are more operations
    if (transactionQueue.length > 0) {
      processQueue();
    }
  }
}

// Example usage for creating a project
export function createProject(projectData, snapshot) {
  enqueueOperation(OperationType.CREATE_PROJECT, projectData, projectData.id, snapshot);
}

/**
 * Swaps temporary IDs with server IDs across all related tables
 * And across the transaction queue
 * @param {string} tempId - The temporary ID to replace
 * @param {string} serverId - The new server ID
 * @param {string} entityType - The type of entity (project, review, checklist)
 */
function swapEntityIds(tempId, serverId, entityType) {
  const store = solidStore.tinyStore;

  // First update the transaction queue
  updateQueueIds(tempId, serverId, entityType);

  switch (entityType) {
    case 'project': {
      // Update project ID
      const projectData = store.getRow('projects', tempId);
      if (projectData) {
        store.delRow('projects', tempId);
        store.setRow('projects', serverId, projectData);
      }

      // Update project members
      const projectMembers = Object.entries(store.getTable('project_members') || {}).filter(
        ([_, member]) => member.project_id === tempId,
      );

      projectMembers.forEach(([memberId, member]) => {
        store.delRow('project_members', memberId);
        const newMemberId = memberId.replace(tempId, serverId);
        store.setRow('project_members', newMemberId, {
          ...member,
          project_id: serverId,
        });
      });

      // Update reviews project_id
      const projectReviews = Object.entries(store.getTable('reviews') || {}).filter(
        ([_, review]) => review.project_id === tempId,
      );

      projectReviews.forEach(([reviewId, review]) => {
        store.setRow('reviews', reviewId, {
          ...review,
          project_id: serverId,
        });
      });
      break;
    }

    case 'review': {
      // Update review ID
      const reviewData = store.getRow('reviews', tempId);
      if (reviewData) {
        store.delRow('reviews', tempId);
        store.setRow('reviews', serverId, reviewData);
      }

      // Update review assignments
      const reviewAssignments = Object.entries(store.getTable('review_assignments') || {}).filter(
        ([_, assignment]) => assignment.review_id === tempId,
      );

      reviewAssignments.forEach(([assignmentId, assignment]) => {
        store.delRow('review_assignments', assignmentId);
        const newAssignmentId = assignmentId.replace(tempId, serverId);
        store.setRow('review_assignments', newAssignmentId, {
          ...assignment,
          review_id: serverId,
        });
      });

      // Update checklists review_id
      const reviewChecklists = Object.entries(store.getTable('checklists') || {}).filter(
        ([_, checklist]) => checklist.review_id === tempId,
      );

      reviewChecklists.forEach(([checklistId, checklist]) => {
        store.setRow('checklists', checklistId, {
          ...checklist,
          review_id: serverId,
        });
      });
      break;
    }

    case 'checklist': {
      // Update checklist ID
      const checklistData = store.getRow('checklists', tempId);
      if (checklistData) {
        store.delRow('checklists', tempId);
        store.setRow('checklists', serverId, checklistData);
      }

      // Update checklist answers
      const checklistAnswers = Object.entries(store.getTable('checklist_answers') || {}).filter(
        ([_, answer]) => answer.checklist_id === tempId,
      );

      checklistAnswers.forEach(([answerId, answer]) => {
        store.setRow('checklist_answers', answerId, {
          ...answer,
          checklist_id: serverId,
        });
      });
      break;
    }
  }
}

/**
 * Updates IDs in the transaction queue data
 * @param {string} tempId - The temporary ID to replace
 * @param {string} serverId - The new server ID
 * @param {string} entityType - The type of entity
 */
function updateQueueIds(tempId, serverId, entityType) {
  console.log(`Updating queue IDs from ${tempId} to ${serverId} for entity type ${entityType}`);
  for (const operation of transactionQueue) {
    // Skip the first operation since it's the one that triggered the swap
    if (operation === transactionQueue[0]) continue;

    // Update operation ID if it matches
    if (operation.id === tempId) {
      operation.id = serverId;
    }

    // Update data based on entity type
    switch (entityType) {
      case 'project': {
        if (operation.data.project_id === tempId) {
          operation.data.project_id = serverId;
        }
        // Handle rollback data
        if (operation.rollbackData?.project_id === tempId) {
          operation.rollbackData.project_id = serverId;
        }
        break;
      }
      case 'review': {
        if (operation.data.review_id === tempId) {
          operation.data.review_id = serverId;
        }
        // Handle rollback data
        if (operation.rollbackData?.review_id === tempId) {
          operation.rollbackData.review_id = serverId;
        }
        break;
      }
      case 'checklist': {
        if (operation.data.checklist_id === tempId) {
          operation.data.checklist_id = serverId;
        }
        // Handle rollback data
        if (operation.rollbackData?.checklist_id === tempId) {
          operation.rollbackData.checklist_id = serverId;
        }
        break;
      }
    }
  }
}

/**
 * Removes operations that depend on a failed operation
 * @param {string} failedId - The ID of the failed operation
 */
function removeDependendentOperations(failedId) {
  // Remove operations that reference the failed ID
  transactionQueue.forEach((op, index) => {
    const hasReference = Object.values(op.data).some((value) => value === failedId);
    if (hasReference) {
      console.log(`Removing dependent operation:`, op);
      // Might need to go down the tree more to remove all things like
      // reviews for a project and then checklists for those reviews
      // Mark for removal
      op.status = 'removed';
    }
  });

  // Filter out removed operations
  const newQueue = transactionQueue.filter((op) => op.status !== 'removed');
  transactionQueue.length = 0;
  transactionQueue.push(...newQueue);
}
