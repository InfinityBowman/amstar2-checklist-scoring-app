import { createEffect, Show, createSignal } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { createReview, deleteReview } from '@api/reviewService.js';
import { createChecklist, deleteChecklist, saveChecklistAnswer } from '@api/checklistService.js';
import { deleteProject } from '@api/projectService.js';
import { solidStore } from '@offline/solidStore';
import { createChecklist as createAMSTARChecklist } from '@offline/AMSTAR2Checklist.js';
import { generateUUID } from '@offline/localDB.js';

import ProjectMemberManager from '../components/project/ProjectMemberManager.jsx';
import ProjectHeader from '../components/project/ProjectHeader';
import ProjectMetadata from '../components/project/ProjectMetadata';
import AddReviewForm from '../components/project/AddReviewForm';
import ReviewsList from '../components/project/ReviewsList';
import FileManagement from '../components/project/FileManagement';
import ChartSection from '../components/project/ChartSection';

export default function ProjectDashboard() {
  const { projects, getReviewsForProject, getProjectMembers } = solidStore;
  const [currentProject, setCurrentProject] = createSignal(null);

  const params = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = createSignal(false);

  createEffect(() => {
    const projectId = params.projectId;
    if (projectId) {
      setCurrentProject(projects().find((p) => p.id === projectId) || null);
    } else {
      console.warn('ProjectDashboard: No project found for', projectId);
      navigate(`/dashboard`);
    }
  });

  const handleAddReview = async (reviewName) => {
    if (reviewName.trim() === '') return;
    console.log('Creating review:', reviewName, 'for project', currentProject().id);
    let resp = await createReview(reviewName, currentProject().id);
    console.log('Created review response:', resp);
  };

  const handleAddChecklist = async (reviewId, checklistName) => {
    try {
      console.log('Creating checklist for review:', reviewId);
      // Create the checklist in the backend (returns checklist object with id)
      const checklistResp = await createChecklist(reviewId);
      // Create a new checklist object with the backend id
      const newChecklist = createAMSTARChecklist({
        name: 'New AMSTAR 2 Checklist',
        id: checklistResp.id,
        createdAt: Date.now(),
        reviewerName: '',
        reviewDate: '',
      });
      // Save all default answers for this checklist
      await Promise.all(
        Object.keys(newChecklist).map(async (key) => {
          if (/^q\d+[a-z]*$/i.test(key) && newChecklist[key]) {
            try {
              await saveChecklistAnswer(newChecklist.id, key, newChecklist[key].answers, newChecklist[key].critical);
            } catch (err) {
              console.error('Failed to save answer for', key, err);
            }
          }
        }),
      );
    } catch (error) {
      console.error('Error creating checklist:', error);
    }
  };

  const handleChecklistClick = (review, checklist) => {
    navigate(`/projects/${currentProject().id}/reviews/${review.id}/checklists/${checklist.id}`);
  };

  const toggleMemberManager = () => {
    setIsOpen(!isOpen());
  };

  return (
    <Show when={currentProject()} fallback={<div class="p-8">Project not found.</div>}>
      <div class="p-6">
        <ProjectHeader
          project={currentProject()}
          onDeleteProject={deleteProject}
          onManageMembers={toggleMemberManager}
        />
        <ProjectMemberManager open={isOpen()} onClose={() => setIsOpen(false)} projectId={currentProject().id} />
        <ProjectMetadata updatedAt={currentProject().updated_at} members={getProjectMembers(currentProject().id)} />

        <AddReviewForm onAddReview={handleAddReview} />

        <ReviewsList
          reviews={getReviewsForProject(currentProject().id)}
          onDeleteReview={(reviewId) => deleteReview(reviewId)}
          onChecklistClick={handleChecklistClick}
          onDeleteChecklist={(checklistId) => deleteChecklist(checklistId)}
          onAddChecklist={handleAddChecklist}
        />

        <FileManagement />

        <ChartSection />
      </div>
    </Show>
  );
}
