import { API_ENDPOINTS } from './config.js';
import { authFetch } from './authService.js';

export async function createChecklist(reviewId, reviewerId = null) {
  try {
    const checklistData = {
      review_id: reviewId,
      reviewer_id: reviewerId,
      type: 'amstar',
    };

    if (reviewerId) {
      checklistData.reviewer_id = reviewerId;
    }

    const response = await authFetch(`${API_ENDPOINTS.CHECKLISTS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checklistData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create checklist');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating checklist:', error);
    throw error;
  }
}

export async function deleteChecklist(checklistId) {
  try {
    const response = await authFetch(`${API_ENDPOINTS.CHECKLISTS}/${checklistId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete checklist');
    }

    // No content expected on success
    return true;
  } catch (error) {
    console.error('Error deleting checklist:', error);
    throw error;
  }
}

export async function completeChecklist(checklistId) {
  try {
    const response = await authFetch(`${API_ENDPOINTS.CHECKLISTS}/${checklistId}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to complete checklist');
    }

    return await response.json();
  } catch (error) {
    console.error('Error completing checklist:', error);
    throw error;
  }
}

export async function saveChecklistAnswer(checklistId, questionKey, answers, isCritical = false) {
  try {
    const response = await authFetch(`${API_ENDPOINTS.CHECKLISTS}/${checklistId}/answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question_key: questionKey,
        answers: answers,
        critical: isCritical,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to save answer');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving checklist answer:', error);
    throw error;
  }
}
