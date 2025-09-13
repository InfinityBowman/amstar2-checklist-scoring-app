/**
 * Project factory.
 *
 * TODO: add import/export functions for projects, rewrite to be like AMSTAR2Checklist.js so it is a class with static methods
 *
 * @param {Object} options - Project properties.
 * @param {string} options.id - Unique project ID.
 * @param {string} options.name - Project name/title.
 * @param {number} [options.createdAt=Date.now()] - Timestamp of project creation.
 * @param {Array} [options.checklists=[]] - Array of checklist objects or checklist IDs.
 * @returns {Object} a project object.
 */
export function createProject({ id, name, createdAt = Date.now(), checklists = [] } = {}) {
  if (name === null) {
    throw new Error('Project name cannot be null');
  }
  return {
    id,
    name,
    createdAt,
    checklists,
  };
}
