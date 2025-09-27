import { createProject } from './project.js';
import { createChecklist } from './AMSTAR2Checklist.js';
import { saveProject, generateUUID } from './localDB.js';

function fillExampleAnswers(checklist, idx) {
  // For demonstration, set the last option of each question to true for odd checklists,
  // and the first option to true for even checklists.
  Object.keys(checklist).forEach((key) => {
    if (/^q\d+[a-z]*$/i.test(key) && checklist[key]?.answers) {
      checklist[key].answers.forEach((arr, colIdx) => {
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

// Generates and saves an example project with several checklists
export async function createExampleProject() {
  const checklistNames = ['Review 1', 'Review 2', 'Review 3', 'Review 4', 'Review 5'];

  let allChecklists = [];

  for (const [idx, name] of checklistNames.entries()) {
    let checklist = createChecklist({
      name,
      id: generateUUID(),
      createdAt: Date.now(),
    });
    checklist = fillExampleAnswers(checklist, idx); // Fill with example answers
    allChecklists.push(checklist);
  }
  const project = createProject({
    id: generateUUID(),
    name: 'Example Project',
    createdAt: Date.now(),
    checklists: allChecklists,
  });

  await saveProject(project);
}
