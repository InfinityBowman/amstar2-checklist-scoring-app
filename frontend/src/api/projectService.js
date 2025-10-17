import { API_ENDPOINTS } from './config.js';
import { authFetch } from './authService.js';

export async function createProject(name) {
  console.log('Creating project with name:', name);
  try {
    let start = performance.now();
    const response = await authFetch(`${API_ENDPOINTS.PROJECTS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    let end = performance.now();
    console.log(`createProject API call took ${end - start} ms`);

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

export async function addUserToProject(projectId, userId) {
  try {
    const response = await authFetch(`${API_ENDPOINTS.PROJECTS}/${projectId}/members/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

export async function addUserToProjectByEmail(projectId, email) {
  try {
    const response = await authFetch(`${API_ENDPOINTS.PROJECTS}/${projectId}/members/add-by-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to add user to project');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding user to project by email:', error);
    throw error;
  }
}
