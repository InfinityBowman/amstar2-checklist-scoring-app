// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// const API_BASE_URL = 'http://localhost:3004';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

// Ensure API_BASE_URL doesn't already include the API prefix
let baseUrl = API_BASE_URL;
if (baseUrl.endsWith('/api/v1')) {
  baseUrl = baseUrl.replace('/api/v1', '');
}

export const API_ENDPOINTS = {
  // Auth endpoints
  SIGNUP: `${baseUrl}${API_PREFIX}/auth/signup`,
  SIGNIN: `${baseUrl}${API_PREFIX}/auth/signin`,
  SIGNOUT: `${baseUrl}${API_PREFIX}/auth/signout`,
  REFRESH: `${baseUrl}${API_PREFIX}/auth/refresh`,
  SEND_VERIFICATION: `${baseUrl}${API_PREFIX}/auth/send-verification`,
  VERIFY_EMAIL: `${baseUrl}${API_PREFIX}/auth/verify-email`,
  REQUEST_PASSWORD_RESET: `${baseUrl}${API_PREFIX}/auth/request-password-reset`,
  RESET_PASSWORD: `${baseUrl}${API_PREFIX}/auth/reset-password`,

  // User endpoints
  CURRENT_USER: `${baseUrl}${API_PREFIX}/users/me`,
  SEARCH_USERS: `${baseUrl}${API_PREFIX}/users/search`,

  // Project endpoints
  PROJECTS: `${baseUrl}${API_PREFIX}/projects`,

  // Review endpoints
  REVIEWS: `${baseUrl}${API_PREFIX}/reviews`,

  // Checklist endpoints
  CHECKLISTS: `${baseUrl}${API_PREFIX}/checklists`,

  ELECTRIC_SHAPE: `${baseUrl}${API_PREFIX}/shapes`,

  // Health check endpoints (no API prefix)
  HEALTH: `${baseUrl}/healthz`,
  HEALTH_DB: `${baseUrl}/healthz/db`,
};

// Debug logging for final URLs
// console.log('Final API URLs:');
// console.log('SIGNUP:', API_ENDPOINTS.SIGNUP);
// console.log('SIGNIN:', API_ENDPOINTS.SIGNIN);

export default API_ENDPOINTS;
