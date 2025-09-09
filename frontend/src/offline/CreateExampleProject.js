import { createProject } from '../Project.js';
import AMSTAR2Checklist from '../AMSTAR2Checklist.js';
import { saveProject, generateUUID } from './LocalDB.js';

// Generates and saves an example project with several checklists
export async function createExampleProject() {
  const checklistNames = ['Review 1', 'Review 2', 'Review 3', 'Review 4', 'Review 5'];

  let allChecklists = [];

  for (const name of checklistNames) {
    const checklist = AMSTAR2Checklist.CreateChecklist({
      name,
      id: generateUUID(),
      createdAt: Date.now(),
    });
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
