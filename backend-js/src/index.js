import { Elysia } from 'elysia';
import { openapi } from '@elysiajs/openapi';
import { cors } from '@elysiajs/cors';
import { electricProxy } from './routes/api/electricProxy.js';

// Load environment variables if .env file exists
try {
  await import('dotenv').then((dotenv) => dotenv.config());
} catch (err) {
  console.log('No .env file found or dotenv not installed, using defaults');
}

// Import API routes
import { authPlugin } from './routes/api/auth.js';
import { usersPlugin } from './routes/api/users.js';
import { projectsPlugin } from './routes/api/projects.js';

// Create an API router
const apiRouter = new Elysia({ prefix: '/api/v1' })
  .use(authPlugin)
  .use(usersPlugin)
  .use(projectsPlugin)
  .use(electricProxy);
// Create the main app
const app = new Elysia()
  // CORS must be first to apply to all routes
  .use(
    cors({
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposeHeaders: ['electric-offset', 'electric-handle', 'electric-schema', 'electric-cursor'],
      credentials: true,
      maxAge: 600,
      preflight: true,
    }),
  )
  .use(apiRouter)
  .get('/', () => 'AMSTAR2 API - Bun/Elysia Backend')
  .get('/healthz', () => ({ status: 'ok' }))
  .get('/healthz/db', async () => {
    try {
      // Using our db connection would go here
      return { db: 'ok' };
    } catch (error) {
      return { db: 'error', message: error.message };
    }
  })
  .use(
    openapi({
      documentation: {
        info: {
          title: 'AMSTAR2 Checklist Scoring API',
          version: '1.0.0',
          description: 'API for AMSTAR2 checklist scoring and systematic reviews',
        },
      },
      path: '/docs',
    }),
  )
  .listen(process.env.PORT || 3004);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`🦊 Docs running at http://${app.server?.hostname}:${app.server?.port}/docs`);
