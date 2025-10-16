import { API_ENDPOINTS } from './config.js';
import { authFetch } from './authService.js';

/**
 * Search for users by name or email
 *
 * @param {string} query - Search term for name or email
 * @param {number} limit - Maximum number of results to return (default: 10)
 * @returns {Promise<Array>} Array of user objects matching the search criteria
 */
export async function searchUsers(query, limit = 10) {
  try {
    // Build search URL with query parameters
    const searchUrl = new URL(API_ENDPOINTS.SEARCH_USERS);
    if (query) {
      searchUrl.searchParams.append('q', query);
    }
    searchUrl.searchParams.append('limit', limit.toString());

    const response = await authFetch(searchUrl.toString());

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to search users');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}
