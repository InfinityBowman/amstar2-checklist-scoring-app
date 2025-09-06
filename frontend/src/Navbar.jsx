import { A } from '@solidjs/router';

export default function Navbar(props) {
  return (
    <nav class="flex items-center justify-between bg-gradient-to-r from-blue-700 to-blue-500 text-white px-8 py-4 shadow-lg">
      <div class="flex items-center space-x-4">
        {/* Sidebar open button */}
        {/* <Show when={!props.open}> */}
        <button
          class="ml-[-12px] bg-white/80 text-blue-700 p-2 rounded-full shadow hover:bg-white hover:scale-105 transition-all duration-150 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={props.toggleSidebar}
          aria-label="Toggle sidebar open or closed"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* </Show> */}
        <span class="font-extrabold text-2xl tracking-tight drop-shadow">CoRATES</span>
      </div>

      <div class="flex space-x-6 items-center">
        <A href="/" class="hover:bg-blue-600 px-3 py-2 rounded transition font-medium">
          Home
        </A>
        <A href="/dashboard" class="hover:bg-blue-600 px-3 py-2 rounded transition font-medium">
          Dashboard
        </A>
        <A href="/signin" class="hover:bg-blue-600 px-3 py-2 rounded transition font-medium">
          Sign In
        </A>
        <A href="/signup" class="hover:bg-blue-600 px-3 py-2 rounded transition font-medium">
          Sign Up
        </A>
      </div>
    </nav>
  );
}
