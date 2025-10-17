import { test, expect } from 'bun:test';

const BASE_URL = 'http://localhost:3004/api/v1/auth';
const testEmail = 'comprehensive@example.com';
const testName = 'Comprehensive User';
const testPassword = 'ComprehensivePass123!';

let verificationCode = '';
let accessToken = '';
let refreshToken = '';

// 1. Signup

test('signup creates a new user (comprehensive)', async () => {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      name: testName,
      password: testPassword,
    }),
  });
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data).toHaveProperty('message');
  expect(data).toHaveProperty('code');
  verificationCode = data.code;
});

// 2. Signin fails for unverified email

test('signin fails for unverified email (comprehensive)', async () => {
  const res = await fetch(`${BASE_URL}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  expect(res.status).toBe(401);
  const data = await res.json();
  expect(data.error).toMatch(/not verified/i);
});

// 3. Send verification code

test('send verification code (comprehensive)', async () => {
  const res = await fetch(`${BASE_URL}/send-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  });
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.message).toMatch(/verification code sent/i);
  // Extract code from message (dev only)
  const match = data.message.match(/CODE: (\\d+)/);
  if (match) verificationCode = match[1];
});

// 4. Verify email

test('verify email (comprehensive)', async () => {
  // Use the code from signup (or send-verification)
  const res = await fetch(`${BASE_URL}/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, code: verificationCode }),
  });
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.message).toMatch(/verified/i);
});

// 5. Signin with verified email

test('signin with verified email (comprehensive)', async () => {
  const res = await fetch(`${BASE_URL}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data).toHaveProperty('accessToken');
  accessToken = data.accessToken;
  // Extract refresh token from set-cookie header if needed
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    const match = setCookie.match(/refresh=([^;]+)/);
    if (match) refreshToken = match[1];
  }
});

// 6. Refresh token

test('refresh token (comprehensive)', async () => {
  if (!refreshToken) {
    console.warn('No refresh token found, skipping refresh test');
    return;
  }
  const res = await fetch(`${BASE_URL}/refresh`, {
    method: 'POST',
    headers: { Cookie: `refresh=${refreshToken}` },
  });
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data).toHaveProperty('accessToken');
});

// 7. Signout

test('signout (comprehensive)', async () => {
  const res = await fetch(`${BASE_URL}/signout`, {
    method: 'POST',
    headers: { Cookie: `refresh=${refreshToken}` },
  });
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.message).toMatch(/success/i);
});

// 8. Request password reset
let resetCode = '';
test('request password reset (comprehensive)', async () => {
  const res = await fetch(`${BASE_URL}/request-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  });
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.message).toMatch(/reset code sent/i);
  // Extract code from message (dev only)
  const match = data.message.match(/CODE: (\d+)/);
  if (match) resetCode = match[1];
});

// 9. Reset password
const newPassword = 'NewComprehensivePass123!';
test('reset password (comprehensive)', async () => {
  const res = await fetch(`${BASE_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, code: resetCode, new_password: newPassword }),
  });
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.message).toMatch(/reset successful/i);
});

// 10. Signin with new password

test('signin with new password (comprehensive)', async () => {
  const res = await fetch(`${BASE_URL}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: newPassword,
    }),
  });
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data).toHaveProperty('accessToken');
});
