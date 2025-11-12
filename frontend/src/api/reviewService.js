import { API_ENDPOINTS } from './config.js';
import { authFetch } from './authService.js';

export async function createReview(name, projectId) {
  try {
    const response = await authFetch(`${API_ENDPOINTS.REVIEWS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        project_id: projectId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create review');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

export async function assignReviewer(reviewId, userId) {
  try {
    const response = await authFetch(`${API_ENDPOINTS.REVIEWS}/${reviewId}/assign/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to assign reviewer');
    }

    return await response.json();
  } catch (error) {
    console.error('Error assigning reviewer:', error);
    throw error;
  }
}

// Delete a review by ID
export async function deleteReview(reviewId) {
  try {
    const response = await authFetch(`${API_ENDPOINTS.REVIEWS}/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete review');
    }

    // No content expected on success
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
}
