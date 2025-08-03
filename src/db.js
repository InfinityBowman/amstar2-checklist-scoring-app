export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('amstar-db', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      db.createObjectStore('checklists', { keyPath: 'id' });
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e);
  });
}

export async function saveChecklist(data) {
  const db = await openDB();
  const tx = db.transaction('checklists', 'readwrite');
  tx.objectStore('checklists').put(data);
  return tx.complete;
}

export async function getChecklist(id) {
  const db = await openDB();
  return db.transaction('checklists').objectStore('checklists').get(id);
}
