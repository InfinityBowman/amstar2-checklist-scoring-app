// Note: mostly written by Copilot for testing frontend api

import { serve } from 'bun';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = 'access-secret';
const REFRESH_SECRET = 'refresh-secret';

// Configure logging
const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};
const CURRENT_LOG_LEVEL = LOG_LEVEL.DEBUG; // Set to DEBUG for verbose logging

function logger(level: keyof typeof LOG_LEVEL, message: string, data?: any) {
  if (LOG_LEVEL[level] >= CURRENT_LOG_LEVEL) {
    const timestamp = new Date().toISOString();
    const logData = data ? ` ${JSON.stringify(data)}` : '';
    console.log(`[${timestamp}] [${level}] ${message}${logData}`);
  }
}

function withCors(res: Response) {
  res.headers.set('Access-Control-Allow-Origin', 'http://localhost:5173'); // vite serves here
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  return res;
}

// Fake in-memory users DB
const users: Record<string, { password: string; name: string }> = {};

function generateAccessToken(userId: string) {
  logger('DEBUG', `Generating access token for user: ${userId}`);
  const token = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: '15m' });
  logger('DEBUG', `Access token generated with expiry: 15m`);
  return token;
}

function generateRefreshToken(userId: string) {
  logger('DEBUG', `Generating refresh token for user: ${userId}`);
  const token = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
  logger('DEBUG', `Refresh token generated with expiry: 7d`);
  return token;
}

function parseCookies(cookieHeader?: string | null) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, v] = c.trim().split('=');
      return [k, v];
    }),
  );
}

logger('INFO', 'Starting auth server on port 8000');

serve({
  port: 8000,
  async fetch(req) {
    const url = new URL(req.url);
    logger('INFO', `${req.method} ${url.pathname}`, {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent'),
    });

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }));
    }

    // --- SIGN UP ---
    if (req.method === 'POST' && url.pathname === '/auth/signup') {
      logger('DEBUG', 'Processing signup request');
      const body = await req.json();
      const { email, password, name } = body;
      logger('DEBUG', `Signup attempt for email: ${email}`);

      if (!email || !password) {
        logger('WARN', 'Signup failed: Missing email or password');
        return withCors(new Response('Email and password required', { status: 400 }));
      }
      if (users[email]) {
        logger('WARN', `Signup failed: User already exists: ${email}`);
        return withCors(new Response('User already exists', { status: 409 }));
      }

      users[email] = { password, name: name || email };
      logger('INFO', `User created successfully: ${email}`);
      return withCors(new Response('User created', { status: 201 }));
    }

    // --- Sign In ---
    if (req.method === 'POST' && url.pathname === '/auth/signin') {
      logger('DEBUG', 'Processing signin request');
      const body = await req.json();
      const { email, password } = body;
      logger('DEBUG', `Sign in attempt for email: ${email}`);

      const user = users[email];
      if (!user || user.password !== password) {
        logger('WARN', `Sign in failed: Invalid credentials for email: ${email}`);
        return withCors(new Response('Invalid credentials', { status: 401 }));
      }

      logger('INFO', `User successfully authenticated: ${email}`);
      const accessToken = generateAccessToken(email);
      const refreshToken = generateRefreshToken(email);

      logger('DEBUG', 'Sign in successful, sending tokens');
      return withCors(
        new Response(JSON.stringify({ accessToken }), {
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `refresh=${refreshToken}; HttpOnly; Path=/; Secure; SameSite=Strict; Max-Age=604800`,
          },
        }),
      );
    }

    // --- REFRESH ---
    if (req.method === 'POST' && url.pathname === '/auth/refresh') {
      logger('DEBUG', 'Processing token refresh request');
      const cookies = parseCookies(req.headers.get('cookie'));
      const refreshToken = cookies['refresh'];

      if (!refreshToken) {
        logger('WARN', 'Token refresh failed: Missing refresh token cookie');
        return withCors(new Response('Missing cookie', { status: 401 }));
      }

      try {
        logger('DEBUG', 'Verifying refresh token');
        const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { userId: string };
        logger('INFO', `Token refresh successful for user: ${payload.userId}`);
        const newAccessToken = generateAccessToken(payload.userId);
        return withCors(new Response(JSON.stringify({ accessToken: newAccessToken }), { headers: { 'Content-Type': 'application/json' } }));
      } catch (error: any) {
        logger('WARN', 'Token refresh failed: Invalid or expired refresh token', { error: error?.message || 'Unknown error' });
        return withCors(new Response('Invalid refresh token', { status: 403 }));
      }
    }

    // --- Sign Out (clear cookie) ---
    if (req.method === 'POST' && url.pathname === '/auth/signout') {
      logger('INFO', 'User sign out request');
      const cookies = parseCookies(req.headers.get('cookie'));
      const refreshToken = cookies['refresh'];

      if (refreshToken) {
        try {
          // Try to decode the token to log who is logging out
          const payload = jwt.decode(refreshToken) as { userId: string } | null;
          if (payload) {
            logger('INFO', `User signed out: ${payload.userId}`);
          }
        } catch {
          // Ignore errors, just means we can't log the user ID
        }
      }

      logger('DEBUG', 'Clearing refresh token cookie');
      return withCors(
        new Response('Signed out', {
          headers: {
            'Set-Cookie': `refresh=; HttpOnly; Path=/; Secure; SameSite=Strict; Max-Age=0`,
          },
        }),
      );
    }

    // --- PROTECTED ROUTE ---
    if (req.method === 'GET' && url.pathname === '/users/me') {
      logger('DEBUG', 'Accessing protected route: /users/me');
      const auth = req.headers.get('authorization');
      if (!auth?.startsWith('Bearer ')) {
        logger('WARN', 'Protected route access failed: Missing or invalid authorization header');
        return withCors(new Response('Unauthorized', { status: 401 }));
      }

      try {
        const token = auth.slice(7);
        logger('DEBUG', 'Verifying access token');
        const payload = jwt.verify(token, ACCESS_SECRET) as { userId: string };
        logger('DEBUG', `Access token valid for user: ${payload.userId}`);
        const user = users[payload.userId];
        if (!user) {
          logger('ERROR', `User not found in database: ${payload.userId}`);
          return withCors(new Response('User not found', { status: 404 }));
        }
        logger('INFO', `User ${payload.userId} successfully accessed protected resource`);
        return withCors(
          new Response(JSON.stringify({ id: payload.userId, name: user.name }), { headers: { 'Content-Type': 'application/json' } }),
        );
      } catch (error: any) {
        logger('WARN', 'Protected route access failed: Token verification failed', { error: error?.message || 'Unknown error' });
        return withCors(new Response('Token expired or invalid', { status: 403 }));
      }
    }

    logger('INFO', `Route not found: ${req.method} ${url.pathname}`);
    return withCors(new Response('Not Found', { status: 404 }));
  },
});
