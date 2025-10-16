import { createSignal, createEffect, createRoot } from 'solid-js';
import * as authService from '@api/authService.js';
import useOnlineStatus from '@primitives/useOnlineStatus.js';

function createAuthStore() {
  const [isLoggedIn, setIsLoggedIn] = createSignal(false);
  const [user, setUser] = createSignal(null);
  const [authLoading, setAuthLoading] = createSignal(true);
  const isOnline = useOnlineStatus();

  let wasOnline = isOnline();

  async function initializeAuth() {
    setAuthLoading(true);
    try {
      await authService.refreshAccessToken();
      const u = await authService.getCurrentUser();
      setUser(u);
      setIsLoggedIn(!!u);
    } catch {
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setAuthLoading(false);
    }
  }

  // run immediately on first import
  if (isOnline()) {
    initializeAuth();
  } else {
    setAuthLoading(false);
  }

  createEffect(() => {
    if (isOnline() && !wasOnline && !user()) {
      initializeAuth();
    }
    wasOnline = isOnline();
  });

  // --- API methods ---
  async function signup(email, password, name) {
    await authService.signup(email, password, name);
    localStorage.setItem('pendingEmail', email);
  }

  async function sendEmailVerification() {
    await authService.sendEmailVerification(localStorage.getItem('pendingEmail'));
  }

  async function verifyEmail(code) {
    await authService.verifyEmail(localStorage.getItem('pendingEmail'), code);
    localStorage.removeItem('pendingEmail');
  }

  async function signin(email, password) {
    localStorage.setItem('pendingEmail', email);
    await authService.signin(email, password);
    localStorage.removeItem('pendingEmail');
    setIsLoggedIn(true);
    setUser(await authService.getCurrentUser());
  }

  async function signout() {
    await authService.signout();
    setIsLoggedIn(false);
    setUser(null);
  }

  async function getCurrentUser() {
    const u = await authService.getCurrentUser();
    setUser(u);
    return u;
  }

  async function refreshAccessToken() {
    await authService.refreshAccessToken();
    // Later: maybe refresh user data
  }

  async function authFetch(url, options = {}) {
    return await authService.authFetch(url, options);
  }

  function getPendingEmail() {
    return localStorage.getItem('pendingEmail');
  }

  // export function useAuth() {
  return {
    isLoggedIn,
    user,
    signup,
    signin,
    signout,
    getCurrentUser,
    refreshAccessToken,
    authFetch,
    authLoading,
    sendEmailVerification,
    verifyEmail,
    getPendingEmail,
  };
}

const auth = createRoot(createAuthStore);

export function useAuth() {
  return auth;
}
