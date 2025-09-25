import { Show, For } from 'solid-js';
import ChecklistState from './offline/AMSTAR2Checklist.js';
import TreeView from './components/TreeView.jsx';
import { useAppState } from './AppState.jsx';
import { useNavigate } from '@solidjs/router';

export default function Sidebar(props) {
  const { projects, currentChecklist, checklists } = useAppState();
  const navigate = useNavigate();

  function handleSetPdfUrl() {
    const url = window.prompt('Enter PDF URL:');
    if (url) {
      props.setPdfUrl(url);
    }
  }

  function handleSetPdfFile(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      props.setPdfUrl(url);
    } else {
      alert('Please select a valid PDF file.');
    }
  }

  return (
    <div
      class={`
        transition-all duration-200 ease-in-out
        bg-white border-r border-gray-200 h-screen overflow-x-hidden
        ${props.open ? 'w-72' : 'w-0'}
        md:relative
        ${props.open ? '' : 'md:w-0'}
        fixed top-0 left-0 z-30 md:static md:z-auto
        ${props.open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      style="max-width: 100vw;"
    >
      <div
        class={`
          flex flex-col h-full
          transition-opacity duration-100
          ${props.open ? 'duration-500 opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        {/* Main Content */}
        <div class="flex-1 overflow-y-auto sidebar-scrollbar space-y-4">
          {/* Projects */}
          <div class="mb-2 px-2 pt-4">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Projects</h3>
          </div>
          <div class="p-2 pt-2 m-0 space-y-2 border-t border-gray-100">
            <button
              onClick={props.onAddProject}
              class="w-full bg-gray-900 hover:bg-gray-800 text-white px-2 py-2 rounded transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Project
            </button>
            <Show
              when={projects()?.length > 0}
              fallback={
                <div class="text-center py-2 px-2">
                  <div class="w-8 h-8 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p class="text-xs text-gray-500 font-medium">No projects yet</p>
                </div>
              }
            >
              <For each={projects()}>
                {(project) => (
                  <TreeView
                    projectId={project.id}
                    onSelect={() => {
                      const matches = projects().filter((p) => p.name === project.name);
                      const index = matches.findIndex((p) => p.id === project.id);
                      navigate(`/project/${encodeURIComponent(project.name)}/${index}`);
                    }}
                  >
                    {(checklist) => (
                      <div
                        class={`
                            flex items-center group rounded transition-colors
                            ${currentChecklist() && checklist.id === currentChecklist().id ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}
                          `}
                        style="flex: 1"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/checklist/${checklist.id}`);
                          }}
                          class="flex-1 flex items-center gap-2 px-2 py-1.5 text-left focus:outline-none"
                          tabIndex={0}
                        >
                          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <div class="flex-1 min-w-0">
                            <div class="flex gap-2 items-center">
                              <div class="text-xs font-medium truncate">{checklist.name}</div>
                              <span
                                class={`
                                    text-2xs font-semibold px-1.5 py-0.5 rounded
                                    ${(() => {
                                      const score = ChecklistState.scoreChecklist(checklist);
                                      if (score === 'High') return 'bg-green-100 text-green-800';
                                      if (score === 'Moderate') return 'bg-yellow-100 text-yellow-800';
                                      if (score === 'Low') return 'bg-orange-100 text-orange-800';
                                      if (score === 'Critically Low') return 'bg-red-100 text-red-800';
                                      return 'bg-gray-100 text-gray-600';
                                    })()}
                                  `}
                              >
                                {(() => {
                                  if (!checklist) return 'Unknown';
                                  const score = ChecklistState.scoreChecklist(checklist);
                                  if (score.length + (checklist.name?.length || 0) < 30) {
                                    return score;
                                  } else {
                                    return <span class="inline-block w-2 h-2 rounded-full" style="background:currentColor;" />;
                                  }
                                })()}
                              </span>
                            </div>
                            <div class="text-xs text-gray-500 mt-0.5">{new Date(checklist.createdAt).toLocaleDateString()}</div>
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            props.onDeleteChecklist(project.id, checklist.id);
                          }}
                          class={`
                              p-1.5 mr-1 rounded transition-colors text-gray-400 hover:text-red-600 hover:bg-red-50
                              ${currentChecklist() && checklist.id !== currentChecklist().id ? 'opacity-0 group-hover:opacity-100' : ''}
                            `}
                          aria-label="Delete checklist"
                          tabIndex={-1}
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </TreeView>
                )}
              </For>
            </Show>
          </div>
          {/* Checklists label */}
          <div class="mb-2 px-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Checklists</h3>
          </div>
          <div class="border-t border-gray-100 pt-1 mx-2">
            <Show
              when={checklists()?.length > 0}
              fallback={
                <div class="text-center py-2 px-2">
                  <div class="w-8 h-8 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p class="text-xs text-gray-500 font-medium">No checklists yet</p>
                </div>
              }
            >
              <ul class="list-disc space-y-1 text-xs">
                <For each={checklists()}>
                  {(checklist) => (
                    <div
                      class={`
                            flex items-center group rounded transition-colors
                            ${currentChecklist() && checklist.id === currentChecklist().id ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}
                          `}
                      style="flex: 1"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/checklist/${checklist.id}`);
                        }}
                        class="flex-1 flex items-center gap-2 px-2 py-1.5 text-left focus:outline-none"
                        tabIndex={0}
                      >
                        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <div class="flex-1 min-w-0">
                          <div class="flex gap-2 items-center">
                            <div class="text-xs font-medium truncate">{checklist.name}</div>
                            <span
                              class={`
                                    text-2xs font-semibold px-1.5 py-0.5 rounded
                                    ${(() => {
                                      const score = ChecklistState.scoreChecklist(checklist);
                                      if (score === 'High') return 'bg-green-100 text-green-800';
                                      if (score === 'Moderate') return 'bg-yellow-100 text-yellow-800';
                                      if (score === 'Low') return 'bg-orange-100 text-orange-800';
                                      if (score === 'Critically Low') return 'bg-red-100 text-red-800';
                                      return 'bg-gray-100 text-gray-600';
                                    })()}
                                  `}
                            >
                              {(() => {
                                if (!checklist) return 'Unknown';
                                const score = ChecklistState.scoreChecklist(checklist);
                                if (score.length + (checklist.name?.length || 0) < 30) {
                                  return score;
                                } else {
                                  return <span class="inline-block w-2 h-2 rounded-full" style="background:currentColor;" />;
                                }
                              })()}
                            </span>
                          </div>
                          <div class="text-xs text-gray-500 mt-0.5">{new Date(checklist.createdAt).toLocaleDateString()}</div>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          props.onDeleteChecklist(null, checklist.id);
                        }}
                        class={`
                              p-1.5 mr-1 rounded transition-colors text-gray-400 hover:text-red-600 hover:bg-red-50
                              ${currentChecklist() && checklist.id !== currentChecklist().id ? 'opacity-0 group-hover:opacity-100' : ''}
                            `}
                        aria-label="Delete checklist"
                        tabIndex={-1}
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </For>
              </ul>
            </Show>
          </div>
          {/* Actions Section */}
          <div class="mb-2 px-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Actions</h3>
          </div>
          <div class="border-t border-gray-100 pt-1 space-y-1 mx-2">
            <button
              onClick={props.onExportCSV}
              class="w-full px-2 py-1.5 rounded text-left transition-colors duration-150 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs"
            >
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export CSV
            </button>
            <label class="w-full px-2 py-1.5 rounded text-left transition-colors duration-150 text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-xs">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Import CSV
              <input type="file" accept=".csv,text/csv" onChange={props.onImportCSV} class="hidden" />
            </label>
            <button
              onClick={handleSetPdfUrl}
              class="w-full px-2 py-1.5 rounded text-left transition-colors duration-150 text-blue-700 hover:bg-blue-50 flex items-center gap-2 text-xs"
            >
              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 10l4.553-2.276A2 2 0 0020 6.382V5a2 2 0 00-2-2H6a2 2 0 00-2 2v1.382a2 2 0 00.447 1.342L9 10m6 0v10m-6-10v10"
                />
              </svg>
              Set PDF URL
            </button>
            <label class="w-full px-2 py-1.5 rounded text-left transition-colors duration-150 text-blue-700 hover:bg-blue-50 flex items-center gap-2 text-xs cursor-pointer">
              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 10l4.553-2.276A2 2 0 0020 6.382V5a2 2 0 00-2-2H6a2 2 0 00-2 2v1.382a2 2 0 00.447 1.342L9 10m6 0v10m-6-10v10"
                />
              </svg>
              Set PDF File
              <input type="file" accept="application/pdf" onChange={handleSetPdfFile} class="hidden" />
            </label>
          </div>
          {/* Settings/Danger Zone */}
          <div class="mb-2 px-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Settings</h3>
          </div>
          <div class="border-t border-gray-100 pt-1 space-y-1 mx-2">
            <button
              onClick={props.onDeleteAll}
              class="w-full px-2 py-1.5 rounded text-left transition-colors duration-150 text-red-600 hover:bg-red-50 flex items-center gap-2 text-xs"
            >
              <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear all data
            </button>
            <div class="mt-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
