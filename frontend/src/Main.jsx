import { render } from 'solid-js/web';
import AppRoutes from './routes/Routes.jsx';
import { StateProvider } from './AppState.jsx';
import { AuthProvider } from './auth/AuthProvider.jsx';
import { createSignal, onMount } from 'solid-js';
import { PGliteProvider } from '@electric-sql/pglite-solid';
import { PGlite } from '@electric-sql/pglite';
import { live } from '@electric-sql/pglite/live';
import { electricSync } from '@electric-sql/pglite-sync';

function Root() {
  const [db, setDb] = createSignal(null);

  onMount(async () => {
    let dbGlobal = await PGlite.create({
      dataDir: 'idb://my-database',
      extensions: { live, electric: electricSync() },
    });
    await dbGlobal.exec(`
      CREATE TABLE IF NOT EXISTS todo (
        id SERIAL PRIMARY KEY,
        task TEXT,
        done BOOLEAN DEFAULT false
      );
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        hashed_password TEXT,
        email_verification_code TEXT,
        email_verification_requested_at TIMESTAMPTZ,
        email_verified_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ
      );
      INSERT INTO todo (task, done) VALUES ('Install PGlite from NPM', true);
      INSERT INTO todo (task, done) VALUES ('Load PGlite', true);
      INSERT INTO todo (task, done) VALUES ('Create a table', true);
      INSERT INTO todo (task, done) VALUES ('Insert some data', true);
      INSERT INTO todo (task) VALUES ('Update a task');
    `);
    setDb(dbGlobal);
  });

  return (
    <StateProvider>
      <AuthProvider>
        {db() && (
          <PGliteProvider db={db()}>
            <AppRoutes />
          </PGliteProvider>
        )}
      </AuthProvider>
    </StateProvider>
  );
}

render(() => <Root />, document.getElementById('root'));
