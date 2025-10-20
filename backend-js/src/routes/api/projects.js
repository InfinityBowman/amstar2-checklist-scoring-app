import { randomUUID } from 'crypto';
import { Elysia } from 'elysia';
import { db } from '@db/drizzle.js';
import { projects, projectMembers } from '@db/schema.js';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from './auth.js';

// --- Projects Plugin ---
export const projectsPlugin = new Elysia({ prefix: '/projects' })
  // Create a new project
  .post('/', async ({ body, jwt, request, set }) => {
    try {
      const startTotal = Date.now();
      const timings = {};

      const startAuth = Date.now();
      // const user = await getCurrentUser(request, jwt);
      // if (!user) {
      //   return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      //     status: 401,
      //     headers: { 'Content-Type': 'application/json' },
      //   });
      // }
      timings.auth = Date.now() - startAuth;

      // Validate body
      const startValidate = Date.now();
      const { name } = body;
      if (!name || typeof name !== 'string') {
        set.status = 400;
        return { error: 'Missing or invalid project name' };
      }
      timings.validate = Date.now() - startValidate;

      // Generate unique UUID for project
      const startUuid = Date.now();
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
      timings.uuid = Date.now() - startUuid;

      const now = new Date().toISOString();
      // const ownerId = user.sub;
      const ownerId = '11111111-1111-1111-1111-111111111111';

      // Insert project
      const startInsertProject = Date.now();
      await db.insert(projects).values({
        id: projectId,
        name,
        ownerId,
        updatedAt: new Date(now),
      });
      timings.insertProject = Date.now() - startInsertProject;

      // Add creator as a member (role: 'owner')
      const startInsertMember = Date.now();
      await db.insert(projectMembers).values({
        projectId,
        userId: ownerId,
        role: 'owner',
      });
      timings.insertMember = Date.now() - startInsertMember;

      timings.total = Date.now() - startTotal;
      console.log('[Add Project Timing]', timings);

      // Return response
      return {
        id: projectId,
        name,
        owner_id: ownerId,
        created_at: now,
        updated_at: now,
        timings,
      };
    } catch (err) {
      console.error('Create project error:', err);
      set.status = 500;
      return { error: 'Internal server error', details: err.message };
    }
  })
  // Delete a project
  .delete('/:projectId', async ({ params, jwt, request, set }) => {
    try {
      const user = await getCurrentUser(request, jwt);
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const { projectId } = params;
      // Check if project exists
      const project = await db.select().from(projects).where(eq(projects.id, projectId));
      if (project.length === 0) {
        set.status = 404;
        return { error: 'Project not found' };
      }
      // Only owner can delete
      if (project[0].ownerId !== user.sub) {
        set.status = 403;
        return { error: 'Only the project owner can delete the project' };
      }

      // Delete all project members
      await db.delete(projectMembers).where(eq(projectMembers.projectId, projectId));
      // Delete the project
      await db.delete(projects).where(eq(projects.id, projectId));

      set.status = 200;
      return { message: 'Project deleted', projectId };
    } catch (err) {
      console.error('Delete project error:', err);
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
