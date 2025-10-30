import { createEffect, createSignal, onCleanup } from 'solid-js';
import { createShape } from '@electric-sql/solid';
import { API_ENDPOINTS } from '@api/config.js';
import { solidStore } from '@offline/solidStore';
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
        acc[table] = createShape(() => ({
          // url: `${`http://localhost:3000/v1/shape`}`,
          // params: { table },
          url: `${API_ENDPOINTS.ELECTRIC_SHAPE}/${table}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller().signal,
        }));
        return acc;
      }, {});

      setShapes(newShapes);
    }
  });

  // When any shape's data changes, trigger sync
  createEffect(() => {
    const currentShapes = shapes();
    Object.values(currentShapes).forEach((shape) => {
      if (shape && typeof shape.data === 'function') {
        shape.data();
      }
    });
    debouncedSync();
  });

  async function syncToTinyBase() {
    const syncStore = solidStore.tinyStore;

    console.log('Syncing Electric data to TinyBase store...');

    const currentShapes = shapes();
    // For each table, set all rows in TinyBase
    const tablesToSync = [
      { name: 'projects', data: currentShapes.projects?.data() ?? [] },
      { name: 'users', data: currentShapes.users?.data() ?? [] },
      { name: 'reviews', data: currentShapes.reviews?.data() ?? [] },
      { name: 'checklists', data: currentShapes.checklists?.data() ?? [] },
      { name: 'checklist_answers', data: currentShapes.checklist_answers?.data() ?? [] },
      { name: 'project_members', data: currentShapes.project_members?.data() ?? [] },
      { name: 'review_assignments', data: currentShapes.review_assignments?.data() ?? [] },
    ];
    console.log('Tables to sync:', tablesToSync);

    syncStore.transaction(() => {
      for (const { name, data } of tablesToSync) {
        if (Array.isArray(data)) {
          // 1. Build a set of synced IDs for this table
          const syncedIds = new Set();
          for (const row of data) {
            if (name === 'project_members') {
              syncedIds.add(`${row.project_id}::${row.user_id}`);
            } else if (name === 'review_assignments') {
              syncedIds.add(`${row.review_id}::${row.user_id}`);
            } else {
              syncedIds.add(row.id);
            }
          }

          // 2. Remove all rows except local-only or unsynced or present in sync
          const localRows = syncStore.getTable(name);
          Object.entries(localRows).forEach(([id, row]) => {
            if (!row || row.status === 'local-only' || row.sync_status === 'unsynced') return;
            if (!syncedIds.has(id)) {
              syncStore.delRow(name, id);
            }
          });

          // 3. Upsert all synced rows
          for (const row of data) {
            // console.log(`Syncing table ${name}, row: ${JSON.stringify(row)}`);
            // Skip local-only or unsynced items for now
            if (row.status === 'local-only' || row.status === 'unsynced') {
              continue;
            }
            // syncStore.delRow(name, row.id);

            if (name === 'checklist_answers' && Array.isArray(row.answers)) {
              syncStore.setRow(name, row.id, { ...row, answers: JSON.stringify(row.answers) });
            } else if (name === 'project_members') {
              const rowId = `${row.project_id}::${row.user_id}`;
              syncStore.setRow(name, rowId, row);
            } else if (name === 'review_assignments') {
              const rowId = `${row.review_id}::${row.user_id}`;
              syncStore.setRow(name, rowId, row);
            } else {
              syncStore.setRow(name, row.id, row);
            }
          }
        }
      }
    });
    // await synchronizer1.destroy();
    // await synchronizer2.destroy();
    // console.log(syncStore.getTables());
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

  // Trigger sync when user changes (e.g., login/logout)
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
