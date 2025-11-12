// Functions for API integration with backend
import useOnlineStatus from '@primitives/useOnlineStatus.js';

// Search for users by name or email
export async function searchUsers(query, limit = 10) {
  try {
    // This function only works online
    if (!useOnlineStatus()) {
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
    if (useOnlineStatus()) {
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
