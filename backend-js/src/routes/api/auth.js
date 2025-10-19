import { Elysia } from 'elysia';
import { jwt as elysiaJwt } from '@elysiajs/jwt';

import { db } from '@db/drizzle.js';
import { users } from '@db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@utils/sendEmail.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

// Helper to get current user from Authorization header (for ElectricSQL proxy or protected routes)
export async function getCurrentUser(request, jwtInstance) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    return await jwtInstance.verify(token);
  } catch {
    return null;
  }
}

export const authPlugin = new Elysia({ prefix: '/auth' })
  .use(elysiaJwt({ name: 'jwt', secret: JWT_SECRET, exp: '15m' }))
  // Signup
  .post('/signup', async ({ body, set }) => {
    try {
      const { email, name, password } = body;
      // TODO: Validate, check strong password, etc.
      // Check if user already exists
      const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase()));
      if (existing.length > 0) {
        set.status = 409;
        return { error: 'User with this email already exists' };
      }
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      const id = randomUUID();
      await db.insert(users).values({
        id,
        name,
        email: email.toLowerCase(),
        passwordHash,
      });
      // Generate and store email verification code
      const code = generateCode();
      await db
        .update(users)
        .set({
          emailVerificationCode: code,
          emailVerificationRequestedAt: new Date(),
        })
        .where(eq(users.id, id));
      // (Send code via email here)
      return { message: 'User created. Verification code sent.', code }; // Remove code in prod
    } catch (err) {
      console.error('Signup error:', err);
      set.status = 500;
      return { error: 'Internal server error', details: err.message };
    }
  })

  // Signin
  .post('/signin', async ({ body, set, jwt, cookie }) => {
    try {
      const { email, password } = body;
      const userArr = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      const user = userArr[0];
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        set.status = 401;
        return { error: 'Invalid email or password' };
      }
      if (!user.emailVerifiedAt) {
        set.status = 401;
        return { error: 'Email not verified' };
      }
      const accessToken = await jwt.sign({ sub: user.id });
      // Generate refresh token (could be JWT or random string)
      const refreshToken = await jwt.sign({ sub: user.id }, { exp: '7d' });
      cookie.refresh.value = refreshToken;
      cookie.refresh.options = {
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
      };
      return { accessToken };
    } catch (err) {
      console.error('Signin error:', err);
      set.status = 500;
      return { error: 'Internal server error', details: err.message };
    }
  })

  // Refresh
  .post('/refresh', async ({ set, jwt, cookie }) => {
    try {
      const refresh = cookie.refresh.value;
      if (!refresh) {
        set.status = 401;
        return { error: 'Refresh token not found' };
      }
      let payload;
      try {
        payload = await jwt.verify(refresh);
      } catch (err) {
        cookie.refresh.value = '';
        cookie.refresh.options = {
          maxAge: 0,
          httpOnly: true,
          path: '/',
          sameSite: 'strict',
        };
        set.status = 401;
        return { error: 'Invalid refresh token' };
      }
      const accessToken = await jwt.sign({ sub: payload.sub });
      return { accessToken };
    } catch (err) {
      console.error('Refresh error:', err);
      set.status = 500;
      return { error: 'Internal server error', details: err.message };
    }
  })

  // Signout
  .post('/signout', async ({ cookie, set }) => {
    try {
      cookie.refresh.value = '';
      cookie.refresh.options = {
        maxAge: 0,
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
      };
      return { message: 'Successfully signed out' };
    } catch (err) {
      console.error('Signout error:', err);
      set.status = 500;
      return { error: 'Internal server error', details: err.message };
    }
  })

  // Send verification code
  .post('/send-verification', async ({ body, set }) => {
    try {
      const { email } = body;
      const code = generateCode();
      await db
        .update(users)
        .set({
          emailVerificationCode: code,
          emailVerificationRequestedAt: new Date(),
        })
        .where(eq(users.email, email.toLowerCase()));
      // (Send code via email here)
      return { message: `Verification code sent. CODE: ${code}` }; // Remove code in prod
    } catch (err) {
      console.error('Send verification error:', err);
      set.status = 500;
      return { error: 'Internal server error', details: err.message };
    }
  })

  // Verify email
  .post('/verify-email', async ({ body, set }) => {
    try {
      const { email, code } = body;
      const userArr = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      const user = userArr[0];
      if (!user || user.emailVerificationCode !== code) {
        set.status = 401;
        return { error: 'Invalid verification code' };
      }
      await db
        .update(users)
        .set({
          emailVerifiedAt: new Date(),
          emailVerificationCode: null,
          emailVerificationRequestedAt: null,
        })
        .where(eq(users.id, user.id));
      return { message: 'Email verified successfully' };
    } catch (err) {
      console.error('Verify email error:', err);
      set.status = 500;
      return { error: 'Internal server error', details: err.message };
    }
  })

  // Request password reset
  .post('/request-password-reset', async ({ body, set }) => {
    try {
      const { email } = body;
      const code = generateCode();
      await db
        .update(users)
        .set({
          passwordResetCode: code,
          passwordResetRequestedAt: new Date(),
        })
        .where(eq(users.email, email.toLowerCase()));
      // (Send code via email here)
      return { message: `Password reset code sent. CODE: ${code}` }; // Remove code in prod
    } catch (err) {
      console.error('Request password reset error:', err);
      set.status = 500;
      return { error: 'Internal server error', details: err.message };
    }
  })

  // Reset password
  .post('/reset-password', async ({ body, set }) => {
    try {
      const { email, code, new_password } = body;
      const userArr = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      const user = userArr[0];
      if (!user || user.passwordResetCode !== code) {
        set.status = 401;
        return { error: 'Invalid or expired reset code' };
      }
      // Check code expiry (15 min)
      const requestedAt = new Date(user.passwordResetRequestedAt);
      if (Date.now() - requestedAt.getTime() > 15 * 60 * 1000) {
        set.status = 401;
        return { error: 'Reset code has expired' };
      }
      const passwordHash = await bcrypt.hash(new_password, 10);
      await db
        .update(users)
        .set({
          passwordHash,
          passwordResetCode: null,
          passwordResetRequestedAt: null,
        })
        .where(eq(users.id, user.id));
      return { message: 'Password reset successful' };
    } catch (err) {
      console.error('Reset password error:', err);
      set.status = 500;
      return { error: 'Internal server error', details: err.message };
    }
  });
