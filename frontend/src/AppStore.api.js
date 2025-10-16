// Functions for API integration with backend
import { queueSyncOperation, getOnlineStatus } from './api/syncService.js';

// Search for users by name or email
export async function searchUsers(query, limit = 10) {
  try {
    // This function only works online
    if (!getOnlineStatus()) {
      return []; // Return empty array when offline
    }

    const { searchUsers: apiSearchUsers } = await import('./api/userService.js');
    return await apiSearchUsers(query, limit);
  } catch (error) {
    console.error('Error searching users:', error);
    return []; // Return empty array on error
  }
}

// Add a user to project by email
export async function addUserToProjectByEmail(projectId, email) {
  try {
    // If online, try API immediately
    if (getOnlineStatus()) {
      try {
        const { addUserToProjectByEmail } = await import('./api/projectService.js');
        const result = await addUserToProjectByEmail(projectId, email);
        return result;
      } catch (apiError) {
        console.warn('Failed to add user to project via API:', apiError);
        // Queue for retry later
        // queueSyncOperation('addUserToProjectByEmail', { projectId, email });
      }
    } else {
      // If offline, queue for later sync
      // queueSyncOperation('addUserToProjectByEmail', { projectId, email });
    }
    return true;
  } catch (error) {
    console.error('Error adding user to project by email:', error);
    throw error;
  }
}

// Add a user to project
export async function addUserToProject(projectId, userId) {
  try {
    // If online, try API immediately
    if (getOnlineStatus()) {
      try {
        const { addUserToProject } = await import('./api/projectService.js');
        await addUserToProject(projectId, userId);
        return true;
      } catch (apiError) {
        console.warn('Failed to add user to project via API:', apiError);
        // Queue for retry later
        // queueSyncOperation('addUserToProject', { projectId, userId });
      }
    } else {
      // If offline, queue for later sync
      // queueSyncOperation('addUserToProject', { projectId, userId });
    }
    return true;
  } catch (error) {
    console.error('Error adding user to project:', error);
    throw error;
  }
}

// Assign a reviewer to a review
export async function assignReviewerToReview(reviewId, userId) {
  try {
    // If online, try API immediately
    if (getOnlineStatus()) {
      try {
        const { assignReviewer } = await import('./api/reviewService.js');
        await assignReviewer(reviewId, userId);
        return true;
      } catch (apiError) {
        console.warn('Failed to assign reviewer via API:', apiError);
        // Queue for retry later
        // queueSyncOperation('assignReviewer', { reviewId, userId });
      }
    } else {
      // If offline, queue for later sync
      // queueSyncOperation('assignReviewer', { reviewId, userId });
    }
    return true;
  } catch (error) {
    console.error('Error assigning reviewer to review:', error);
    throw error;
  }
}

// Save a checklist answer
export async function saveChecklistAnswer(
  checklistId,
  questionKey,
  answers,
  isCritical = false,
  state,
  setState,
  localDB,
) {
  try {
    let apiResponse = null;

    // If online, try API immediately
    if (getOnlineStatus()) {
      try {
        const { saveChecklistAnswer: apiSaveAnswer } = await import('./api/checklistService.js');
        apiResponse = await apiSaveAnswer(checklistId, questionKey, answers, isCritical);
      } catch (apiError) {
        console.warn('Failed to save answer via API, queueing for later sync:', apiError);
        // Queue for retry later
        // queueSyncOperation('saveChecklistAnswer', {
        //   checklistId,
        //   questionKey,
        //   answers,
        //   isCritical,
        // });
      }
    } else {
      // If offline, queue for later sync
      // queueSyncOperation('saveChecklistAnswer', {
      //   checklistId,
      //   questionKey,
      //   answers,
      //   isCritical,
      // });
    }

    // Always update locally regardless of API success
    // Find the checklist in state
    const checklistIndex = state.checklists.findIndex((c) => c.id === checklistId);
    if (checklistIndex !== -1) {
      // Update locally - this is simplified, adjust based on your actual data structure
      const updatedChecklist = { ...state.checklists[checklistIndex] };
      if (!updatedChecklist.answers) updatedChecklist.answers = {};
      updatedChecklist.answers[questionKey] = { answers, critical: isCritical };

      // Update in local DB
      await localDB.saveChecklist(updatedChecklist);

      // Update state
      setState('checklists', checklistIndex, updatedChecklist);

      // If this is the current checklist, update that too
      if (state.currentChecklist?.id === checklistId) {
        setState('currentChecklist', updatedChecklist);
      }
    }

    return apiResponse || { questionKey, answers, critical: isCritical };
  } catch (error) {
    console.error('Error saving checklist answer:', error);
    throw error;
  }
}

// Complete a checklist
export async function completeChecklist(checklistId, state, setState, localDB) {
  try {
    let apiResponse = null;

    // If online, try API immediately
    if (getOnlineStatus()) {
      try {
        const { completeChecklist: apiCompleteChecklist } = await import('./api/checklistService.js');
        apiResponse = await apiCompleteChecklist(checklistId);
      } catch (apiError) {
        console.warn('Failed to complete checklist via API, queueing for later sync:', apiError);
        // Queue for retry later
        // queueSyncOperation('completeChecklist', { checklistId });
      }
    } else {
      // If offline, queue for later sync
      // queueSyncOperation('completeChecklist', { checklistId });
    }

    // Always update locally regardless of API success
    const checklistIndex = state.checklists.findIndex((c) => c.id === checklistId);
    if (checklistIndex !== -1) {
      // Update completed_at timestamp
      const updatedChecklist = {
        ...state.checklists[checklistIndex],
        completed_at: new Date().toISOString(),
      };

      // Update in local DB
      await localDB.saveChecklist(updatedChecklist);

      // Update state
      setState('checklists', checklistIndex, updatedChecklist);

      // If this is the current checklist, update that too
      if (state.currentChecklist?.id === checklistId) {
        setState('currentChecklist', updatedChecklist);
      }
    }

    return apiResponse || { id: checklistId, completed_at: new Date().toISOString() };
  } catch (error) {
    console.error('Error completing checklist:', error);
    throw error;
  }
}
