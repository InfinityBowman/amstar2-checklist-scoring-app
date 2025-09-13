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
