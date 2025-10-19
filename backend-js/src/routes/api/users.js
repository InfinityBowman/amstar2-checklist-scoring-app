import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { db } from '@db/drizzle.js';
import { users } from '@db/schema.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export const usersPlugin = new Elysia({ prefix: '/users' })
  .use(
    jwt({
      name: 'jwt',
      secret: JWT_SECRET,
      exp: '1h',
    }),
  )

  // Get all users
  .get('/', async ({ set }) => {
    try {
      const allUsers = await db.select({ id: users.id, name: users.name, email: users.email }).from(users);
      return { users: allUsers };
    } catch (err) {
      console.error('Get all users error:', err);
      set.status = 500;
      return { error: 'Failed to fetch users', details: err.message };
    }
  })
  // Get current user (protected)
  .get('/me', async ({ request, jwt, set }) => {
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
        console.error('JWT verify error:', err);
        return { error: 'Invalid token' };
      }
      // Ensure payload.sub is defined before querying DB
      if (!payload || typeof payload.sub === 'undefined' || payload.sub === null) {
        set.status = 401;
        return { error: 'Invalid token: missing user id' };
      }
      // Fetch user from DB
      const userArr = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, payload.sub));
      const user = userArr[0];
      if (!user) {
        return { error: 'User not found' };
      }
      // Strictly sanitize undefined values to null
      return {
        id: typeof user.id !== 'undefined' ? user.id : null,
        name: typeof user.name !== 'undefined' ? user.name : null,
        email: typeof user.email !== 'undefined' ? user.email : null,
      };
    } catch (err) {
      console.error('Get current user error:', err);
      set.status = 500;
      return { error: 'Internal server error', details: err.message };
    }
  });
