import { createEffect, createSignal, onCleanup } from 'solid-js';
import { createShape } from '@electric-sql/solid';
import { API_ENDPOINTS } from '@api/config.js';
import { createMergeableStore } from 'tinybase';
import { createLocalSynchronizer } from 'tinybase/synchronizers/synchronizer-local';
import { solidStore, schema } from '@offline/solidStore';
import { useAuth } from '@/auth/AuthStore.js';

export default function DataLoader() {
  const [isSyncing, setIsSyncing] = createSignal(false);
  const [error, setError] = createSignal(null);
  const [controller, _] = createSignal(new AbortController());
  const [shapes, setShapes] = createSignal({});

  // Get access token should probably refetch if it expires
  const { user, getAccessToken } = useAuth();

  console.log('%cDataLoader mounted', 'color: green;');

  createEffect(() => {
    if (user()) {
      // Only create shapes when we have a user
      const accessToken = getAccessToken();
      const tables = [
        'users',
        'projects',
        'reviews',
        'checklists',
        'project_members',
        'review_assignments',
        'checklist_answers',
      ];

      const newShapes = tables.reduce((acc, table) => {
        acc[table] = createShape({
          // url: `${API_ENDPOINTS.ELECTRIC_SHAPE}/${table}`,
          url: `${API_ENDPOINTS.ELECTRIC_SHAPE}`,
          params: { table },
          // headers: {
          //   Authorization: `Bearer ${accessToken}`,
          // },
          signal: controller().signal,
        });
        return acc;
      }, {});

      setShapes(newShapes);
    }
  });

  createEffect(() => {
    const currentShapes = shapes();
    // Listen to each table's data
    Object.values(currentShapes).forEach((shape) => {
      if (shape && typeof shape.data === 'function') {
        // This effect will rerun when shape.data() changes
        shape.data(); // Access to register dependency
      }
    });
    // When any shape's data changes, trigger sync
    debouncedSync();
  });

  async function syncToTinyBase() {
    const syncStore = createMergeableStore();
    syncStore.setSchema(schema);

    // Clean up existing synchronizers if they exist
    if (synchronizer1) await synchronizer1.destroy();
    if (synchronizer2) await synchronizer2.destroy();

    // Create new synchronizers
    synchronizer1 = createLocalSynchronizer(solidStore.tinyStore);
    synchronizer2 = createLocalSynchronizer(syncStore);

    // Start syncing
    synchronizer1.startSync();
    synchronizer2.startSync();

    console.log('Syncing Electric data to TinyBase store...');

    const currentShapes = shapes();
    // For each table, set all rows in TinyBase
    const tablesToSync = [
      { name: 'projects', data: currentShapes.projects?.data() ?? [] },
      { name: 'reviews', data: currentShapes.reviews?.data() ?? [] },
      { name: 'checklists', data: currentShapes.checklists?.data() ?? [] },
      { name: 'checklist_answers', data: currentShapes.checklist_answers?.data() ?? [] },
      { name: 'project_members', data: currentShapes.project_members?.data() ?? [] },
      { name: 'review_assignments', data: currentShapes.review_assignments?.data() ?? [] },
    ];

    for (const { name, data } of tablesToSync) {
      if (Array.isArray(data)) {
        syncStore.delTable(name);

        for (const row of data) {
          if (name === 'checklist_answers' && Array.isArray(row.answers)) {
            syncStore.setRow(name, row.id, { ...row, answers: JSON.stringify(row.answers) });
          }
          // Special handling for composite key tables
          else if (name === 'project_members') {
            // Create a composite key from project_id and user_id
            const rowId = `${row.project_id}::${row.user_id}`;
            syncStore.setRow(name, rowId, row);
          } else if (name === 'review_assignments') {
            // Create a composite key from review_id and user_id
            const rowId = `${row.review_id}::${row.user_id}`;
            syncStore.setRow(name, rowId, row);
          } else {
            syncStore.setRow(name, row.id, row);
          }
        }
      }
    }
    // await synchronizer1.destroy();
    // await synchronizer2.destroy();
    console.log(syncStore.getTables());
  }
  let synchronizer1 = null;
  let synchronizer2 = null;

  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Debounced sync function
  const debouncedSync = debounce(async () => {
    try {
      setIsSyncing(true);
      // Clean up any existing synchronizers
      if (synchronizer1) await synchronizer1.destroy();
      if (synchronizer2) await synchronizer2.destroy();

      await syncToTinyBase();
      setError(null);
    } catch (err) {
      console.error('Sync error:', err);
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  }, 1000); // 1 second debounce

  createEffect(() => {
    if (user()) {
      console.log('User changed, triggering sync...');
      debouncedSync();
    }
  });

  onCleanup(async () => {
    // Abort any pending requests
    controller().abort();
    // Clean up synchronizers
    if (synchronizer1) await synchronizer1.destroy();
    if (synchronizer2) await synchronizer2.destroy();
  });

  return (
    <div class="fixed bottom-4 right-4 z-50">
      {error() && <div class="bg-red-100 text-red-800 px-4 py-2 rounded-md shadow">Sync failed. Please try again.</div>}
      {isSyncing() && <div class="bg-blue-100 text-blue-800 px-4 py-2 rounded-md shadow">Syncing data...</div>}
    </div>
  );
}
