import API_ENDPOINTS from './config.js';

export async function signup(email, password, name) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const locale = navigator.language;
  const res = await fetch(API_ENDPOINTS.SIGNUP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, timezone, locale }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Signup error:', errorText);
    throw new Error(errorText || 'Signup failed');
  }
}

let accessToken = null;

export async function signin(email, password) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const locale = navigator.language;
  const res = await fetch(API_ENDPOINTS.SIGNIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // important for refresh cookie
    body: JSON.stringify({ email, password, timezone, locale }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Sign in failed:', errorText);
    throw new Error(errorText || 'Sign in failed');
  }

  const data = await res.json();
  accessToken = data.accessToken;
}

export async function getCurrentUser() {
  const res = await authFetch(API_ENDPOINTS.CURRENT_USER);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to fetch user:', errorText);
    throw new Error(errorText || 'Failed to fetch user');
  }
  return await res.json();
}

export async function authFetch(url, options = {}) {
  // Attach Authorization header if accessToken exists
  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${accessToken}`,
  };
  options.credentials = 'include'; // ensure cookies are sent

  let res = await fetch(url, options);

  if (res.status === 401 || res.status === 403) {
    // Try to refresh the token
    try {
      await refreshAccessToken();
      // Retry the request with new token
      options.headers.Authorization = `Bearer ${accessToken}`;
      options.credentials = 'include'; // ensure cookies are sent
      res = await fetch(url, options);
    } catch (err) {
      // Refresh failed, sign out user
      await signout();
      throw new Error('Session expired. Please log in again.');
    }
  }

  return res;
}

export async function refreshAccessToken() {
  const res = await fetch(API_ENDPOINTS.REFRESH, {
    method: 'POST',
    credentials: 'include', // sends HttpOnly cookie
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Refresh failed:', errorText);
    throw new Error(errorText || 'Refresh failed');
  }

  const data = await res.json();
  accessToken = data.accessToken;
}

export async function signout() {
  await fetch(API_ENDPOINTS.SIGNOUT, {
    method: 'POST',
    credentials: 'include',
  });
  accessToken = null;
}

export async function sendEmailVerification(email) {
  const res = await fetch(API_ENDPOINTS.SEND_VERIFICATION, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  console.log('Send verification response:', await res.text());

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Send verification error:', errorText);
    throw new Error(errorText || 'Failed to send verification email');
  }
}

export async function verifyEmail(email, code) {
  const res = await fetch(API_ENDPOINTS.VERIFY_EMAIL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Verify email error:', errorText);
    throw new Error(errorText || 'Email verification failed');
  }
}

export async function requestPasswordReset(email) {
  const res = await fetch('http://localhost:8000/auth/request-password-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Request password reset error:', errorText);
    throw new Error(errorText || 'Failed to request password reset');
  }
}

export async function resetPassword(email, code, newPassword) {
  const res = await fetch('http://localhost:8000/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, new_password: newPassword }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Reset password error:', errorText);
    throw new Error(errorText || 'Failed to reset password');
  }
}

export async function checkHealth() {
  const res = await fetch(API_ENDPOINTS.HEALTH, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (res.status === 200) {
    const data = await res.json();
    console.log('Health check response data:', data);
  }

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Reset password error:', errorText);
    throw new Error(errorText || 'Failed to reset password');
  }
}

export async function checkHealthDb() {
  const res = await fetch(API_ENDPOINTS.HEALTH_DB, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (res.status === 200) {
    const data = await res.json();
    console.log('Health DB check response data:', data);
  }

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Reset password error:', errorText);
    throw new Error(errorText || 'Failed to reset password');
  }
}
