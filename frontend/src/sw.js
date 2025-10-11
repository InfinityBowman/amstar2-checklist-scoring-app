import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

console.log('Service worker loaded');

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

// clean old assets
cleanupOutdatedCaches();

let allowlist;
if (import.meta.env.DEV) allowlist = [/^\/$/];

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL('/amstar2-checklist-scoring-app/index.html'), { allowlist }));

// Add route handler to bypass API requests - let them go to the network
// Match any URL that includes /api to ensure all API calls go to network
const apiUrlPattern = /\/api\//;
registerRoute(({ url }) => apiUrlPattern.test(url.href), new NetworkOnly());

// activate the service worker as soon as it's finished installing
// don't ask user to accept any prompts
self.skipWaiting();
clientsClaim();

// --- logic for offline actions ---

// Open IndexedDB
function openActionsDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('actions-db', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('actions')) {
        db.createObjectStore('actions', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get all actions
function getAllActions(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('actions', 'readonly');
    const store = tx.objectStore('actions');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Delete action
function deleteAction(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('actions', 'readwrite');
    const store = tx.objectStore('actions');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Process actions when online
async function processOfflineActions() {
  const db = await openActionsDB();
  const actions = await getAllActions(db);
  for (const action of actions) {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(action),
        headers: { 'Content-Type': 'application/json' },
      });
      await deleteAction(db, action.id);
    } catch (err) {
      // If failed, keep for next sync
    }
  }
}

// Listen for connectivity regain
self.addEventListener('online', () => {
  console.log('Back online, processing offline actions...');
  // processOfflineActions();
});

// listen for periodic sync
// self.addEventListener('sync', (event) => {
//   if (event.tag === 'sync-actions') {
//     event.waitUntil(processOfflineActions());
//   }
// });
