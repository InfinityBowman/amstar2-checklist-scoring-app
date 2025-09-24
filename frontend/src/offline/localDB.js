const DB_NAME = 'corates-app-db';
const CHECKLIST_STORE_NAME = 'checklists';
const PROJECT_STORE_NAME = 'projects';
const DB_VERSION = 1;

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
    tx.oncomplete = () => resolve();
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
    tx.oncomplete = () => resolve();
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
    tx.oncomplete = () => resolve();
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

export async function deleteChecklistFromProject(projectId, checklistId) {
  try {
    const project = await getProject(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    project.checklists = project.checklists.filter((cl) => cl.id !== checklistId);
    await saveProject(project);

    return true;
  } catch (error) {
    console.error('Error deleting checklist from project:', error);
    throw error;
  }
}

export async function saveChecklistToProject(projectId, checklist) {
  try {
    // First, save/update the checklist itself in the checklists store
    await saveChecklist(checklist);

    // Get the project to update
    const project = await getProject(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Find if the checklist already exists in the project
    const checklistIndex = project.checklists.findIndex((cl) => cl.id === checklist.id);

    if (checklistIndex >= 0) {
      // Update existing checklist
      project.checklists[checklistIndex] = deepClone(checklist);
    } else {
      console.log('Adding new checklist to project', deepClone(checklist));
      // Add new checklist to project
      project.checklists.push(deepClone(checklist));
    }

    // Save the updated project back to IndexedDB
    await saveProject(project);

    return project;
  } catch (error) {
    console.error('Error saving checklist to project:', error);
    throw error;
  }
}

export async function deleteProject(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECT_STORE_NAME, 'readwrite');
    tx.objectStore(PROJECT_STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Collision is super low but not impossible
export function generateUUID() {
  return crypto.randomUUID();
}
