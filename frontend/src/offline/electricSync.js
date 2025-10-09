import { createShape } from '@electric-sql/solid';
import { createEffect } from 'solid-js';

/**
 * Syncs the projects table from ElectricSQL and calls onUpdate with new data.
 * @param {Object} opts
 * @param {(projects: any[]) => void} opts.onUpdate - Called with new projects array when data changes.
 */
export function syncProjects({ onUpdate }) {
  // Set up a live shape subscription for the projects table
  const { data, error } = createShape({
    url: 'http://localhost:3000/v1/shape',
    params: { table: 'users' },
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
