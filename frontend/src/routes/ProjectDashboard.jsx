import AMSTARRobvis from '@/charts/AMSTARRobvis.jsx';
import AMSTARDistribution from '@/charts/AMSTARDistribution.jsx';
import { useAppState } from '@/AppState.jsx';
import { createEffect, Show, createSignal, For } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { createChecklist, getAnswers } from '@offline/AMSTAR2Checklist.js';
import { createReview } from '@offline/review.js';
import { uploadAndStoreFile, getStoredFile } from '@offline/fileStorage.js';
import { generateUUID } from '@offline/localDB.js';
import { slugify } from './Routes.jsx';

export default function ProjectDashboard() {
  const { currentProject, setCurrentProject, deleteProject, addReview, deleteReview, addChecklistToReview, deleteChecklistFromReview } =
    useAppState();
  const params = useParams();
  const navigate = useNavigate();
  const [reviewName, setReviewName] = createSignal('');
  const [checklistName, setChecklistName] = createSignal('');
  const [checklistData, setChecklistData] = createSignal([]);

  function getProjectIdFromParam(param) {
    if (!param) return null;
    const lastDash = param.lastIndexOf('-');
    return lastDash !== -1 ? param.slice(lastDash + 1) : param;
  }

  createEffect(() => {
    const projectId = getProjectIdFromParam(params.projectSlug);
    if (projectId) {
      setCurrentProject(projectId);
    } else {
      console.warn('ProjectDashboard: No project found for', projectId);
      navigate(`/dashboard`);
    }
  });

  const handleAddReview = async () => {
    if (!reviewName().trim()) return;
    const review = createReview({
      id: await generateUUID(),
      name: reviewName(),
      createdAt: Date.now(),
      checklists: [],
    });
    await addReview(currentProject().id, review);
    setReviewName('');
  };

  const handleAddChecklist = async (reviewId) => {
    if (!checklistName().trim()) return;
    const checklist = createChecklist({
      name: checklistName(),
      id: await generateUUID(),
      createdAt: Date.now(),
      reviewerName: 'Unassigned',
    });
    await addChecklistToReview(currentProject().id, reviewId, checklist);
    setChecklistName('');
  };

  const handleChecklistClick = (checklist) => {
    const checklistSlug = slugify(checklist.name);
    const projectSlug = slugify(currentProject().name);
    const review = (currentProject().reviews || []).find((r) => (r.checklists || []).some((cl) => cl.id === checklist.id));
    if (!review) {
      console.error('Review not found for checklist', checklist);
      return;
    }
    const reviewSlug = slugify(review.name);
    navigate(
      `/projects/${projectSlug}-${currentProject().id}/reviews/${reviewSlug}-${review.id}/checklists/${checklistSlug}-${checklist.id}`,
    );
  };

  const handleChecklistExport = () => {
    let csv = exportChecklistsToCSV(currentProject().checklists);
    console.log(csv);
  };

  const questionOrder = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15', 'q16'];

  createEffect(() => {
    const data = (currentProject()?.reviews || []).flatMap((review) =>
      (review.checklists || []).map((cl) => {
        const answersObj = getAnswers(cl);
        return {
          label: cl.name || cl.title || cl.id,
          reviewer: cl.reviewerName || '',
          reviewName: review.name,
          questions: questionOrder.map((q) => answersObj[q]),
        };
      }),
    );
    setChecklistData(data);
  });

  const handleGetStoredFile = async () => {
    const fileName = prompt('Enter the name of the file to retrieve (including extension):');
    if (!fileName) return;
    try {
      const file = await getStoredFile(fileName);
      if (!file) {
        alert(`File "${fileName}" not found.`);
        return;
      }
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name || fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error retrieving file:', error);
      alert('Error retrieving file. See console for details.');
    }
  };

  const handleDisplayStoredFile = async () => {
    const fileName = prompt('Enter the name of the PDF file to display (including .pdf):');
    if (!fileName) return;
    try {
      const file = await getStoredFile(fileName);
      if (!file) {
        alert(`File "${fileName}" not found.`);
        return;
      }
      // Only display if it's a PDF
      if (file.type !== 'application/pdf' && !fileName.toLowerCase().endsWith('.pdf')) {
        alert('Selected file is not a PDF.');
        return;
      }
      const url = URL.createObjectURL(file);
      // Open in a new tab using the browser's PDF viewer
      window.open(url, '_blank');
      // Revoke the URL after some time since this is an example implementation
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('Error displaying file:', error);
      alert('Error displaying file. See console for details.');
    }
  };

  return (
    <Show when={currentProject()} fallback={<div class="p-8">Project not found.</div>}>
      <div class="p-6 max-w-4xl mx-auto">
        <div class="flex flex-wrap items-center justify-between mb-4 gap-2">
          <h2 class="text-xl font-bold">{currentProject().name} Dashboard</h2>
          <button
            onClick={() => deleteProject(currentProject().id)}
            class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
          >
            Delete Project
          </button>
        </div>
        <div class="mb-2 text-xs text-gray-500">Created: {new Date(currentProject().createdAt).toLocaleDateString()}</div>
        <div class="mb-4">
          <h3 class="text-base font-semibold mb-1">Add New Review</h3>
          <div class="flex gap-2 items-center">
            <input
              type="text"
              class="px-2 py-1 border rounded w-48 text-sm"
              placeholder="Review (study/article) name"
              value={reviewName()}
              onInput={(e) => setReviewName(e.target.value)}
            />
            <button
              class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
              onClick={handleAddReview}
              disabled={!reviewName().trim()}
            >
              + Add Review
            </button>
          </div>
        </div>
        <div class="mb-4">
          <h3 class="text-base font-semibold mb-1">Reviews &amp; Checklists</h3>
          <ul class="divide-y divide-gray-100 border rounded bg-white shadow-sm">
            <For each={currentProject().reviews || []}>
              {(review) => (
                <li class="p-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="font-semibold">{review.name}</span>
                      <span class="ml-2 text-xs text-gray-400">Created: {new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button
                      class="px-2 py-1 bg-red-400 text-white rounded hover:bg-red-500 text-xs"
                      onClick={() => deleteReview(currentProject().id, review.id)}
                    >
                      Delete Review
                    </button>
                  </div>
                  <div class="mt-2">
                    <h4 class="text-sm font-medium mb-1">Checklists</h4>
                    <ul class="space-y-1">
                      <For each={review.checklists || []}>
                        {(cl) => (
                          <li
                            class="flex items-center justify-between border rounded px-2 py-1 bg-white hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleChecklistClick(cl)}
                          >
                            <span>
                              <span class="font-semibold">{cl.name}</span>
                              <span class="ml-2 text-xs text-gray-600">
                                Reviewer: {cl.reviewerName || <span class="italic text-gray-400">Unassigned</span>}
                              </span>
                            </span>
                            <button
                              class="ml-2 px-2 py-0.5 bg-red-400 text-white rounded hover:bg-red-500 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChecklistFromReview(currentProject().id, review.id, cl.id);
                              }}
                            >
                              Delete
                            </button>
                          </li>
                        )}
                      </For>
                      {(!review.checklists || review.checklists.length === 0) && (
                        <li class="px-2 py-1 text-xs text-gray-400">No checklists yet.</li>
                      )}
                    </ul>
                    <div class="flex gap-2 mt-2">
                      <input
                        type="text"
                        class="px-2 py-1 border rounded w-40 text-xs"
                        placeholder="Checklist name"
                        value={checklistName()}
                        onInput={(e) => setChecklistName(e.target.value)}
                      />
                      <button
                        class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                        onClick={() => handleAddChecklist(review.id)}
                        disabled={!checklistName().trim()}
                      >
                        + Checklist
                      </button>
                    </div>
                  </div>
                </li>
              )}
            </For>
            {(!currentProject().reviews || currentProject().reviews.length === 0) && (
              <li class="px-4 py-2 text-xs text-gray-400">No reviews yet.</li>
            )}
          </ul>
        </div>
        <div class="mb-4 flex gap-2">
          <button class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm" onClick={handleChecklistExport}>
            Export Checklists CSV
          </button>
          <button class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm" onClick={uploadAndStoreFile}>
            Upload file
          </button>
          <button class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm" onClick={handleGetStoredFile}>
            Download File
          </button>
          <button class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm" onClick={handleDisplayStoredFile}>
            Display File
          </button>
        </div>
        <div class="mb-6">
          <AMSTARRobvis data={checklistData()} />
        </div>
        <div>
          <AMSTARDistribution data={checklistData()} />
        </div>
      </div>
    </Show>
  );
}
