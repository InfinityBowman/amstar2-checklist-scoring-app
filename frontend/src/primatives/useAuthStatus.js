import { createSignal } from 'solid-js';

export default function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);

  // This is a placeholder, we will add logic to check auth as needed later on

  return [isAuthenticated, setIsAuthenticated];
}
