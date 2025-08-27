/**
 * Project factory.
 *
 * @param {Object} options - Project properties.
 * @param {string} options.id - Unique project ID.
 * @param {string} options.name - Project name/title.
 * @param {number} [options.createdAt=Date.now()] - Timestamp of project creation.
 * @param {Array} [options.checklists=[]] - Array of checklist objects or checklist IDs.
 * @returns {Object} a project object.
 */
export function createProject({ id, name, createdAt = Date.now(), checklists = [] } = {}) {
  return {
    id,
    name,
    createdAt,
    checklists,
  };
}
