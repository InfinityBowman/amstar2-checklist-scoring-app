import AMSTARRobvis from '../../charts/AMSTARRobvis';
import AMSTARDistribution from '../../charts/AMSTARDistribution';
import { getAnswers, createChecklist as createAMSTARChecklist } from '@offline/AMSTAR2Checklist.js';
import { createEffect, createSignal } from 'solid-js';
import { solidStore } from '@offline/solidStore';

export default function ChartSection(props) {
  const { getReviewsForProject, getChecklistsForReview, getAnswersForChecklist, getReviewerForChecklist } = solidStore;

  const [checklistData, setChecklistData] = createSignal([]);

  const questionOrder = [
    'q1',
    'q2',
    'q3',
    'q4',
    'q5',
    'q6',
    'q7',
    'q8',
    'q9',
    'q10',
    'q11',
    'q12',
    'q13',
    'q14',
    'q15',
    'q16',
  ];

  createEffect(() => {
    if (!props.project?.id) {
      setChecklistData([]);
      return;
    }

    const reviews = getReviewsForProject(props.project.id);
    const data = reviews.flatMap((review) => {
      const checklists = getChecklistsForReview(review.id);

      return checklists.map((checklist) => {
        const answers = getAnswersForChecklist(checklist.id);
        const reviewer = getReviewerForChecklist(checklist.id);

        // Create AMSTAR checklist with basic info
        const newChecklist = createAMSTARChecklist({
          name: review.name,
          id: checklist.id,
          reviewerName: reviewer?.name,
          createdAt: checklist.updated_at,
        });

        // Populate checklist with answers from store
        answers.forEach((answer) => {
          if (newChecklist[answer.question_key]) {
            newChecklist[answer.question_key].answers = answer.answers;
            newChecklist[answer.question_key].critical = answer.critical;
          }
        });

        // Now use getAnswers to get the properly formatted answers
        const answersObj = getAnswers(newChecklist);

        return {
          label: checklist.id, // Use checklist ID as label since checklists don't have names
          reviewer: reviewer?.name || 'Unassigned',
          reviewName: review.name,
          questions: questionOrder.map((q) => answersObj[q]),
        };
      });
    });

    console.log('Chart data:', data);
    setChecklistData(data);
  });

  return (
    <div class="flex flex-col gap-6">
      <AMSTARRobvis data={checklistData()} />

      <AMSTARDistribution data={checklistData()} />
    </div>
  );
}
