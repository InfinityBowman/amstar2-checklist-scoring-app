import AMSTARRobvis from '../../charts/AMSTARRobvis';
import AMSTARDistribution from '../../charts/AMSTARDistribution';
import { getAnswers } from '@offline/AMSTAR2Checklist.js';
import { useAppStore } from '@/AppStore.js';
import { createEffect, createSignal } from 'solid-js';

export default function ChartSection() {
  const { currentProject } = useAppStore();

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

  return (
    <>
      <div class="mb-6">
        <AMSTARRobvis data={checklistData()} />
      </div>
      <div>
        <AMSTARDistribution data={checklistData()} />
      </div>
    </>
  );
}
