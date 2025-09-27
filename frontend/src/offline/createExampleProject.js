import { createProject } from './project.js';
import { createChecklist } from './AMSTAR2Checklist.js';
import { saveProject, generateUUID } from './localDB.js';

// Generates and saves an example project with several checklists
export async function createExampleProject() {
  const checklistNames = ['Review 1', 'Review 2', 'Review 3', 'Review 4', 'Review 5'];

  let allChecklists = [];

  for (const name of checklistNames) {
    const checklist = createChecklist({
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
