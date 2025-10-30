import { createSignal } from 'solid-js';
import { solidStore } from '@offline/solidStore.js';

const [projects, setProjects] = createSignal([]);

export class ProjectCollection {
  constructor(data) {}
}
