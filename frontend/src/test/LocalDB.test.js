import { describe, it, expect, beforeEach } from 'vitest';
import * as LocalDB from '../offline/LocalDB';

// Helper to clear DB before each test
beforeEach(async () => {
  await LocalDB.deleteAllChecklists();
  const projects = await LocalDB.getAllProjects();
  await Promise.all(projects.map((p) => LocalDB.deleteProject(p.id)));
});

describe('LocalDB Checklist Store', () => {
  it('should save and get a checklist', async () => {
    const checklist = { id: 'cl1', name: 'Test Checklist', items: [] };
    await LocalDB.saveChecklist(checklist);
    const result = await LocalDB.getChecklist('cl1');
    expect(result).toEqual(checklist);
  });

  it('should get all checklists', async () => {
    const checklist1 = { id: 'cl1', name: 'Checklist 1', items: [] };
    const checklist2 = { id: 'cl2', name: 'Checklist 2', items: [] };
    await LocalDB.saveChecklist(checklist1);
    await LocalDB.saveChecklist(checklist2);
    const all = await LocalDB.getAllChecklists();
    expect(all.length).toBe(2);
    expect(all).toEqual(expect.arrayContaining([checklist1, checklist2]));
  });

  it('should delete a checklist', async () => {
    const checklist = { id: 'cl1', name: 'Checklist', items: [] };
    await LocalDB.saveChecklist(checklist);
    await LocalDB.deleteChecklist('cl1');
    const result = await LocalDB.getChecklist('cl1');
    expect(result).toBeUndefined();
  });

  it('should delete all checklists', async () => {
    await LocalDB.saveChecklist({ id: 'cl1', name: 'A', items: [] });
    await LocalDB.saveChecklist({ id: 'cl2', name: 'B', items: [] });
    await LocalDB.deleteAllChecklists();
    const all = await LocalDB.getAllChecklists();
    expect(all.length).toBe(0);
  });
});

describe('LocalDB Project Store', () => {
  it('should save and get a project', async () => {
    const project = { id: 'p1', name: 'Project 1', checklists: [] };
    await LocalDB.saveProject(project);
    const result = await LocalDB.getProject('p1');
    expect(result).toEqual(project);
  });

  it('should get all projects', async () => {
    const project1 = { id: 'p1', name: 'Project 1', checklists: [] };
    const project2 = { id: 'p2', name: 'Project 2', checklists: [] };
    await LocalDB.saveProject(project1);
    await LocalDB.saveProject(project2);
    const all = await LocalDB.getAllProjects();
    expect(all.length).toBe(2);
    expect(all).toEqual(expect.arrayContaining([project1, project2]));
  });

  it('should delete a project', async () => {
    const project = { id: 'p1', name: 'Project', checklists: [] };
    await LocalDB.saveProject(project);
    await LocalDB.deleteProject('p1');
    const result = await LocalDB.getProject('p1');
    expect(result).toBeUndefined();
  });
});

describe('Checklist-Project Relations', () => {
  it('should save a checklist to a project', async () => {
    const project = { id: 'p1', name: 'Project', checklists: [] };
    const checklist = { id: 'cl1', name: 'Checklist', items: [] };
    await LocalDB.saveProject(project);
    const updated = await LocalDB.saveChecklistToProject('p1', checklist);
    expect(updated.checklists.length).toBe(1);
    expect(updated.checklists[0]).toEqual(checklist);
  });

  it('should delete a checklist from a project', async () => {
    const project = { id: 'p1', name: 'Project', checklists: [{ id: 'cl1', name: 'Checklist', items: [] }] };
    await LocalDB.saveProject(project);
    await LocalDB.deleteChecklistFromProject('p1', 'cl1');
    const updated = await LocalDB.getProject('p1');
    expect(updated.checklists.length).toBe(0);
  });
});

describe('UUID Generation', () => {
  it('should generate a valid UUID', () => {
    const uuid = LocalDB.generateUUID();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});
