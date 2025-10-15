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

// listen for periodic sync
// self.addEventListener('sync', (event) => {
//   if (event.tag === 'sync-actions') {
//     event.waitUntil(processOfflineActions());
//   }
// });
