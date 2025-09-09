import { AMSTAR_CHECKLIST } from './offline/ChecklistMap.js';

export default class AMSTAR2Checklist {
  constructor(initialState = null, { title = null, id = null, createdAt = Date.now(), reviewerName = '' } = {}) {}

  // New method to programmatically create a checklist
  static CreateChecklist({ name = null, id = null, createdAt = Date.now(), reviewerName = '' } = {}) {
    if (!id || typeof id !== 'string' || !id.trim()) {
      throw new Error('AMSTAR2Checklist requires a non-empty string id.');
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new Error('AMSTAR2Checklist requires a non-empty string name.');
    }

    return {
      name: name,
      reviewerName: reviewerName || '',
      createdAt: createdAt,
      id: id,
      q1: { answers: [[false, false, false, false], [false], [false, true]], critical: false },
      q2: {
        answers: [
          [false, false, false, false],
          [false, false, false],
          [false, false, true],
        ],
        critical: true,
      },
      q3: {
        answers: [
          [false, false, false],
          [false, true],
        ],
        critical: false,
      },
      q4: {
        answers: [
          [false, false, false],
          [false, false, false, false, false],
          [false, false, true],
        ],
        critical: true,
      },
      q5: {
        answers: [
          [false, false],
          [false, true],
        ],
        critical: false,
      },
      q6: {
        answers: [
          [false, false],
          [false, true],
        ],
        critical: false,
      },
      q7: { answers: [[false], [false], [false, false, true]], critical: true },
      q8: {
        answers: [
          [false, false, false, false, false],
          [false, false, false, false],
          [false, false, true],
        ],
        critical: false,
      },
      q9a: {
        answers: [
          [false, false],
          [false, false],
          [false, false, true, false],
        ],
        critical: true,
      },
      q9b: {
        answers: [
          [false, false],
          [false, false],
          [false, false, true, false],
        ],
        critical: true,
      },
      q10: { answers: [[false], [false, true]], critical: false },
      q11a: {
        answers: [
          [false, false, false],
          [false, true, false],
        ],
        critical: true,
      },
      q11b: {
        answers: [
          [false, false, false, false],
          [false, true, false],
        ],
        critical: true,
      },
      q12: {
        answers: [
          [false, false],
          [false, true, false],
        ],
        critical: false,
      },
      q13: {
        answers: [
          [false, false],
          [false, true],
        ],
        critical: true,
      },
      q14: {
        answers: [
          [false, false],
          [false, true],
        ],
        critical: false,
      },
      q15: { answers: [[false], [false, true, false]], critical: true },
      q16: {
        answers: [
          [false, false],
          [false, true],
        ],
        critical: false,
      },
    };
  }

  // Score checklist using the last column of each question (Yes/Partial Yes/No/No MA)
  static scoreChecklist(state) {
    if (!state || typeof state !== 'object') return 'Error';

    let criticalFlaws = 0;
    let nonCriticalFlaws = 0;

    // Helper to get the selected answer from the last column of a question
    const getSelected = (answers) => {
      if (!Array.isArray(answers) || answers.length === 0) return null;
      const lastCol = answers[answers.length - 1];
      if (!Array.isArray(lastCol)) return null;
      const idx = lastCol.findIndex((v) => v === true);
      if (idx === -1) return null;
      if (lastCol.length === 2) return idx === 0 ? 'Yes' : 'No';
      if (lastCol.length === 3) return ['Yes', 'Partial Yes', 'No'][idx] || null;
      if (lastCol.length === 4) return ['Yes', 'Partial Yes', 'No', 'No MA'][idx] || null;
      return null;
    };

    Object.entries(state).forEach(([question, obj]) => {
      if (!/^q\d+[a-z]*$/i.test(question)) return;
      if (!obj || !Array.isArray(obj.answers)) return;
      const selected = getSelected(obj.answers);
      if (!selected) return;
      if (selected !== 'Yes') {
        if (obj.critical) {
          criticalFlaws++;
        } else {
          nonCriticalFlaws++;
        }
      }
    });
    console.log(`Scoring checklist ${state.name || state.id}: ${criticalFlaws} critical flaws, ${nonCriticalFlaws} non-critical flaws`);

    if (criticalFlaws > 1) return 'Critically Low';
    if (criticalFlaws === 1) return 'Low';
    if (nonCriticalFlaws > 1) return 'Moderate';
    return 'High';
  }

  static getAnswers(checklist) {
    if (!checklist || typeof checklist !== 'object') return null;
    const result = {};

    // Questions with custom answer pattern
    const customPatternQuestions = ['q11a', 'q11b', 'q12', 'q13'];

    // Default labels
    const defaultLabels = ['Yes', 'Partial Yes', 'No', 'No MA'];
    const customLabels = ['Yes', 'No', 'No MA'];

    Object.entries(checklist).forEach(([key, value]) => {
      if (!/^q\d+[a-z]*$/i.test(key)) return;
      if (!value || !Array.isArray(value.answers)) return;

      const lastCol = value.answers[value.answers.length - 1];
      if (!Array.isArray(lastCol)) return;

      let labels;
      if (lastCol.length === 2) {
        labels = ['Yes', 'No'];
      } else if (customPatternQuestions.includes(key)) {
        labels = customLabels;
      } else {
        labels = defaultLabels;
      }

      // Find selected answer
      const idx = lastCol.findIndex((v) => v === true);
      result[key] = labels[idx] || null;
    });

    return result;
  }

  /**
   * Export a checklist (or array of checklists) to CSV using the checklist map for headers.
   * @param {Array|Object} checklists - One or more checklist objects.
   * @returns {string} CSV string.
   */
  static exportChecklistsToCSV(checklists) {
    // Normalize to array
    const list = Array.isArray(checklists) ? checklists : [checklists];

    // Get question keys in order from the map
    const questionKeys = Object.keys(AMSTAR_CHECKLIST);

    // Build headers: Project/Checklist info + question text
    const infoHeaders = ['Checklist Name', 'Reviewer', 'Created At', 'Checklist ID'];
    const questionHeaders = questionKeys.map((q) => AMSTAR_CHECKLIST[q]?.text?.replace(/\s+/g, ' ').trim() || q);
    const headers = [...infoHeaders, ...questionHeaders];

    // Build rows
    const rows = list.map((cl) => {
      const answers = AMSTAR2Checklist.getAnswers(cl);
      return [
        cl.name || '',
        cl.reviewerName || '',
        cl.createdAt ? new Date(cl.createdAt).toISOString() : '',
        cl.id || '',
        ...questionKeys.map((q) => answers[q] || ''),
      ];
    });

    // CSV encode
    const escape = (val) => `"${String(val).replace(/"/g, '""').replace(/\n/g, ' ')}"`;

    const csv = headers.map(escape).join(',') + '\n' + rows.map((row) => row.map(escape).join(',')).join('\n');

    return csv;
  }
}
