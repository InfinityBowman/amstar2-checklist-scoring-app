import { createSignal, createEffect, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { useAppStore } from '@/AppStore';

export default function ProjectMemberManager(props) {
  const { searchUsers, addUserToProjectByEmail, currentProject } = useAppStore();

  // Local state
  const [searchQuery, setSearchQuery] = createSignal('');
  const [searchResults, setSearchResults] = createSignal([]);
  const [isSearching, setIsSearching] = createSignal(false);
  const [error, setError] = createSignal('');
  const [success, setSuccess] = createSignal('');
  const [email, setEmail] = createSignal('');

  // Perform search when query changes (with debounce)
  let debounceTimeout;
  createEffect(() => {
    const query = searchQuery();
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    clearTimeout(debounceTimeout);
    if (query.length >= 2) {
      setIsSearching(true);
      setError('');
      debounceTimeout = setTimeout(async () => {
        try {
          const results = await searchUsers(query);
          await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay
          setSearchResults(results);
        } catch (err) {
          console.error('Search error:', err);
          setError('Failed to search users');
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    }
  });

  // Handle user selection from search results
  const handleSelectUser = async (user) => {
    setEmail(user.email);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Add user by email
  const handleAddByEmail = async (e) => {
    e.preventDefault();

    if (!email()) {
      setError('Please enter an email address');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const result = await addUserToProjectByEmail(currentProject().id, email());
      setSuccess(`Added ${result.user.name} (${result.user.email}) to the project`);
      setEmail('');

      // Notify parent component about the new member
      if (props.onMemberAdded) {
        props.onMemberAdded(result.user);
      }
    } catch (err) {
      setError(err.message || 'Failed to add user to project');
    }
  };

  return (
    <Show when={props.open}>
      <Portal>
        <div class="fixed inset-0 z-50 w-full flex items-center justify-center bg-black/40 overflow-auto py-8">
          <div class="max-w-2xl w-full mx-auto p-6 md:p-8 bg-white rounded-xl shadow-lg border border-gray-100 m-4">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">Add Team Members</h3>
                <p class="text-sm text-gray-600">Search for users or add them directly by email</p>
              </div>
              <button
                onClick={() => props.onClose?.()}
                class="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close dialog"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search users section */}
            <div class="mb-8">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery()}
                  onInput={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name or email"
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autocomplete="off"
                />
              </div>

              {/* Search results container with fixed position */}
              <div class="relative mt-3">
                {/* Search results - fixed position dropdown */}
                <Show when={searchResults().length > 0}>
                  <div class="absolute w-full z-50">
                    <ul class="max-h-[240px] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg divide-y divide-gray-100">
                      {searchResults().map((user) => (
                        <li
                          onClick={() => handleSelectUser(user)}
                          class="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 flex items-center justify-between group"
                        >
                          <div class="flex items-center min-w-0">
                            <div class="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div class="ml-3 min-w-0 flex-1">
                              <p class="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                              <p class="text-sm text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                          <svg
                            class="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Show>

                {/* Loading indicator */}
                <Show when={isSearching()}>
                  <div class="absolute w-full z-50">
                    <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center text-gray-500">
                      <svg
                        class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Searching...
                    </div>
                  </div>
                </Show>

                {/* Empty state message - when no results or not searching */}
                <Show when={!isSearching() && searchQuery().length >= 2 && searchResults().length === 0}>
                  <div class="absolute w-full z-50">
                    <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center text-gray-500">
                      <svg class="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1"
                          d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p class="text-sm">No users found</p>
                    </div>
                  </div>
                </Show>

                <Show when={searchQuery().length < 2 && !isSearching() && searchQuery().length > 0}>
                  <div class="absolute w-full z-50">
                    <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                      <p class="text-sm text-gray-500">Type at least 2 characters to search</p>
                    </div>
                  </div>
                </Show>
              </div>
            </div>

            {/* Divider */}
            <div class="relative mb-8">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-white text-gray-500 font-medium">Or add by email</span>
              </div>
            </div>

            {/* Add by email section */}
            <div class="space-y-4">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email()}
                  onInput={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  class="block w-full px-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddByEmail(e)}
                />
              </div>

              <button
                onClick={handleAddByEmail}
                class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Add to Project
              </button>

              {/* Fixed height container for notifications */}
              <div class="h-[20px] mt-4">
                <Show when={error()}>
                  <div class="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start">
                    <svg class="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <p class="text-sm text-red-800">{error()}</p>
                  </div>
                </Show>

                <Show when={success()}>
                  <div class="rounded-lg bg-green-50 border border-green-200 p-4 flex items-start">
                    <svg
                      class="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <p class="text-sm text-green-800">{success()}</p>
                  </div>
                </Show>
              </div>

              <div class="flex justify-end mt-8 pt-4 border-t border-gray-200">
                <button
                  onClick={() => props.onClose?.()}
                  class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg mr-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => props.onClose?.()}
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
}
