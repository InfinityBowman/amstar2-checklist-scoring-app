import { createStore } from 'solid-js/store';
import { createSignal, createEffect, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';

/**
 * Authentication hook with access and refresh token support
 */
export function useAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);

  // Store auth state (access token in memory only)
  const [auth, setAuth] = createStore({
    accessToken: null, // Stored in memory only, not persisted
    user: null,
    isAuthenticated: false,
  });

  /**
   * Refresh the access token using HttpOnly refresh token
   */
  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include HttpOnly refresh token cookie
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      setAuth('accessToken', data.access_token);
      if (data.user) {
        setAuth('user', data.user);
      }
      setAuth('isAuthenticated', true);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      setAuth('accessToken', null);
      setAuth('isAuthenticated', false);
      return false;
    }
  };

  /**
   * Get user profile data
   */
  const fetchUserProfile = async () => {
    if (!auth.accessToken) return null;

    try {
      const response = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setAuth('user', userData);
        return userData;
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  /**
   * Login user
   */
  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // For the HttpOnly refresh token cookie
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();

      // Store the access token in memory (not localStorage)
      setAuth('accessToken', data.access_token);
      setAuth('user', data.user);
      setAuth('isAuthenticated', true);

      navigate('/');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user
   */
  const signUp = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      navigate('/login');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include the refresh token cookie to invalidate it
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      setAuth('accessToken', null);
      setAuth('user', null);
      setAuth('isAuthenticated', false);
      navigate('/login');
    }
  };

  /**
   * Function to get authorized fetch headers
   */
  const authHeaders = () => {
    return auth.accessToken ?
        {
          Authorization: `Bearer ${auth.accessToken}`,
        }
      : {};
  };

  // Try to refresh the token on mount
  onMount(async () => {
    setLoading(true);
    const refreshed = await refreshToken();
    if (refreshed) {
      await fetchUserProfile();
    }
    setLoading(false);
  });

  // Setup token refresh interval or expiration handler
  // You could also implement token refresh on 401 responses

  return {
    user: () => auth.user,
    isAuthenticated: () => auth.isAuthenticated,
    loading,
    error,
    login,
    logout,
    signUp,
    refreshToken,
    authHeaders,
    resetError: () => setError(null),
  };
}

export default useAuth;
