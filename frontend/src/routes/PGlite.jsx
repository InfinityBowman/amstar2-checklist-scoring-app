import { PGlite } from '@electric-sql/pglite';
import { live } from '@electric-sql/pglite/live';
import { electricSync } from '@electric-sql/pglite-sync';
import { useLiveQuery } from '@electric-sql/pglite-solid';
import { usePGlite } from '@electric-sql/pglite-solid';
import { createSignal, onMount } from 'solid-js';

// Bind data to your components using live queries
// against the local embedded database
export default function PGliteComponent() {
  const [items, setItems] = createSignal([]);
  const db = usePGlite();

  onMount(async () => {
    const result = await db.query(`SELECT * FROM todo;`);
    setItems(result.rows); // assuming result.rows is the array of items
  });

  return (
    <>
      {/* <pre>{JSON.stringify(items(), null, 2)}</pre> */}
      <UsersLiveDemo />
      <PGLiveDemo />
    </>
  );
}

function PGLiveDemo() {
  const liveTodos = useLiveQuery('SELECT * FROM todo');

  return (
    <ul>
      {(liveTodos()?.rows ?? []).map((item) => (
        <li key={item.id}>
          {item.task} (done: {item.done ? 'yes' : 'no'})
        </li>
      ))}
    </ul>
  );
}

export function UsersLiveDemo() {
  const [syncError, setSyncError] = createSignal(null);
  const db = usePGlite();

  onMount(async () => {
    try {
      // Sync the users table shape from Electric
      await db.electric.syncShapeToTable({
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: { table: 'users' },
        },
        table: 'users',
        primaryKey: ['id'],
      });
    } catch (err) {
      setSyncError(err.message || String(err));
    }
  });

  // Live query for users table
  const liveUsers = useLiveQuery('SELECT * FROM users');

  return (
    <>
      {syncError() && <div style={{ color: 'red' }}>Sync error: {syncError()}</div>}
      <ul>
        {(liveUsers()?.rows ?? []).map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </>
  );
}
