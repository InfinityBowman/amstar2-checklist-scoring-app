import { randomUUID } from 'crypto';
import { Elysia } from 'elysia';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

// --- Projects Plugin ---
export const projectsPlugin = new Elysia({ prefix: '/projects' })
  // Create a new project
  .post('/', async ({ body, jwt, request, set }) => {
    try {
      // Auth: get user from JWT
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        return { error: 'Unauthorized' };
      }
      const token = authHeader.slice(7);
      let payload;
      try {
        payload = await jwt.verify(token);
      } catch (err) {
        set.status = 401;
        return { error: 'Invalid token' };
      }
      if (!payload || typeof payload.sub === 'undefined' || payload.sub === null) {
        set.status = 401;
        return { error: 'Invalid token: missing user id' };
      }

      // Validate body
      const { name } = body;
      if (!name || typeof name !== 'string') {
        set.status = 400;
        return { error: 'Missing or invalid project name' };
      }

      // Generate unique UUID for project
      let projectId;
      let attempts = 0;
      do {
        projectId = randomUUID();
        const existing = await sql`SELECT id FROM projects WHERE id = ${projectId}`;
        if (!existing.length) break;
        attempts++;
      } while (attempts < 10);
      if (attempts === 10) {
        set.status = 500;
        return { error: 'Unable to generate unique project ID' };
      }

      const now = new Date().toISOString();
      const ownerId = payload.sub;
      // Insert project
      await sql`
        INSERT INTO projects (id, name, owner_id, created_at, updated_at)
        VALUES (${projectId}, ${name}, ${ownerId}, ${now}, ${now})
      `;

      // Return optimistic response
      return {
        id: projectId,
        name,
        owner_id: ownerId,
        created_at: now,
        updated_at: now,
      };
    } catch (err) {
      console.error('Create project error:', err);
      set.status = 500;
      return { error: 'Internal server error', details: err.message };
    }
  });
