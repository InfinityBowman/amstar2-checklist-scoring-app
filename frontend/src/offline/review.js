/**
 * Review factory.
 *
 * @param {Object} options - Review properties.
 * @param {string} options.id - Unique review ID.
 * @param {string} options.name - Review name/title.
 * @param {number} [options.createdAt=Date.now()] - Timestamp of review creation.
 * @param {Array} [options.checklists=[]] - Array of checklist objects.
 * @param {string} [options.pdfFileName] - Optional file name for linked PDF (stored via fileStorage).
 * @returns {Object} a review object.
 */
export function createReview({ id, name, createdAt = Date.now(), checklists = [], pdfFileName = null } = {}) {
  if (!id) throw new Error('Review id is required');
  if (!name) throw new Error('Review name is required');
  return {
    id,
    name,
    createdAt,
    checklists,
    pdfFileName, // This is the file name/key for fileStorage.js
  };
}

// TODO: Implement CSV import/export for review
export function exportReviewToCSV(review) {
  throw new Error('Not implemented yet', review);
}

export function importReviewFromCSV(csvString) {
  throw new Error('Not implemented yet', csvString);
}
