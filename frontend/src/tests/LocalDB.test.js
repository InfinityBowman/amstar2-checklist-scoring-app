import { describe, it, expect, beforeEach } from 'vitest';
import * as LocalDB from '@offline/localDB';

// Helper to clear DB before each test
beforeEach(async () => {
  await LocalDB.deleteAllChecklists();
  const projects = await LocalDB.getAllProjects();
  await Promise.all(projects.map((p) => LocalDB.deleteProject(p.id)));
});

describe('LocalDB Checklist Store', () => {
  it('should save and get an independent checklist', async () => {
    const checklist = { id: 'cl1', name: 'Test Checklist', items: [] };
    await LocalDB.saveChecklist(checklist);
    const result = await LocalDB.getChecklist('cl1');
    expect(result).toEqual(checklist);
  });

  it('should get all independent checklists', async () => {
    const checklist1 = { id: 'cl1', name: 'Checklist 1', items: [] };
    const checklist2 = { id: 'cl2', name: 'Checklist 2', items: [] };
    await LocalDB.saveChecklist(checklist1);
    await LocalDB.saveChecklist(checklist2);
    const all = await LocalDB.getAllChecklists();
    expect(all.length).toBe(2);
    expect(all).toEqual(expect.arrayContaining([checklist1, checklist2]));
  });

  it('should delete an independent checklist', async () => {
    const checklist = { id: 'cl1', name: 'Checklist', items: [] };
    await LocalDB.saveChecklist(checklist);
    await LocalDB.deleteChecklist('cl1');
    const result = await LocalDB.getChecklist('cl1');
    expect(result).toBeUndefined();
  });

  it('should delete all independent checklists', async () => {
    await LocalDB.saveChecklist({ id: 'cl1', name: 'A', items: [] });
    await LocalDB.saveChecklist({ id: 'cl2', name: 'B', items: [] });
    await LocalDB.deleteAllChecklists();
    const all = await LocalDB.getAllChecklists();
    expect(all.length).toBe(0);
  });
});

describe('LocalDB Project & Review Store', () => {
  it('should save and get a project with reviews', async () => {
    const project = { id: 'p1', name: 'Project 1', reviews: [] };
    await LocalDB.saveProject(project);
    const result = await LocalDB.getProject('p1');
    expect(result).toEqual(project);
  });

  it('should get all projects', async () => {
    const project1 = { id: 'p1', name: 'Project 1', reviews: [] };
    const project2 = { id: 'p2', name: 'Project 2', reviews: [] };
    await LocalDB.saveProject(project1);
    await LocalDB.saveProject(project2);
    const all = await LocalDB.getAllProjects();
    expect(all.length).toBe(2);
    expect(all).toEqual(expect.arrayContaining([project1, project2]));
  });

  it('should delete a project', async () => {
    const project = { id: 'p1', name: 'Project', reviews: [] };
    await LocalDB.saveProject(project);
    await LocalDB.deleteProject('p1');
    const result = await LocalDB.getProject('p1');
    expect(result).toBeUndefined();
  });

  it('should save and update a review in a project', async () => {
    const project = { id: 'p1', name: 'Project', reviews: [] };
    const review = { id: 'r1', name: 'Review 1', checklists: [] };
    await LocalDB.saveProject(project);
    await LocalDB.saveReviewToProject('p1', review);
    let updated = await LocalDB.getProject('p1');
    expect(updated.reviews.length).toBe(1);
    expect(updated.reviews[0]).toEqual(review);

    // Update review
    const review2 = { ...review, name: 'Review 1 Updated' };
    await LocalDB.saveReviewToProject('p1', review2);
    updated = await LocalDB.getProject('p1');
    expect(updated.reviews[0].name).toBe('Review 1 Updated');
  });

  it('should delete a review from a project', async () => {
    const project = { id: 'p1', name: 'Project', reviews: [{ id: 'r1', name: 'Review', checklists: [] }] };
    await LocalDB.saveProject(project);
    await LocalDB.deleteReviewFromProject('p1', 'r1');
    const updated = await LocalDB.getProject('p1');
    expect(updated.reviews.length).toBe(0);
  });
});

describe('Checklist-Review-Project Relations', () => {
  it('should save a checklist to a review in a project', async () => {
    const project = { id: 'p1', name: 'Project', reviews: [{ id: 'r1', name: 'Review', checklists: [] }] };
    const checklist = { id: 'cl1', name: 'Checklist', items: [] };
    await LocalDB.saveProject(project);
    const updated = await LocalDB.saveChecklistToReview('p1', 'r1', checklist);
    expect(updated.reviews[0].checklists.length).toBe(1);
    expect(updated.reviews[0].checklists[0]).toEqual(checklist);
  });

  it('should update a checklist in a review in a project', async () => {
    const checklist = { id: 'cl1', name: 'Checklist', items: [] };
    const project = { id: 'p1', name: 'Project', reviews: [{ id: 'r1', name: 'Review', checklists: [checklist] }] };
    await LocalDB.saveProject(project);
    const updatedChecklist = { ...checklist, name: 'Checklist Updated' };
    await LocalDB.saveChecklistToReview('p1', 'r1', updatedChecklist);
    const updated = await LocalDB.getProject('p1');
    expect(updated.reviews[0].checklists[0].name).toBe('Checklist Updated');
  });

  it('should delete a checklist from a review in a project', async () => {
    const checklist = { id: 'cl1', name: 'Checklist', items: [] };
    const project = { id: 'p1', name: 'Project', reviews: [{ id: 'r1', name: 'Review', checklists: [checklist] }] };
    await LocalDB.saveProject(project);
    await LocalDB.deleteChecklistFromReview('p1', 'r1', 'cl1');
    const updated = await LocalDB.getProject('p1');
    expect(updated.reviews[0].checklists.length).toBe(0);
  });
});

describe('UUID Generation', () => {
  it('should generate a unique short ID', async () => {
    const id1 = await LocalDB.generateUUID();
    const id2 = await LocalDB.generateUUID();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^[0-9a-f]{8}$/i);
  });
});
