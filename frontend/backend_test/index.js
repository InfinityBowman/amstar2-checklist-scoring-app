import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());

const ACCESS_SECRET = 'access-secret';
const REFRESH_SECRET = 'refresh-secret';

// Logging
const LOG_LEVEL = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const CURRENT_LOG_LEVEL = LOG_LEVEL.DEBUG;
function logger(level, message, data) {
  if (LOG_LEVEL[level] >= CURRENT_LOG_LEVEL) {
    const timestamp = new Date().toISOString();
    const logData = data ? ` ${JSON.stringify(data)}` : '';
    console.log(`[${timestamp}] [${level}] ${message}${logData}`);
  }
}

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Fake in-memory users DB
const users = {};

// Token generators
function generateAccessToken(userId) {
  logger('DEBUG', `Generating access token for user: ${userId}`);
  return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: '15m' });
}
function generateRefreshToken(userId) {
  logger('DEBUG', `Generating refresh token for user: ${userId}`);
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
}

// --- SIGN UP ---
app.post('/auth/signup', (req, res) => {
  logger('DEBUG', 'Processing signup request');
  const { email, password, name } = req.body;
  logger('DEBUG', `Signup attempt for email: ${email}`);

  if (!email || !password) {
    logger('WARN', 'Signup failed: Missing email or password');
    return res.status(400).send('Email and password required');
  }
  if (users[email]) {
    logger('WARN', `Signup failed: User already exists: ${email}`);
    return res.status(409).send('User already exists');
  }

  users[email] = { password, name: name || email };
  logger('INFO', `User created successfully: ${email}`);
  res.status(201).send('User created');
});

// --- SIGN IN ---
app.post('/auth/signin', (req, res) => {
  logger('DEBUG', 'Processing signin request');
  const { email, password } = req.body;
  logger('DEBUG', `Sign in attempt for email: ${email}`);

  const user = users[email];
  if (!user || user.password !== password) {
    logger('WARN', `Sign in failed: Invalid credentials for email: ${email}`);
    return res.status(401).send('Invalid credentials');
  }

  logger('INFO', `User successfully authenticated: ${email}`);
  const accessToken = generateAccessToken(email);
  const refreshToken = generateRefreshToken(email);

  logger('DEBUG', 'Sign in successful, sending tokens');
  res
    .cookie('refresh', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 604800000, // 7 days
    })
    .json({ accessToken });
});

// --- REFRESH ---
app.post('/auth/refresh', (req, res) => {
  logger('DEBUG', 'Processing token refresh request');
  const refreshToken = req.cookies.refresh;

  if (!refreshToken) {
    logger('WARN', 'Token refresh failed: Missing refresh token cookie');
    return res.status(401).send('Missing cookie');
  }

  try {
    logger('DEBUG', 'Verifying refresh token');
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    logger('INFO', `Token refresh successful for user: ${payload.userId}`);
    const newAccessToken = generateAccessToken(payload.userId);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    logger('WARN', 'Token refresh failed: Invalid or expired refresh token', { error: error?.message || 'Unknown error' });
    res.status(403).send('Invalid refresh token');
  }
});

// --- SIGN OUT ---
app.post('/auth/signout', (req, res) => {
  logger('INFO', 'User sign out request');
  const refreshToken = req.cookies.refresh;

  if (refreshToken) {
    try {
      const payload = jwt.decode(refreshToken);
      if (payload) logger('INFO', `User signed out: ${payload.userId}`);
    } catch {}
  }

  logger('DEBUG', 'Clearing refresh token cookie');
  res
    .cookie('refresh', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    })
    .send('Signed out');
});

// --- PROTECTED ROUTE ---
app.get('/users/me', (req, res) => {
  logger('DEBUG', 'Accessing protected route: /users/me');
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    logger('WARN', 'Protected route access failed: Missing or invalid authorization header');
    return res.status(401).send('Unauthorized');
  }

  try {
    const token = auth.slice(7);
    logger('DEBUG', 'Verifying access token');
    const payload = jwt.verify(token, ACCESS_SECRET);
    logger('DEBUG', `Access token valid for user: ${payload.userId}`);
    const user = users[payload.userId];
    if (!user) {
      logger('ERROR', `User not found in database: ${payload.userId}`);
      return res.status(404).send('User not found');
    }
    logger('INFO', `User ${payload.userId} successfully accessed protected resource`);
    res.json({ id: payload.userId, name: user.name });
  } catch (error) {
    logger('WARN', 'Protected route access failed: Token verification failed', { error: error?.message || 'Unknown error' });
    res.status(403).send('Token expired or invalid');
  }
});

// --- 404 ---
app.use((req, res) => {
  logger('INFO', `Route not found: ${req.method} ${req.path}`);
  res.status(404).send('Not Found');
});

const PORT = 8000;
app.listen(PORT, () => {
  logger('INFO', `Starting auth server on port ${PORT}`);
});
