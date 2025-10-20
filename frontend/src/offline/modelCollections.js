import { solidStore } from './solidStore.js';
import * as projectAPI from '@api/projectService';
import * as reviewAPI from '@api/reviewService';
import * as checklistAPI from '@api/checklistService';

export class Project {
  constructor(data) {
    if (!data.id) data.id = crypto.randomUUID();
    Object.assign(this, data);
  }
  reviews() {
    return solidStore.getReviewsForProject(this.id).map((r) => new Review(r));
  }
  members() {
    return solidStore.getProjectMembers(this.id);
  }
  async save() {
    await solidStore.saveProject(this);
    let result = await projectAPI.createProject(this.name);
    console.log(result)
    this.id = result.id;
  }

  async delete() {
    await solidStore.deleteProject(this.id);
    projectAPI.deleteProject(this.id);
  }
  async addMember(userId, role = 'member') {
    await solidStore.addProjectMember(this.id, userId, role);
    projectAPI.addUserToProject(this.id, userId);
  }
  async removeMember(userId) {
    await solidStore.deleteProjectMember(this.id, userId);
    projectAPI.removeUserFromProject(this.id, userId);
  }
  async addReview(review) {
    review.project_id = this.id;
    await solidStore.addReview(review);
  }
}

export class Review {
  constructor(data) {
    if (!data.id) data.id = crypto.randomUUID();
    Object.assign(this, data);
  }
  checklists() {
    return solidStore.getChecklistsForReview(this.id).map((c) => new Checklist(c));
  }
  async delete() {
    await solidStore.deleteReview(this.id);
  }
  async addChecklist(checklist) {
    checklist.review_id = this.id;
    await solidStore.addChecklist(checklist);
  }
}

export class Checklist {
  constructor(data) {
    if (!data.id) data.id = crypto.randomUUID();
    Object.assign(this, data);
  }
  answers() {
    return solidStore.getAnswersForChecklist(this.id);
  }
  async save() {
    await solidStore.addChecklist(this);
  }
  async addAnswer(answer) {
    answer.checklist_id = this.id;
    await solidStore.addChecklistAnswer(answer);
  }
  async removeAnswer(answerId) {
    await solidStore.deleteChecklistAnswer(answerId);
  }
}

// Collections
export function getProjectCollection() {
  return () => solidStore.projects().map((p) => new Project(p));
}

export function getReviewCollection() {
  return () => solidStore.reviews().map((r) => new Review(r));
}

export function getChecklistCollection() {
  return () => solidStore.checklists().map((c) => new Checklist(c));
}

// Usage example:
// import { getProjectCollection } from './modelCollections.js';
// const projects = getProjectCollection();
// const reviews = projects()[0].reviews();
// const checklists = reviews()[0].checklists();
// const answers = checklists()[0].answers();
