/**
 * Project factory.
 *
 * @param {Object} options - Project properties.
 * @param {string} options.id - Unique project ID.
 * @param {string} options.name - Project name/title.
 * @param {number} [options.createdAt=Date.now()] - Timestamp of project creation.
 * @param {Array} [options.reviews=[]] - Array of review objects containing pdf link or checklist.
 * @returns {Object} a project object.
 */
export function createProject({ id, name, createdAt = Date.now(), reviews = [] } = {}) {
  if (name === null) {
    throw new Error('Project name cannot be null');
  }
  return {
    id,
    name,
    createdAt,
    reviews,
  };
}

// TODO: Implement CSV import/export for projects
export function exportProjectToCSV(project) {}

export function importProjectFromCSV(csvString) {}
