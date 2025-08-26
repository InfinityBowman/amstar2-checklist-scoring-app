export function createProject({ id, name, createdAt = Date.now(), checklists = [] } = {}) {
  return {
    id, // string, unique project id
    name, // string, project name/title
    createdAt, // number, timestamp
    checklists, // array of checklist objects or checklist ids
  };
}