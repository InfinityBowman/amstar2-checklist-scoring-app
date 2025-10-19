import { randomUUID } from 'crypto';
import { Elysia } from 'elysia';
import { db } from '@db/drizzle.js';
import { projects, projectMembers } from '@db/schema.js';
import { eq, and } from 'drizzle-orm';

// --- Projects Plugin ---
export const projectsPlugin = new Elysia({ prefix: '/projects' })
  // Create a new project
  .post('/', async ({ body, jwt, request, set }) => {
    try {
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
        const existing = await db.select().from(projects).where(eq(projects.id, projectId));
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
      await db.insert(projects).values({
        id: projectId,
        name,
        ownerId,
        updatedAt: new Date(now),
      });

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
  })
  // Add a user to a project
  .post('/:projectId/add-user', async ({ params, body, set }) => {
    try {
      const { projectId } = params;
      const { userId } = body;

      if (!userId || typeof userId !== 'string') {
        set.status = 400;
        return { error: 'Missing or invalid userId' };
      }

      // Check if project exists
      const project = await db.select().from(projects).where(eq(projects.id, projectId));
      if (project.length === 0) {
        set.status = 404;
        return { error: 'Project not found' };
      }

      // Check if user is already a member
      const existing = await db
        .select()
        .from(projectMembers)
        .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));
      if (existing.length > 0) {
        set.status = 409;
        return { error: 'User is already a member of this project' };
      }

      // Add user to project
      await db.insert(projectMembers).values({ projectId, userId });

      set.status = 201;
      return { message: 'User added to project', userId };
    } catch (err) {
      console.error('Add user to project error:', err);
      set.status = 500;
      return { error: 'Internal server error', details: err.message };
    }
  })
  // Remove a user from a project
  .delete('/:projectId/remove-user', async ({ params, body, set }) => {
    try {
      const { projectId } = params;
      const { userId } = body;

      if (!userId || typeof userId !== 'string') {
        set.status = 400;
        return { error: 'Missing or invalid userId' };
      }

      // Fetch the project to check owner
      const project = await db.select().from(projects).where(eq(projects.id, projectId));
      if (project.length === 0) {
        set.status = 404;
        return { error: 'Project not found' };
      }
      if (project[0].ownerId === userId) {
        set.status = 403;
        return { error: 'Owner cannot remove themselves from the project' };
      }

      // Remove the user from project members
      await db
        .delete(projectMembers)
        .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));

      set.status = 200;
      return { message: 'User removed from project', userId };
    } catch (err) {
      console.error('Remove user from project error:', err);
      set.status = 500;
      return { error: 'Internal server error', details: err.message };
    }
  });
