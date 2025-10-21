import { API_ENDPOINTS } from './config.js';
import { authFetch } from './authService.js';

export async function createProject(name) {
  // console.log('Creating project with name:', name);
  try {
    // let start = performance.now();
    const response = await authFetch(`${API_ENDPOINTS.PROJECTS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    // console.log(`createProject API call took ${performance.now() - start} ms`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create project');
    }
    let responseJson = await response.json();
    console.log('Project created successfully:', responseJson);

    return responseJson;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export async function deleteProject(projectId) {
  try {
    const response = await authFetch(`${API_ENDPOINTS.PROJECTS}/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete project');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

export async function addUserToProject(projectId, userId) {
  try {
    const response = await authFetch(`${API_ENDPOINTS.PROJECTS}/${projectId}/add-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to add user to project');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding user to project:', error);
    throw error;
  }
}

export async function removeUserFromProject(projectId, userId) {
  try {
    const response = await authFetch(`${API_ENDPOINTS.PROJECTS}/${projectId}/remove-user`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to remove user from project');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing user from project:', error);
    throw error;
  }
}
