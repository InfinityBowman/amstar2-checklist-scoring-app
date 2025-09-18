import { A, useLocation } from '@solidjs/router';
import { Show, createEffect } from 'solid-js';
import { useAuth } from './auth/AuthProvider.jsx';
import { BASEPATH } from './routes/Routes.jsx';

function normalizePath(path) {
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

export default function Navbar(props) {
  const { user, signout } = useAuth();
  const location = useLocation();
  const isHome = () => normalizePath(location.pathname) === normalizePath(BASEPATH);

  // Read from localStorage on render
  // Do this because we want to avoid layout shift on refresh
  const storedName = localStorage.getItem('userName');
  const isLikelyLoggedIn = !!storedName;

  createEffect(() => {
    // Update localStorage when user changes
    if (user()) {
      localStorage.setItem('userName', user().name);
    } else {
      localStorage.removeItem('userName');
    }
  });

  return (
    <nav class="flex items-center justify-between bg-gradient-to-r from-blue-700 to-blue-500 text-white px-8 py-4 shadow-lg">
      <div class="flex items-center space-x-4">
        {/* Sidebar open button */}
        <Show when={!isHome()}>
          <button
            class="ml-[-12px] bg-white/80 text-blue-700 p-2 rounded-full shadow hover:bg-white hover:scale-105 transition-all duration-150 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={props.toggleSidebar}
            aria-label="Toggle sidebar open or closed"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </Show>
        <A href="/" class="font-extrabold text-2xl tracking-tight drop-shadow">
          CoRATES
        </A>
      </div>

      <div class="flex space-x-6 items-center">
        <A href="/dashboard" class="hover:bg-blue-600 px-3 py-2 rounded transition font-medium">
          Dashboard
        </A>
        <Show
          when={user()}
          fallback={
            isLikelyLoggedIn ?
              <>
                <span class="font-medium">Hello, {storedName}</span>
                <button class="hover:bg-blue-600 px-3 py-2 rounded transition font-medium">Sign Out</button>
              </>
            : <>
                <A href="/signin" class="hover:bg-blue-600 px-3 py-2 rounded transition font-medium">
                  Sign In
                </A>
                <A href="/signup" class="hover:bg-blue-600 px-3 py-2 rounded transition font-medium">
                  Sign Up
                </A>
              </>
          }
        >
          <span class="font-medium">Hello, {user().name}</span>
          <button
            onClick={async () => {
              await signout();
            }}
            class="hover:bg-blue-600 px-3 py-2 rounded transition font-medium"
          >
            Sign Out
          </button>
        </Show>
      </div>
    </nav>
  );
}
