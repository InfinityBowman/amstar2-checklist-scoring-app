import { useAppStore } from '@/AppStore.js';
import { createEffect, Show, createSignal } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { createChecklist } from '@offline/AMSTAR2Checklist.js';
import { createReview } from '@offline/review.js';
import { generateUUID } from '@offline/localDB.js';
import { slugify } from './Routes.jsx';
import ProjectMemberManager from '../components/project/ProjectMemberManager.jsx';

// Import new components
import ProjectHeader from '../components/project/ProjectHeader';
import ProjectMetadata from '../components/project/ProjectMetadata';
import AddReviewForm from '../components/project/AddReviewForm';
import ReviewsList from '../components/project/ReviewsList';
import FileManagement from '../components/project/FileManagement';
import ChartSection from '../components/project/ChartSection';

export default function ProjectDashboard() {
  const {
    currentProject,
    setCurrentProject,
    deleteProject,
    addReview,
    deleteReview,
    addChecklistToReview,
    deleteChecklistFromReview,
  } = useAppStore();

  const params = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = createSignal(false);

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

  const handleAddReview = async (reviewName) => {
    const review = createReview({
      id: await generateUUID(),
      name: reviewName,
      createdAt: Date.now(),
      checklists: [],
    });
    await addReview(currentProject().id, review);
  };

  const handleAddChecklist = async (reviewId, checklistName) => {
    const checklist = createChecklist({
      name: checklistName,
      id: await generateUUID(),
      createdAt: Date.now(),
      reviewerName: 'Unassigned',
    });
    await addChecklistToReview(currentProject().id, reviewId, checklist);
  };

  const handleChecklistClick = (checklist) => {
    const checklistSlug = slugify(checklist.name);
    const projectSlug = slugify(currentProject().name);
    const review = (currentProject().reviews || []).find((r) =>
      (r.checklists || []).some((cl) => cl.id === checklist.id),
    );
    if (!review) {
      console.error('Review not found for checklist', checklist);
      return;
    }
    const reviewSlug = slugify(review.name);
    navigate(
      `/projects/${projectSlug}-${currentProject().id}/reviews/${reviewSlug}-${review.id}/checklists/${checklistSlug}-${checklist.id}`,
    );
  };

  const toggleMemberManager = () => {
    setIsOpen(!isOpen());
  };

  const handleMemberAdded = (user) => {
    // Update local state or refresh project details
    console.log('New member added unimplemented:', user);
    // Close the modal after member is added
    setIsOpen(false);
  };

  return (
    <Show when={currentProject()} fallback={<div class="p-8">Project not found.</div>}>
      <div class="p-6">
        <ProjectHeader
          project={currentProject()}
          onDeleteProject={deleteProject}
          onManageMembers={toggleMemberManager}
        />
        <ProjectMemberManager
          open={isOpen()}
          onClose={() => setIsOpen(false)}
          projectId={currentProject().id}
          onMemberAdded={handleMemberAdded}
        />
        <ProjectMetadata createdAt={currentProject().createdAt} />

        <AddReviewForm onAddReview={handleAddReview} />

        <ReviewsList
          onDeleteReview={(reviewId) => deleteReview(currentProject().id, reviewId)}
          onChecklistClick={handleChecklistClick}
          onDeleteChecklist={(reviewId, checklistId) =>
            deleteChecklistFromReview(currentProject().id, reviewId, checklistId)
          }
          onAddChecklist={handleAddChecklist}
        />

        <FileManagement />

        <ChartSection />
      </div>
    </Show>
  );
}
