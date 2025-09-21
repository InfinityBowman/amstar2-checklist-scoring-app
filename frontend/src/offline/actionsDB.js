const DB_NAME = 'corates-app-db';
const ACTIONS_STORE_NAME = 'actions';
const DB_VERSION = 1;
const CHECKLIST_STORE_NAME = 'checklists';
const PROJECT_STORE_NAME = 'projects';

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ACTIONS_STORE_NAME)) {
        db.createObjectStore(ACTIONS_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAction(action) {
  const db = await openDB();
  const cloned = deepClone(action);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ACTIONS_STORE_NAME, 'readwrite');
    tx.objectStore(ACTIONS_STORE_NAME).put(cloned);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

await saveAction({
  id: crypto.randomUUID(),
  type: 'sync-checklist',
  checklistId: 'abc123', // optional, if saving checklist
  projectId: 'def456', // optional, if saving project
  timestamp: Date.now(),
});
