import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from '@electric-sql/client';
import { getCurrentUser } from './auth.js';
import { db } from '@db/drizzle.js';
import { users, projects, projectMembers } from '@db/schema.js';
import { eq, inArray } from 'drizzle-orm';

// Helper: get user IDs for all projects the user is a member of
async function getUserIdsForUserProjects(userId) {
  const memberships = await db
    .select({ projectId: projectMembers.projectId })
    .from(projectMembers)
    .where(eq(projectMembers.userId, userId));
  const projectIds = memberships.map((m) => m.projectId);

  if (projectIds.length === 0) return [];

  const allMembers = await db
    .select({ userId: projectMembers.userId })
    .from(projectMembers)
    .where(inArray(projectMembers.projectId, projectIds));
  return [...new Set(allMembers.map((m) => m.userId))];
}

// Helper: get project IDs for the user
async function getProjectIdsForUser(userId) {
  const memberships = await db
    .select({ projectId: projectMembers.projectId })
    .from(projectMembers)
    .where(eq(projectMembers.userId, userId));
  return memberships.map((m) => m.projectId);
}

const SHAPES = {
  users: async (user) => {
    if (!user || !user.sub) return { where: 'id = NULL', columns: 'id,name' };
    const userIds = await getUserIdsForUserProjects(user.sub);
    if (userIds.length === 0) return { where: 'id = NULL', columns: 'id,name' };
    const idList = userIds.map((id) => `'${id}'`).join(',');
    return { where: `id IN (${idList})`, columns: 'id,name' };
  },
  projects: async (user) => {
    if (!user || !user.sub) return { where: 'id = NULL', columns: 'id,name,owner_id' };
    const projectIds = await getProjectIdsForUser(user.sub);
    if (projectIds.length === 0) return { where: 'id = NULL', columns: 'id,name,owner_id' };
    const idList = projectIds.map((id) => `'${id}'`).join(',');
    return { where: `id IN (${idList})`, columns: 'id,name,owner_id' };
  },
  // Add more shapes as needed
};

export const electricProxy = (app) =>
  app.get('/shapes/:table', async ({ params, request, jwt }) => {
    try {
      const { table } = params;
      const user = await getCurrentUser(request, jwt);
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Build upstream Electric shape URL
      const originUrl = new URL('http://electric:3000/v1/shape');
      const url = new URL(request.url);
      // Only pass through Electric protocol parameters
      url.searchParams.forEach((value, key) => {
        if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
          originUrl.searchParams.set(key, value);
        }
      });
      originUrl.searchParams.set('table', table);

      // Eventually scope data
      // if (!user.roles || !user.roles.includes('admin')) {
      // if (user.org_id) {
      //   originUrl.searchParams.set('where', `org_id = '${user.org_id}'`);
      // }
      // }

      // Apply filters
      if (SHAPES[table] && user.sub) {
        const { where, columns } = await SHAPES[table](user);
        if (where) originUrl.searchParams.set('where', where);
        if (columns) originUrl.searchParams.set('columns', columns);
      }

      // Proxy request to Electric
      let response;
      try {
        // console.log('Proxying request to Electric:', originUrl.toString());
        response = await fetch(originUrl);
      } catch (err) {
        console.error('Error fetching from Electric:', err);
        return new Response(JSON.stringify({ error: 'Upstream fetch failed', details: err.message }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Forward all headers except CORS
      const headers = new Headers(response.headers);
      headers.delete('access-control-allow-origin');
      // headers.delete('access-control-allow-methods');
      // headers.delete('access-control-allow-headers');
      // headers.delete('access-control-allow-credentials');
      // headers.delete('access-control-expose-headers');
      // headers.delete('access-control-max-age');

      // const headers = new Headers(response.headers);
      headers.delete(`content-encoding`);
      headers.delete(`content-length`);
      headers.set(`Vary`, `Authorization`);

      // console.log(`Proxied shape request for table "${table}" by user "${user.sub}"`);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (err) {
      console.error('Proxy error:', err);
      return new Response(JSON.stringify({ error: 'Proxy error', details: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  });
