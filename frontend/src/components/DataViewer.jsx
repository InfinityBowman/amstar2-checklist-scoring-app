import { For, createEffect, Show } from 'solid-js';
import { solidStore } from '@offline/solidStore';

export default function DataViewer() {
  const { projects, users, reviews, checklists, checklistAnswers, projectMembers, reviewAssignments, state, isLoaded } =
    solidStore;

  // createEffect(() => {
  //   console.log('Store data updated:', {
  //     projects: projects().length,
  //     reviews: reviews().length,
  //     checklists: checklists().length,
  //     answers: checklistAnswers().length,
  //     members: projectMembers().length,
  //     assignments: reviewAssignments().length,
  //   });
  // });

  const short = (id) => id;

  return (
    <div class="p-3 bg-gray-50 text-xs">
      <h1 class="text-lg font-bold mb-2">TinyBase Store Data</h1>

      <Show when={isLoaded()} fallback={<div class="p-2 bg-blue-100 rounded">Loading...</div>}>
        <div class="grid grid-cols-1 gap-2">
          {/* Projects */}
          <div class="bg-white p-2 rounded shadow">
            <div class="flex justify-between items-center mb-1">
              <h2 class="font-bold">Projects ({projects().length})</h2>
            </div>
            <div class="overflow-auto max-h-32">
              <table class="w-full">
                <thead>
                  <Show when={projects().length > 0}>
                    <tr class="bg-gray-50 text-xs">
                      <For each={Object.keys(projects()[0])}>{(key) => <th class="p-1 text-left">{key}</th>}</For>
                    </tr>
                  </Show>
                </thead>
                <tbody>
                  <For each={projects()}>
                    {(p) => (
                      <tr class="hover:bg-gray-50 border-t border-gray-100">
                        <For each={Object.entries(p)}>
                          {([key, value]) => (
                            <td class="p-1 font-mono max-w-[100px] truncate">
                              {typeof value === 'object' && value !== null ?
                                JSON.stringify(value).substring(0, 20) +
                                (JSON.stringify(value).length > 20 ? '...' : '')
                              : String(value)}
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>

          {/* Users */}
          <div class="bg-white p-2 rounded shadow">
            <div class="flex justify-between items-center mb-1">
              <h2 class="font-bold">Users ({users().length})</h2>
            </div>
            <div class="overflow-auto max-h-32">
              <table class="w-full">
                <thead>
                  <Show when={users().length > 0}>
                    <tr class="bg-gray-50 text-xs">
                      <For each={Object.keys(users()[0])}>{(key) => <th class="p-1 text-left">{key}</th>}</For>
                    </tr>
                  </Show>
                </thead>
                <tbody>
                  <For each={users()}>
                    {(u) => (
                      <tr class="hover:bg-gray-50 border-t border-gray-100">
                        <For each={Object.entries(u)}>
                          {([key, value]) => (
                            <td class="p-1 font-mono max-w-[100px] truncate">
                              {typeof value === 'object' && value !== null ?
                                JSON.stringify(value).substring(0, 20) +
                                (JSON.stringify(value).length > 20 ? '...' : '')
                              : String(value)}
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>

          {/* Reviews */}
          <div class="bg-white p-2 rounded shadow">
            <div class="flex justify-between items-center mb-1">
              <h2 class="font-bold">Reviews ({reviews().length})</h2>
            </div>
            <div class="overflow-auto max-h-32">
              <table class="w-full">
                <thead>
                  <Show when={reviews().length > 0}>
                    <tr class="bg-gray-50 text-xs">
                      <For each={Object.keys(reviews()[0])}>{(key) => <th class="p-1 text-left">{key}</th>}</For>
                    </tr>
                  </Show>
                </thead>
                <tbody>
                  <For each={reviews()}>
                    {(r) => (
                      <tr class="hover:bg-gray-50 border-t border-gray-100">
                        <For each={Object.entries(r)}>
                          {([key, value]) => (
                            <td class="p-1 font-mono max-w-[100px] truncate">
                              {typeof value === 'object' && value !== null ?
                                JSON.stringify(value).substring(0, 20) +
                                (JSON.stringify(value).length > 20 ? '...' : '')
                              : String(value)}
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>

          {/* Checklists */}
          <div class="bg-white p-2 rounded shadow">
            <div class="flex justify-between items-center mb-1">
              <h2 class="font-bold">Checklists ({checklists().length})</h2>
            </div>
            <div class="overflow-auto max-h-32">
              <table class="w-full">
                <thead>
                  <Show when={checklists().length > 0}>
                    <tr class="bg-gray-50 text-xs">
                      <For each={Object.keys(checklists()[0])}>{(key) => <th class="p-1 text-left">{key}</th>}</For>
                    </tr>
                  </Show>
                </thead>
                <tbody>
                  <For each={checklists()}>
                    {(c) => (
                      <tr class="hover:bg-gray-50 border-t border-gray-100">
                        <For each={Object.entries(c)}>
                          {([key, value]) => (
                            <td class="p-1 font-mono max-w-[100px] truncate">
                              {typeof value === 'object' && value !== null ?
                                JSON.stringify(value).substring(0, 20) +
                                (JSON.stringify(value).length > 20 ? '...' : '')
                              : String(value)}
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>

          {/* Checklist Answers */}
          <div class="bg-white p-2 rounded shadow">
            <div class="flex justify-between items-center mb-1">
              <h2 class="font-bold">Answers ({checklistAnswers().length})</h2>
            </div>
            <div class="overflow-auto max-h-32">
              <table class="w-full">
                <thead>
                  <Show when={checklistAnswers().length > 0}>
                    <tr class="bg-gray-50 text-xs">
                      <For each={Object.keys(checklistAnswers()[0])}>
                        {(key) => <th class="p-1 text-left">{key}</th>}
                      </For>
                    </tr>
                  </Show>
                </thead>
                <tbody>
                  <For each={checklistAnswers()}>
                    {(a) => (
                      <tr class="hover:bg-gray-50 border-t border-gray-100">
                        <For each={Object.entries(a)}>
                          {([key, value]) => (
                            <td class="p-1 font-mono max-w-[100px] truncate">
                              {typeof value === 'object' && value !== null ?
                                JSON.stringify(value).substring(0, 20) +
                                (JSON.stringify(value).length > 20 ? '...' : '')
                              : String(value)}
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>

          {/* Project Members */}
          <div class="bg-white p-2 rounded shadow">
            <div class="flex justify-between items-center mb-1">
              <h2 class="font-bold">Project Members ({projectMembers().length})</h2>
            </div>
            <div class="overflow-auto max-h-32">
              <table class="w-full">
                <thead>
                  <Show when={projectMembers().length > 0}>
                    <tr class="bg-gray-50 text-xs">
                      <For each={Object.keys(projectMembers()[0])}>{(key) => <th class="p-1 text-left">{key}</th>}</For>
                    </tr>
                  </Show>
                </thead>
                <tbody>
                  <For each={projectMembers()}>
                    {(m) => (
                      <tr class="hover:bg-gray-50 border-t border-gray-100">
                        <For each={Object.entries(m)}>
                          {([key, value]) => (
                            <td class="p-1 font-mono max-w-[100px] truncate">
                              {typeof value === 'object' && value !== null ?
                                JSON.stringify(value).substring(0, 20) +
                                (JSON.stringify(value).length > 20 ? '...' : '')
                              : String(value)}
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>

          {/* Review Assignments */}
          <div class="bg-white p-2 rounded shadow">
            <div class="flex justify-between items-center mb-1">
              <h2 class="font-bold">Review Assignments ({reviewAssignments().length})</h2>
            </div>
            <div class="overflow-auto max-h-32">
              <table class="w-full">
                <thead>
                  <Show when={reviewAssignments().length > 0}>
                    <tr class="bg-gray-50 text-xs">
                      <For each={Object.keys(reviewAssignments()[0])}>
                        {(key) => <th class="p-1 text-left">{key}</th>}
                      </For>
                    </tr>
                  </Show>
                </thead>
                <tbody>
                  <For each={reviewAssignments()}>
                    {(a) => (
                      <tr class="hover:bg-gray-50 border-t border-gray-100">
                        <For each={Object.entries(a)}>
                          {([key, value]) => (
                            <td class="p-1 font-mono max-w-[100px] truncate">
                              {typeof value === 'object' && value !== null ?
                                JSON.stringify(value).substring(0, 20) +
                                (JSON.stringify(value).length > 20 ? '...' : '')
                              : String(value)}
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
