import { createProject } from './project.js';
import { createChecklist } from './AMSTAR2Checklist.js';
import { createReview } from './review.js';
import { saveProject, generateUUID } from './localDB.js';

function fillExampleAnswers(checklist, idx) {
  // For demonstration, set the last option of each question to true for odd checklists,
  // and the first option to true for even checklists.
  Object.keys(checklist).forEach((key) => {
    if (/^q\d+[a-z]*$/i.test(key) && checklist[key]?.answers) {
      checklist[key].answers.forEach((arr, _colIdx) => {
        arr.fill(false);
        if (idx % 2 === 0) {
          arr[0] = true; // Even: first option
        } else {
          arr[arr.length - 1] = true; // Odd: last option
        }
      });
    }
  });
  return checklist;
}

// Generates and saves an example project with reviews and checklists in each review
export async function createExampleProject() {
  const reviewNames = ['Review 1', 'Review 2', 'Review 3'];

  let allReviews = [];

  for (const [idx, name] of reviewNames.entries()) {
    // For each review, create 1-2 checklists as an example
    const numChecklists = idx % 2 === 0 ? 2 : 1;
    let checklists = [];
    for (let c = 0; c < numChecklists; c++) {
      let checklist = createChecklist({
        name: `Checklist ${c + 1}`,
        id: await generateUUID(),
        createdAt: Date.now(),
      });
      checklist = fillExampleAnswers(checklist, idx + c); // Fill with example answers
      checklists.push(checklist);

      const review = createReview({
        id: await generateUUID(),
        name,
        createdAt: Date.now(),
        checklists: [checklist],
        // pdfFileName: null,
      });
      allReviews.push(review);
    }
  }

  const project = createProject({
    id: await generateUUID(),
    name: 'Example Project',
    createdAt: Date.now(),
    reviews: allReviews,
  });

  await saveProject(project);
}
