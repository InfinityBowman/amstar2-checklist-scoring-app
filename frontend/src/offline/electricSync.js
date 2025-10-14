import { createShape } from '@electric-sql/solid';
import { createEffect } from 'solid-js';
import { API_ENDPOINTS } from '@api/config.js';
import { useAuth } from '@auth/AuthProvider.jsx';

/**
 * Syncs the projects table from ElectricSQL and calls onUpdate with new data.
 * @param {Object} opts
 * @param {(projects: any[]) => void} opts.onUpdate - Called with new projects array when data changes.
 */
export function syncProjects({ onUpdate }) {
  // Set up a live shape subscription for the projects table
  const { authFetch } = useAuth();

  const { data, error } = createShape({
    url: API_ENDPOINTS.ELECTRIC_SHAPE,
    params: {
      table: `users`,
    },
    fetchClient: authFetch,
  });

  // Watch for changes and call onUpdate
  createEffect(() => {
    if (data()) {
      // onUpdate(data());
      console.log('Projects data updated:', data());
    }
    if (error()) {
      console.error('Electric sync error:', error());
    }
  });
}
