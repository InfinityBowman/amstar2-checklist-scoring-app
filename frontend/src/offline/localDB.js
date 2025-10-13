const DB_NAME = 'corates-app-db';
const CHECKLIST_STORE_NAME = 'checklists';
const PROJECT_STORE_NAME = 'projects';
const DB_VERSION = 1;

// This lets us notify other tabs of changes
// so they can sync their state if a user has multiple tabs open
const channel = new BroadcastChannel('corates-sync');

function initiateSync() {
  channel.postMessage('initiate-sync');
}

export function subscribeToDBChanges(callback) {
  channel.onmessage = (event) => {
    if (event.data === 'initiate-sync') callback();
  };
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CHECKLIST_STORE_NAME)) {
        db.createObjectStore(CHECKLIST_STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PROJECT_STORE_NAME)) {
        db.createObjectStore(PROJECT_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveChecklist(checklist) {
  const db = await openDB();
  checklist = deepClone(checklist);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHECKLIST_STORE_NAME, 'readwrite');
    tx.objectStore(CHECKLIST_STORE_NAME).put(checklist);
    tx.oncomplete = () => {
      resolve();
      initiateSync();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllChecklists() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHECKLIST_STORE_NAME, 'readonly');
    const store = tx.objectStore(CHECKLIST_STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getChecklist(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHECKLIST_STORE_NAME, 'readonly');
    const req = tx.objectStore(CHECKLIST_STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteChecklist(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHECKLIST_STORE_NAME, 'readwrite');
    tx.objectStore(CHECKLIST_STORE_NAME).delete(id);
    tx.oncomplete = () => {
      resolve();
      initiateSync();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteAllChecklists() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHECKLIST_STORE_NAME, 'readwrite');
    const store = tx.objectStore(CHECKLIST_STORE_NAME);
    const clearReq = store.clear();
    clearReq.onsuccess = () => resolve();
    clearReq.onerror = () => reject(clearReq.error);
  });
}

export async function saveProject(project) {
  const db = await openDB();
  project = deepClone(project);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECT_STORE_NAME, 'readwrite');
    tx.objectStore(PROJECT_STORE_NAME).put(project);
    tx.oncomplete = () => {
      resolve();
      initiateSync();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function getProject(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECT_STORE_NAME, 'readonly');
    const req = tx.objectStore(PROJECT_STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllProjects() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECT_STORE_NAME, 'readonly');
    const store = tx.objectStore(PROJECT_STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Save or update a checklist in a specific review of a project.
 * If the checklist exists (by id), it is updated; otherwise, it is added.
 * Returns the updated project object.
 *
 * @param {string} projectId - The ID of the project.
 * @param {string} reviewId - The ID of the review.
 * @param {object} checklist - The checklist object to add or update.
 * @returns {Promise<object>} The updated project.
 */
export async function saveChecklistToReview(projectId, reviewId, checklist) {
  try {
    const project = await getProject(projectId);
    if (!project) throw new Error(`Project with ID ${projectId} not found`);
    if (!project.reviews) project.reviews = [];

    const reviewIndex = project.reviews.findIndex((r) => r.id === reviewId);
    if (reviewIndex === -1) throw new Error(`Review with ID ${reviewId} not found in project ${projectId}`);

    const review = project.reviews[reviewIndex];
    if (!review.checklists) review.checklists = [];

    const checklistIndex = review.checklists.findIndex((cl) => cl.id === checklist.id);

    if (checklistIndex >= 0) {
      // Update existing checklist
      review.checklists[checklistIndex] = deepClone(checklist);
    } else {
      // Add new checklist
      review.checklists.push(deepClone(checklist));
    }

    // Save the updated project back to IndexedDB
    await saveProject(project);

    return project;
  } catch (error) {
    console.error('Error saving checklist to review:', error);
    throw error;
  }
}

/**
 * Delete a checklist from a specific review in a project.
 * Returns true if deleted, false if not found.
 *
 * @param {string} projectId - The ID of the project.
 * @param {string} reviewId - The ID of the review.
 * @param {string} checklistId - The ID of the checklist to delete.
 * @returns {Promise<boolean>} True if deleted, false if not found.
 */
export async function deleteChecklistFromReview(projectId, reviewId, checklistId) {
  try {
    const project = await getProject(projectId);
    if (!project) throw new Error(`Project with ID ${projectId} not found`);
    if (!project.reviews) project.reviews = [];

    const reviewIndex = project.reviews.findIndex((r) => r.id === reviewId);
    if (reviewIndex === -1) throw new Error(`Review with ID ${reviewId} not found in project ${projectId}`);

    const review = project.reviews[reviewIndex];
    if (!review.checklists) review.checklists = [];

    const initialLength = review.checklists.length;
    review.checklists = review.checklists.filter((cl) => cl.id !== checklistId);

    if (review.checklists.length === initialLength) {
      // Checklist not found
      return false;
    }

    // Save the updated project back to IndexedDB
    await saveProject(project);
    return true;
  } catch (error) {
    console.error('Error deleting checklist from review:', error);
    throw error;
  }
}

/**
 * Save or update a review in a project.
 * If the review exists (by id), it is updated; otherwise, it is added.
 * Returns the updated project object.
 *
 * @param {string} projectId - The ID of the project.
 * @param {object} review - The review object to add or update.
 * @returns {Promise<object>} The updated project.
 */
export async function saveReviewToProject(projectId, review) {
  try {
    const project = await getProject(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    if (!project.reviews) project.reviews = [];

    const reviewIndex = project.reviews.findIndex((r) => r.id === review.id);

    if (reviewIndex >= 0) {
      // Update existing review
      project.reviews[reviewIndex] = deepClone(review);
    } else {
      // Add new review
      project.reviews.push(deepClone(review));
    }

    await saveProject(project);

    return project;
  } catch (error) {
    console.error('Error saving review to project:', error);
  }
}

/**
 * Delete a review from a project by review ID.
 * Returns true if deleted, false if not found.
 *
 * @param {string} projectId - The ID of the project.
 * @param {string} reviewId - The ID of the review to delete.
 * @returns {Promise<boolean>} True if deleted, false if not found.
 */
export async function deleteReviewFromProject(projectId, reviewId) {
  try {
    const project = await getProject(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    if (!project.reviews) project.reviews = [];

    const initialLength = project.reviews.length;
    project.reviews = project.reviews.filter((r) => r.id !== reviewId);

    if (project.reviews.length === initialLength) {
      // Review not found
      return false;
    }

    await saveProject(project);
    return true;
  } catch (error) {
    console.error('Error deleting review from project:', error);
    throw error;
  }
}

export async function deleteProject(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECT_STORE_NAME, 'readwrite');
    tx.objectStore(PROJECT_STORE_NAME).delete(id);
    tx.oncomplete = () => {
      resolve();
      initiateSync();
    };
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Generate a unique short ID (first part of a UUID) that does not collide with any
 * existing project, review, or checklist IDs in the database.
 * @returns {Promise<string>} A unique short ID.
 */
export async function generateUUID() {
  // Gather all existing IDs from projects, reviews, checklists
  const [allProjects, allChecklists] = await Promise.all([getAllProjects(), getAllChecklists()]);
  const existingIds = new Set();

  // Add project IDs
  for (const project of allProjects) {
    existingIds.add(project.id);
    // Add review IDs
    for (const review of project.reviews || []) {
      existingIds.add(review.id);
      // Add checklist IDs in reviews
      for (const checklist of review.checklists || []) {
        existingIds.add(checklist.id);
      }
    }
  }
  // Add independent checklist IDs
  for (const checklist of allChecklists) {
    existingIds.add(checklist.id);
  }

  // Try until we get a unique one
  let shortId;
  do {
    const uuid = crypto.randomUUID();
    shortId = uuid.split('-')[0];
  } while (existingIds.has(shortId));

  return shortId;
}
