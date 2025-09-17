// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

// Ensure API_BASE_URL doesn't already include the API prefix
let baseUrl = API_BASE_URL;
if (baseUrl.endsWith('/api/v1')) {
  baseUrl = baseUrl.replace('/api/v1', '');
}

// Debug logging
console.log('VITE_API_URL env var:', import.meta.env.VITE_API_URL);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('baseUrl:', baseUrl);
console.log('API_PREFIX:', API_PREFIX);

export const API_ENDPOINTS = {
  // Auth endpoints
  SIGNUP: `${baseUrl}${API_PREFIX}/auth/signup`,
  SIGNIN: `${baseUrl}${API_PREFIX}/auth/signin`,
  SIGNOUT: `${baseUrl}${API_PREFIX}/auth/signout`,
  REFRESH: `${baseUrl}${API_PREFIX}/auth/refresh`,
  
  // User endpoints
  CURRENT_USER: `${baseUrl}${API_PREFIX}/users/me`,
  
  // Health check endpoints (no API prefix)
  HEALTH: `${baseUrl}/healthz`,
  HEALTH_DB: `${baseUrl}/healthz/db`,
};

// Debug logging for final URLs
console.log('Final API URLs:');
console.log('SIGNUP:', API_ENDPOINTS.SIGNUP);
console.log('SIGNIN:', API_ENDPOINTS.SIGNIN);

export default API_ENDPOINTS;
