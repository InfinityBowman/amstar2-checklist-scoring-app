import { createShape } from '@electric-sql/solid';
import { createSignal, Show, For, createEffect } from 'solid-js';
import { API_ENDPOINTS } from '@api/config.js';
import { useAuth } from '@/auth/AuthStore.js';

export default function Electric() {
  const { authFetch, user } = useAuth();
  const [expandedTables, setExpandedTables] = createSignal(
    new Set([
      'users',
      'projects',
      'reviews',
      'checklists',
      'checklist_answers',
      'project_members',
      'review_assignments',
    ]),
  );

  if (!user()) {
    return (
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="bg-white rounded-md shadow p-4 max-w-xs text-center">
          <h2 class="text-base font-medium text-gray-900">Authentication Required</h2>
          <p class="text-sm text-gray-600">Database access requires an authenticated user.</p>
        </div>
      </div>
    );
  }

  // Create shapes for all tables
  const usersShape = createShape({
    url: API_ENDPOINTS.ELECTRIC_SHAPE,
    params: { table: 'users' },
    fetchClient: authFetch,
  });

  const projectsShape = createShape({
    url: API_ENDPOINTS.ELECTRIC_SHAPE,
    params: { table: 'projects' },
    fetchClient: authFetch,
  });

  const reviewsShape = createShape({
    url: API_ENDPOINTS.ELECTRIC_SHAPE,
    params: { table: 'reviews' },
    fetchClient: authFetch,
  });

  const checklistsShape = createShape({
    url: API_ENDPOINTS.ELECTRIC_SHAPE,
    params: { table: 'checklists' },
    fetchClient: authFetch,
  });

  const projectMembersShape = createShape({
    url: API_ENDPOINTS.ELECTRIC_SHAPE,
    params: { table: 'project_members' },
    fetchClient: authFetch,
  });

  const reviewAssignmentsShape = createShape({
    url: API_ENDPOINTS.ELECTRIC_SHAPE,
    params: { table: 'review_assignments' },
    fetchClient: authFetch,
  });

  const checklistAnswersShape = createShape({
    url: API_ENDPOINTS.ELECTRIC_SHAPE,
    params: { table: 'checklist_answers' },
    fetchClient: authFetch,
  });

  const tables = getTables();

  // Configure tables to display
  function getTables() {
    return [
      {
        name: 'users',
        data: () => usersShape.data(),
        isLoading: usersShape.isLoading,
        isError: usersShape.isError,
        error: usersShape.error,
        color: 'blue',
        description: 'User accounts and authentication data',
      },
      {
        name: 'projects',
        data: () => projectsShape.data(),
        isLoading: projectsShape.isLoading,
        isError: projectsShape.isError,
        error: projectsShape.error,
        color: 'purple',
        description: 'Research projects',
      },
      {
        name: 'reviews',
        data: () => reviewsShape.data(),
        isLoading: reviewsShape.isLoading,
        isError: reviewsShape.isError,
        error: reviewsShape.error,
        color: 'green',
        description: 'AMSTAR2 reviews',
      },
      {
        name: 'checklists',
        data: () => checklistsShape.data(),
        isLoading: checklistsShape.isLoading,
        isError: checklistsShape.isError,
        error: checklistsShape.error,
        color: 'orange',
        description: 'AMSTAR2 checklist items',
      },
      {
        name: 'checklist_answers',
        data: () => checklistAnswersShape.data(),
        isLoading: checklistAnswersShape.isLoading,
        isError: checklistAnswersShape.isError,
        error: checklistAnswersShape.error,
        color: 'lime',
        description: 'AMSTAR2 checklist answers',
      },
      {
        name: 'project_members',
        data: () => projectMembersShape.data(),
        isLoading: projectMembersShape.isLoading,
        isError: projectMembersShape.isError,
        error: projectMembersShape.error,
        color: 'pink',
        description: 'AMSTAR2 project members',
      },
      {
        name: 'review_assignments',
        data: () => reviewAssignmentsShape.data(),
        isLoading: reviewAssignmentsShape.isLoading,
        isError: reviewAssignmentsShape.isError,
        error: reviewAssignmentsShape.error(),
        color: 'cyan',
        description: 'AMSTAR2 review assignments',
      },
    ];
  }

  const toggleTable = (tableName) => {
    const expanded = new Set(expandedTables());
    if (expanded.has(tableName)) {
      expanded.delete(tableName);
    } else {
      expanded.add(tableName);
    }
    setExpandedTables(expanded);
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
      purple: {
        bg: 'bg-purple-100',
        border: 'border-purple-200',
        text: 'text-purple-700',
        badge: 'bg-purple-100 text-purple-800',
      },
      green: {
        bg: 'bg-green-100',
        border: 'border-green-200',
        text: 'text-green-700',
        badge: 'bg-green-100 text-green-800',
      },
      orange: {
        bg: 'bg-orange-100',
        border: 'border-orange-200',
        text: 'text-orange-700',
        badge: 'bg-orange-100 text-orange-800',
      },
      pink: { bg: 'bg-pink-100', border: 'border-pink-200', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-800' },
      cyan: { bg: 'bg-cyan-100', border: 'border-cyan-200', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-800' },
      lime: { bg: 'bg-lime-100', border: 'border-lime-300', text: 'text-lime-800', badge: 'bg-lime-100 text-lime-900' },
    };
    return colors[color] || colors.blue;
  };

  const formatValue = (value) => {
    if (value === null) return <span class="text-gray-400 italic">null</span>;
    if (value === undefined) return <span class="text-gray-400 italic">undefined</span>;
    if (typeof value === 'boolean')
      return <span class={value ? 'text-green-600' : 'text-red-600'}>{value.toString()}</span>;
    if (typeof value === 'object') return <span class="text-purple-600">{JSON.stringify(value)}</span>;
    return <span class="text-gray-900">{value.toString()}</span>;
  };

  // Create signals for total count and filtered tables
  const [filteredTables, setFilteredTables] = createSignal(tables);
  const [_totalRecordCount, setTotalRecordCount] = createSignal(0);

  // Effect to update the record count when any table data changes
  createEffect(() => {
    const count = tables.reduce((sum, table) => {
      // Access data to create reactive dependency
      const data = table.data();
      return sum + (data?.length || 0);
    }, 0);
    setFilteredTables(getTables());

    setTotalRecordCount(count);
  });

  return (
    <div class="min-h-screen max-w-screen bg-gray-50 p-3">
      {/* Tables */}
      <div class="space-y-2">
        <For each={filteredTables()}>
          {(table) => {
            const data = () => table.data();
            const isLoading = () => table.isLoading();
            const isError = () => table.isError();
            const error = () => table.error();
            const colors = () => getColorClasses(table.color);
            const recordCount = () => data()?.length || 0;
            const columns = () => (data() && data().length > 0 ? Object.keys(data()[0]) : []);

            return (
              <div
                class={`bg-white rounded shadow overflow-hidden border-l-2 ${colors().border} transition-all duration-200`}
              >
                {/* Table Header */}
                <div
                  class={`${colors().bg} px-3 py-2 cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => toggleTable(table.name)}
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <h2 class={`text-sm font-bold ${colors().text} uppercase`}>{table.name}</h2>
                      <p class="text-xs text-gray-600">
                        {table.description}
                        {!isLoading() && ` (${recordCount()})`}
                      </p>
                    </div>
                    <div class="flex items-center">
                      <Show when={isLoading()}>
                        <svg class="animate-spin h-3 w-3 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                           />
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      </Show>
                      <svg
                        class={`w-4 h-4 ${colors().text} transform transition-transform duration-200 ${expandedTables().has(table.name) ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Table Content */}
                <Show when={expandedTables().has(table.name)}>
                  <div class="p-2">
                    <Show when={isError()}>
                      <div class="bg-red-50 border border-red-200 rounded p-2 mb-2 text-xs">
                        <div class="flex items-center">
                          <svg class="h-3 w-3 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          <p class="text-red-700">{error()?.message || 'Error loading data'}</p>
                        </div>
                      </div>
                    </Show>

                    <Show when={isLoading() && !isError()}>
                      <div class="py-4 text-center">
                        <svg class="animate-spin h-4 w-4 text-blue-600 mx-auto mb-1" fill="none" viewBox="0 0 24 24">
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                           />
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <p class="text-gray-500 text-xs">Loading...</p>
                      </div>
                    </Show>

                    <Show
                      when={!isLoading() && !isError() && data() && data().length > 0}
                      fallback={
                        <Show when={!isLoading() && !isError()}>
                          <div class="text-center py-3">
                            <p class="text-gray-500 text-xs">No records found</p>
                          </div>
                        </Show>
                      }
                    >
                      {/* Table View */}
                      <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-100 text-xs">
                          <thead class="bg-gray-50">
                            <tr>
                              <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">#</th>
                              <For each={columns()}>
                                {(column) => (
                                  <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">{column}</th>
                                )}
                              </For>
                            </tr>
                          </thead>
                          <tbody class="bg-white divide-y divide-gray-100">
                            <For each={data()}>
                              {(row, index) => (
                                <tr class="hover:bg-gray-50">
                                  <td class="px-2 py-1 text-gray-500">{index() + 1}</td>
                                  <For each={columns()}>
                                    {(column) => <td class="px-2 py-1">{formatValue(row[column])}</td>}
                                  </For>
                                </tr>
                              )}
                            </For>
                          </tbody>
                        </table>
                      </div>

                      {/* JSON View Toggle */}
                      <details class="mt-2">
                        <summary class="cursor-pointer text-xs text-gray-600 hover:text-gray-900 flex items-center">
                          <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                            />
                          </svg>
                          JSON
                        </summary>
                        <pre class="mt-1 bg-gray-800 text-green-400 p-2 rounded text-[10px] overflow-x-auto">
                          {JSON.stringify(data(), null, 2)}
                        </pre>
                      </details>
                    </Show>
                  </div>
                </Show>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}
