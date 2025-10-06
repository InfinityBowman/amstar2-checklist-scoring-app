import { createContext, useContext, createSignal, onMount, createEffect } from 'solid-js';
import * as authService from '../api/authService.js';
import useOnlineStatus from '../primatives/useOnlineStatus.js';

const AuthContext = createContext();

export function AuthProvider(props) {
  const [isLoggedIn, setIsLoggedIn] = createSignal(false);
  const [user, setUser] = createSignal(null);
  const [authLoading, setAuthLoading] = createSignal(true);
  const isOnline = useOnlineStatus();

  // Track previous online status
  let wasOnline = isOnline();

  onMount(() => {
    if (!isOnline()) {
      setAuthLoading(false);
      return;
    }
    initializeAuth();
  });

  createEffect(() => {
    // console.log('Online status changed:', isOnline(), 'wasonline:', wasOnline, 'User:', user());
    // Only run when online status changes
    if (isOnline() && !wasOnline && !user()) {
      initializeAuth();
    }
    wasOnline = isOnline();
  });

  async function initializeAuth() {
    setAuthLoading(true);
    try {
      await authService.refreshAccessToken();
      const user = await authService.getCurrentUser();
      setUser(user);
    } catch {
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setAuthLoading(false);
    }
  }

  async function signup(email, password, name) {
    await authService.signup(email, password, name);
    localStorage.setItem('pendingEmail', email); // Store for verification
    // We do not auto login because we want email verification first
  }

  async function sendEmailVerification() {
    await authService.sendEmailVerification(localStorage.getItem('pendingEmail'));
  }

  async function verifyEmail(code) {
    await authService.verifyEmail(localStorage.getItem('pendingEmail'), code);
    localStorage.removeItem('pendingEmail');
  }

  async function signin(email, password) {
    localStorage.setItem('pendingEmail', email); // Store in case signin needs verification
    await authService.signin(email, password);
    localStorage.removeItem('pendingEmail'); // Clear pending email on successful signin
    setIsLoggedIn(true);
    setUser(await authService.getCurrentUser());
  }

  async function signout() {
    await authService.signout();
    setIsLoggedIn(false);
    setUser(null);
  }

  async function getCurrentUser() {
    const user = await authService.getCurrentUser();
    setUser(user);
    return user;
  }

  async function refreshAccessToken() {
    await authService.refreshAccessToken();
    // Later add update user data here in case they made changes on another device
  }

  async function authFetch(url, options = {}) {
    return await authService.authFetch(url, options);
  }

  function getPendingEmail() {
    return localStorage.getItem('pendingEmail');
  }

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
