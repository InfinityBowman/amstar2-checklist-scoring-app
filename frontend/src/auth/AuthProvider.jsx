import { createContext, useContext, createSignal, onMount } from 'solid-js';
import * as authService from './authService';

const AuthContext = createContext();

export function AuthProvider(props) {
  const [isLoggedIn, setIsLoggedIn] = createSignal(false);
  const [user, setUser] = createSignal(null);
  const [authLoading, setAuthLoading] = createSignal(true);

  onMount(async () => {
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
  });

  async function signup(email, password, name) {
    await authService.signup(email, password, name);
    // We do not auto login because we want email verification first
  }

  async function sendEmailVerification(email) {
    await authService.sendEmailVerification(email);
  }

  async function verifyEmail(email, code) {
    await authService.verifyEmail(email, code);
  }

  async function signin(email, password) {
    await authService.signin(email, password);
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
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
