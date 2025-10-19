import { For, createEffect, Show } from 'solid-js';
import { solidStore } from '@offline/solidStore';

export default function DataViewer() {
  const { projects, users, reviews, checklists, checklistAnswers, projectMembers, reviewAssignments, state, isLoaded } =
    solidStore;

  createEffect(() => {
    // console.log('Store data updated:', {
    //   projects: projects().length,
    //   users: users().length,
    //   reviews: reviews().length,
    //   checklists: checklists().length,
    //   answers: checklistAnswers().length,
    //   members: projectMembers().length,
    //   assignments: reviewAssignments().length,
    // });
  });

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
                  <tr class="bg-gray-50 text-xs">
                    <th class="p-1 text-left">ID</th>
                    <th class="p-1 text-left">Name</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={projects()}>
                    {(p) => (
                      <tr class="hover:bg-gray-50 border-t border-gray-100">
                        <td class="p-1 font-mono">{short(p.id)}</td>
                        <td class="p-1">{p.name}</td>
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
                  <tr class="bg-gray-50 text-xs">
                    <th class="p-1 text-left">ID</th>
                    <th class="p-1 text-left">Name</th>
                    <th class="p-1 text-left">Email</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={users()}>
                    {(u) => (
                      <tr class="hover:bg-gray-50 border-t border-gray-100">
                        <td class="p-1 font-mono">{short(u.id)}</td>
                        <td class="p-1">{u.name}</td>
                        <td class="p-1">{u.email}</td>
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
                  <tr class="bg-gray-50 text-xs">
                    <th class="p-1 text-left">ID</th>
                    <th class="p-1 text-left">Name</th>
                    <th class="p-1 text-left">Project</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={reviews()}>
                    {(r) => (
                      <tr class="hover:bg-gray-50 border-t border-gray-100">
                        <td class="p-1 font-mono">{short(r.id)}</td>
                        <td class="p-1">{r.name}</td>
                        <td class="p-1 font-mono">{short(r.project_id)}</td>
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
                  <tr class="bg-gray-50 text-xs">
                    <th class="p-1 text-left">ID</th>
                    <th class="p-1 text-left">Type</th>
                    <th class="p-1 text-left">Review</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={checklists()}>
                    {(c) => (
                      <tr class="hover:bg-gray-50 border-t border-gray-100">
                        <td class="p-1 font-mono">{short(c.id)}</td>
                        <td class="p-1">{c.type}</td>
                        <td class="p-1 font-mono">{short(c.review_id)}</td>
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
                  <tr class="bg-gray-50 text-xs">
                    <th class="p-1 text-left">Checklist</th>
                    <th class="p-1 text-left">Question</th>
                    <th class="p-1 text-left">Answer</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={checklistAnswers()}>
                    {(a) => (
                      <tr class="hover:bg-gray-50 border-t border-gray-100">
                        <td class="p-1 font-mono">{short(a.checklist_id)}</td>
                        <td class="p-1">{a.question_key}</td>
                        <td class="p-1 truncate max-w-[100px]">
                          {typeof a.answers === 'string' ?
                            a.answers.length > 15 ?
                              a.answers.substring(0, 15) + '...'
                            : a.answers
                          : JSON.stringify(a.answers).substring(0, 15) + '...'}
                        </td>
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
                  <tr class="bg-gray-50 text-xs">
                    <th class="p-1 text-left">Project</th>
                    <th class="p-1 text-left">User</th>
                    <th class="p-1 text-left">Role</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={projectMembers()}>
                    {(m) => (
                      <tr class="hover:bg-gray-50 border-t border-gray-100">
                        <td class="p-1 font-mono">{short(m.project_id)}</td>
                        <td class="p-1 font-mono">{short(m.user_id)}</td>
                        <td class="p-1">{m.role}</td>
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
                  <tr class="bg-gray-50 text-xs">
                    <th class="p-1 text-left">Review</th>
                    <th class="p-1 text-left">User</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={reviewAssignments()}>
                    {(a) => (
                      <tr class="hover:bg-gray-50 border-t border-gray-100">
                        <td class="p-1 font-mono">{short(a.review_id)}</td>
                        <td class="p-1 font-mono">{short(a.user_id)}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Current Selections - Compact Version */}
        <div class="mt-2 bg-white p-2 rounded shadow">
          <h2 class="font-bold">Current Selections</h2>
          <div class="grid grid-cols-3 gap-2 text-xs mt-1">
            <div>
              <div class="font-medium">Project</div>
              <div class="bg-gray-50 p-1 rounded">{state.currentProject?.name || 'None'}</div>
            </div>
            <div>
              <div class="font-medium">Review</div>
              <div class="bg-gray-50 p-1 rounded">{state.currentReview?.name || 'None'}</div>
            </div>
            <div>
              <div class="font-medium">Checklist</div>
              <div class="bg-gray-50 p-1 rounded">{state.currentChecklist?.type || 'None'}</div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
