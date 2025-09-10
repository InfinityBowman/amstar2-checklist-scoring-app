import { Show, For } from 'solid-js';
import ChecklistState from './AMSTAR2Checklist.js';
import TreeView from './TreeView.jsx';
import { useAppState } from './AppState.jsx';
import { useNavigate } from '@solidjs/router';

export default function Sidebar(props) {
  const { projects, currentChecklist } = useAppState();
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
        ${props.open ? 'w-90' : 'w-0'}
        
        /* Mobile: Fixed overlay */
        md:relative
        ${props.open ? '' : 'md:w-0'}
        
        /* Mobile overlay behavior */
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
        {/* Header - keep this here because I may want to use that icon later */}
        {/* <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span class="font-semibold text-xl text-gray-900">Sidebar</span>
          <button
            class="w-10 h-10 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors"
            onClick={props.onClose}
            aria-label="Close sidebar"
          >
            <svg fill="none" stroke="currentColor" class="w-6 h-6" viewBox="0 0 20 20">
              <path d="M3.5 3C3.77614 3 4 3.22386 4 3.5V16.5L3.99023 16.6006C3.94371 16.8286 3.74171 17 3.5 17C3.25829 17 3.05629 16.8286 3.00977 16.6006L3 16.5V3.5C3 3.22386 3.22386 3 3.5 3ZM11.2471 5.06836C11.4476 4.95058 11.7104 4.98547 11.8721 5.16504C12.0338 5.34471 12.0407 5.60979 11.9023 5.79688L11.835 5.87207L7.80371 9.5H16.5C16.7761 9.5 17 9.72386 17 10C17 10.2761 16.7761 10.5 16.5 10.5H7.80371L11.835 14.1279C12.0402 14.3127 12.0568 14.6297 11.8721 14.835C11.6873 15.0402 11.3703 15.0568 11.165 14.8721L6.16504 10.3721L6.09473 10.2939C6.03333 10.2093 6 10.1063 6 10C6 9.85828 6.05972 9.72275 6.16504 9.62793L11.165 5.12793L11.2471 5.06836Z"></path>
            </svg>
          </button>
        </div> */}

        {/* Main Content */}
        <div class="flex-1 overflow-y-auto sidebar-scrollbar">
          {/* Checklists */}
          <div class="p-4">
            <div class="mb-4">
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">Projects</h3>
            </div>

            <div class="space-y-2">
              <button
                onClick={props.onAddProject}
                class="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center gap-3 text-base font-medium"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Project
              </button>
              <Show
                when={projects()?.length > 0}
                fallback={
                  <div class="text-center py-12 px-4">
                    <div class="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p class="text-base text-gray-500 font-medium">No projects yet</p>
                  </div>
                }
              >
                <For each={projects()}>
                  {(project) => (
                    <TreeView
                      projectId={project.id}
                      onSelect={() => {
                        navigate(`/project/${project.id}`);
                      }}
                    >
                      {(checklist) => (
                        <div
                          class={`
            flex items-center group rounded-lg transition-colors
            ${currentChecklist() && checklist.id === currentChecklist().id ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}
          `}
                          style="flex: 1"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/checklist/${checklist.id}`);
                            }}
                            class="flex-1 flex items-center gap-3 px-3 py-2.5 text-left focus:outline-none"
                            tabIndex={0}
                          >
                            {/* P age Icon */}
                            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <div class="flex-1 min-w-0">
                              <div class="flex gap-3 items-center">
                                <div class="text-base font-medium truncate">{checklist.name}</div>
                                <span
                                  class={`
                                text-xs font-semibold px-2 py-0.5 rounded
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
                                    // Show text only if it's long enough, otherwise show a colored dot
                                    if (score.length + (checklist.name?.length || 0) < 30) {
                                      return score;
                                    } else {
                                      return <span class="inline-block w-2 h-2 rounded-full" style="background:currentColor;" />;
                                    }
                                  })()}
                                </span>
                              </div>
                              <div class="text-sm text-gray-500 mt-1">{new Date(checklist.createdAt).toLocaleDateString()}</div>
                            </div>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              props.onDeleteChecklist(project.id, checklist.id);
                            }}
                            class={`
                          p-2 mr-2 rounded transition-colors text-gray-400 hover:text-red-600 hover:bg-red-50
                          ${currentChecklist() && checklist.id !== currentChecklist().id ? 'opacity-0 group-hover:opacity-100' : ''}
                        `}
                            aria-label="Delete checklist"
                            tabIndex={-1}
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
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
          </div>

          {/* Actions Section */}
          <div class="border-t border-gray-100 p-4">
            <div class="mb-2">
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">Actions</h3>
            </div>
            <div class="space-y-1">
              <button
                onClick={props.onExportCSV}
                // disabled={!props.currentChecklistState}
                class="w-full px-4 py-2.5 rounded-lg text-left transition-colors duration-150 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-base"
              >
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export CSV
              </button>

              <label class="w-full px-4 py-3 rounded-lg text-left transition-colors duration-150 text-gray-700 hover:bg-gray-50 flex items-center gap-3 text-base">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                class="w-full px-4 py-2.5 rounded-lg text-left transition-colors duration-150 text-blue-700 hover:bg-blue-50 flex items-center gap-3 text-base"
              >
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 10l4.553-2.276A2 2 0 0020 6.382V5a2 2 0 00-2-2H6a2 2 0 00-2 2v1.382a2 2 0 00.447 1.342L9 10m6 0v10m-6-10v10"
                  />
                </svg>
                Set PDF URL
              </button>

              <label class="w-full px-4 py-2.5 rounded-lg text-left transition-colors duration-150 text-blue-700 hover:bg-blue-50 flex items-center gap-3 text-base cursor-pointer">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </div>

          {/* Settings/Danger Zone */}
          <div class="border-t border-gray-100 p-4">
            <div class="mb-2">
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">Settings</h3>
            </div>
            <div class="space-y-1">
              <button
                onClick={props.onDeleteAll}
                class="w-full px-4 py-3 rounded-lg text-left transition-colors duration-150 text-red-600 hover:bg-red-50 flex items-center gap-3 text-base"
              >
                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear all data
              </button>
              <div class="mt-20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
