import { Elysia } from 'elysia';
import { jwt as elysiaJwt } from '@elysiajs/jwt';
import postgres from 'postgres';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs'; // or use Bun's built-in hashing for dev

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const sql = postgres(process.env.DATABASE_URL);

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
      const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
      if (existing.length > 0) {
        set.status = 409;
        return { error: 'User with this email already exists' };
      }
      // Hash password
      const hashed_password = await bcrypt.hash(password, 10);
      const id = randomUUID();
      await sql`
        INSERT INTO users (id, name, email, hashed_password)
        VALUES (${id}, ${name}, ${email.toLowerCase()}, ${hashed_password})
      `;
      // Generate and store email verification code
      const code = generateCode();
      await sql`
        UPDATE users SET email_verification_code=${code}, email_verification_requested_at=NOW()
        WHERE id=${id}
      `;
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
      const users = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`;
      const user = users[0];
      if (!user || !(await bcrypt.compare(password, user.hashed_password))) {
        set.status = 401;
        return { error: 'Invalid email or password' };
      }
      if (!user.email_verified_at) {
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
  .post('/refresh', async ({ request, set, jwt, cookie }) => {
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
  .post('/signout', async ({ cookie }) => {
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
      await sql`
        UPDATE users SET email_verification_code=${code}, email_verification_requested_at=NOW()
        WHERE email=${email.toLowerCase()}
      `;
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
      const users = await sql`SELECT * FROM users WHERE email=${email.toLowerCase()}`;
      const user = users[0];
      if (!user || user.email_verification_code !== code) {
        set.status = 401;
        return { error: 'Invalid verification code' };
      }
      await sql`
        UPDATE users SET email_verified_at=NOW(), email_verification_code=NULL, email_verification_requested_at=NULL
        WHERE id=${user.id}
      `;
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
      await sql`
        UPDATE users SET password_reset_code=${code}, password_reset_requested_at=NOW()
        WHERE email=${email.toLowerCase()}
      `;
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
      const users = await sql`SELECT * FROM users WHERE email=${email.toLowerCase()}`;
      const user = users[0];
      if (!user || user.password_reset_code !== code) {
        set.status = 401;
        return { error: 'Invalid or expired reset code' };
      }
      // Check code expiry (15 min)
      const requestedAt = new Date(user.password_reset_requested_at);
      if (Date.now() - requestedAt.getTime() > 15 * 60 * 1000) {
        set.status = 401;
        return { error: 'Reset code has expired' };
      }
      const hashed_password = await bcrypt.hash(new_password, 10);
      await sql`
        UPDATE users SET hashed_password=${hashed_password}, password_reset_code=NULL, password_reset_requested_at=NULL
        WHERE id=${user.id}
      `;
      return { message: 'Password reset successful' };
    } catch (err) {
      console.error('Reset password error:', err);
      set.status = 500;
      return { error: 'Internal server error', details: err.message };
    }
  });
