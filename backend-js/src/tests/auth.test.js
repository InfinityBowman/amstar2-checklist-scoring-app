import { test, expect } from 'bun:test';

const BASE_URL = 'http://localhost:3004/api/v1/auth';

test('signup creates a new user', async () => {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'testuser@example.com',
      name: 'Test User',
      password: 'TestPassword123!',
    }),
  });
  expect(res.status).toBe(200); // or 201 if you set it
  const data = await res.json();
  expect(data).toHaveProperty('message');
  expect(data).toHaveProperty('code'); // Remove in prod
});

test('signin fails for unverified email', async () => {
  const res = await fetch(`${BASE_URL}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'testuser@example.com',
      password: 'TestPassword123!',
    }),
  });
  expect(res.status).toBe(401);
  const data = await res.json();
  expect(data.error).toMatch(/not verified/i);
});

test('send verification code', async () => {
  const res = await fetch(`${BASE_URL}/send-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testuser@example.com' }),
  });
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.message).toMatch(/verification code sent/i);
});

// Add more tests for verify-email, refresh, signout, password reset, etc.
