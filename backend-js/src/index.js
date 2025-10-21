import { Elysia } from 'elysia';
import { openapi } from '@elysiajs/openapi';
import { cors } from '@elysiajs/cors';
import { electricProxy } from './routes/api/electricProxy.js';
import fs from 'fs';

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

const logCorsPlugin = new Elysia().onRequest(({ request }) => {
  if (request.method === 'OPTIONS') {
    console.log('[CORS] OPTIONS request:', request.url, request.headers);
  }
});
// Create the main app
const app = new Elysia()
  // CORS must be first to apply to all routes
  .use(logCorsPlugin)
  .use(
    cors({
      origin: ['https://localhost', 'https://localhost:3005', 'https://corates.jacobmaynard.dev'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
  // .listen({
  //   port: process.env.PORT || 3004,
  //   hostname: '0.0.0.0',
  //   tls: {
  //     key: fs.readFileSync('../certs/key.pem'),
  //     cert: fs.readFileSync('../certs/cert.pem'),
  //   },
  // });

console.log(`🦊 Elysia is running at https://${app.server?.hostname}:${app.server?.port}`);
console.log(`🦊 Docs running at https://${app.server?.hostname}:${app.server?.port}/docs`);
