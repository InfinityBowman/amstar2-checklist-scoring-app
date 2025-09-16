export async function signup(email, password, name) {
  const res = await fetch('http://localhost:8000/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Signup error:', errorText);
    throw new Error(errorText || 'Signup failed');
  }
  // console.log('User created');
}

let accessToken = null;

export async function signin(email, password) {
  // console.log('Signing in user:', email);
  const res = await fetch('http://localhost:8000/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // important for refresh cookie
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Sign in failed:', errorText);
    throw new Error(errorText || 'Sign in failed');
  }

  const data = await res.json();
  accessToken = data.accessToken;
  // console.log('Access token:', accessToken);
}

export async function getCurrentUser() {
  const res = await authFetch('http://localhost:8000/users/me');
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

  let res = await fetch(url, options);

  if (res.status === 401 || res.status === 403) {
    // Try to refresh the token
    try {
      await refreshAccessToken();
      // Retry the request with new token
      options.headers.Authorization = `Bearer ${accessToken}`;
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
  const res = await fetch('http://localhost:8000/auth/refresh', {
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
  console.log('Refreshed access token:', accessToken);
}

export async function signout() {
  await fetch('http://localhost:8000/auth/signout', {
    method: 'POST',
    credentials: 'include',
  });
  accessToken = null;
}

export async function sendEmailVerification(email) {
  const res = await fetch('http://localhost:8000/auth/send-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Send verification error:', errorText);
    throw new Error(errorText || 'Failed to send verification email');
  }
}

export async function verifyEmail(email, code) {
  const res = await fetch('http://localhost:8000/auth/verify-email', {
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
  const res = await fetch('http://localhost:8000/healthz', {
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
  const res = await fetch('http://localhost:8000/healthz/db', {
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

// THIS SHOULD CORRECTLY TEST THE FULL AUTH FLOW INCLUDING TOKEN REFRESH
// Uncomment this "run" function in ./SignUp.jsx to run the demo
export async function runTestAuth() {
  console.log('Running auth test');
  await signup('test@test.com', 'Test111!', 'Test User');
  console.log('Signed up');
  await signin('test@test.com', 'Test111!');
  console.log('Signed in');

  let user = await getCurrentUser();
  console.log('Got user:', user);

  console.log('Test token expiry and refresh');
  accessToken = 'bad-token';
  user = await getCurrentUser(); // should fail
  if (!user) {
    console.log('Token invalid, refreshing token');
    await refreshAccessToken();
    user = await getCurrentUser();
    console.log('After refresh:', user);
  }

  await signout();
  console.log('Signed out');
}
