import * as localDB from '@offline/localDB';

// Flag to track online status
let isOnline = navigator.onLine;

// Listen for online/offline events
window.addEventListener('online', () => {
  isOnline = true;
  syncPendingChanges(); // Attempt to sync when going online
});
window.addEventListener('offline', () => {
  isOnline = false;
});

// Queue for storing operations that need to be synced
const syncQueue = [];

// Add an operation to the sync queue
export function queueSyncOperation(operation, data) {
  syncQueue.push({ operation, data, timestamp: Date.now() });

  // Store the queue in localStorage for persistence
  localStorage.setItem('syncQueue', JSON.stringify(syncQueue));

  // If we're online, try to sync immediately
  if (isOnline) {
    syncPendingChanges();
  }
}

// Process the sync queue
export async function syncPendingChanges() {
  if (!isOnline || syncQueue.length === 0) return;

  console.log(`Attempting to sync ${syncQueue.length} pending changes`);

  for (let i = 0; i < syncQueue.length; i++) {
    const { operation, data } = syncQueue[i];

    try {
      // Process different operation types
      switch (operation) {
        case 'createProject':
          const { createProject } = await import('./projectService.js');
          await createProject(data.name);
          break;

        case 'addUserToProject':
          const { addUserToProject } = await import('./projectService.js');
          await addUserToProject(data.projectId, data.userId);
          break;

        case 'addUserToProjectByEmail':
          const { addUserToProjectByEmail } = await import('./projectService.js');
          await addUserToProjectByEmail(data.projectId, data.email);
          break;

        case 'createReview':
          const { createReview } = await import('./reviewService.js');
          await createReview(data.name, data.projectId);
          break;

        case 'assignReviewer':
          const { assignReviewer } = await import('./reviewService.js');
          await assignReviewer(data.reviewId, data.userId);
          break;

        case 'createChecklist':
          const { createChecklist } = await import('./checklistService.js');
          await createChecklist(data.reviewId, data.reviewerId);
          break;

        case 'completeChecklist':
          const { completeChecklist } = await import('./checklistService.js');
          await completeChecklist(data.checklistId);
          break;

        case 'saveChecklistAnswer':
          const { saveChecklistAnswer } = await import('./checklistService.js');
          await saveChecklistAnswer(data.checklistId, data.questionKey, data.answers, data.isCritical);
          break;

        default:
          console.warn(`Unknown operation type: ${operation}`);
          continue;
      }

      // If successful, remove the operation from the queue
      syncQueue.splice(i, 1);
      i--; // Adjust index since we removed an item
    } catch (error) {
      console.error(`Failed to sync operation ${operation}:`, error);
      // We'll keep it in the queue to retry later
    }
  }

  // Update stored queue
  localStorage.setItem('syncQueue', JSON.stringify(syncQueue));

  console.log(`Sync complete. ${syncQueue.length} operations remaining.`);
}

// Initialize: Load queue from localStorage and attempt to sync
export function initializeSync() {
  const storedQueue = localStorage.getItem('syncQueue');
  if (storedQueue) {
    try {
      const parsedQueue = JSON.parse(storedQueue);
      syncQueue.push(...parsedQueue);
    } catch (error) {
      console.error('Failed to parse stored sync queue:', error);
    }
  }

  // Try to sync on initialization if online
  if (isOnline) {
    syncPendingChanges();
  }
}

// Export utility to check if we're online
export function getOnlineStatus() {
  return isOnline;
}

// Initialize on import
initializeSync();
