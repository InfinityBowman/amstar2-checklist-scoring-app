export default class ChecklistState {
  constructor(initialState = null) {
    this.state = initialState || this.getDefaultState();
  }

  getDefaultState() {
    return {
      q1: [[false, false, false, false], [false], [false, true]],
      q2: [
        [false, false, false, false],
        [false, false, false],
        [false, , true],
      ],
      q3: [
        [false, false, false],
        [false, true],
      ],
      q4: [
        [false, false, false],
        [false, false, false, false, false],
        [false, false, true],
      ],
      q5: [
        [false, false],
        [false, true],
      ],
      q6: [
        [false, false],
        [false, true],
      ],
      q7: [[false], [false], [false, false, true]],
      q8: [
        [false, false, false, false, false],
        [false, false, false, false],
        [false, false, true],
      ],
      q9a: [
        [false, false],
        [false, false],
        [false, false, true, false],
      ],
      q9b: [
        [false, false],
        [false, false],
        [false, false, true, false],
      ],
      q10: [[false], [false, true]],
      q11a: [
        [false, false, false],
        [false, true, false],
      ],
      q11b: [
        [false, false, false, false],
        [false, true, false],
      ],
      q12: [
        [false, false],
        [false, true, false],
      ],
      q13: [
        [false, false],
        [false, true],
      ],
      q14: [
        [false, false],
        [false, true],
      ],
      q15: [[false], [false, true, false]],
      q16: [
        [false, false],
        [false, true],
      ],
    };
  }

  updateAnswer(question, column, answer, value) {
    if (this.state[question] && this.state[question][column]) {
      this.state[question][column][answer] = value;
    }
  }

  // Export state as JSON
  exportState() {
    return JSON.stringify(this.state, null, 2);
  }

  // Import state from JSON
  importState(jsonString) {
    try {
      this.state = JSON.parse(jsonString);
      return true;
    } catch (error) {
      console.error('Invalid JSON format:', error);
      return false;
    }
  }

  // Export for human-readable CSV: one row per question, answers as "1"/"0" (checked/unchecked), columns labeled A1, A2, ...
  exportFlat() {
    const flat = {};
    // Include title if present
    if (this.state.title) {
      flat.title = this.state.title;
    }
    Object.entries(this.state).forEach(([question, cols]) => {
      // Only process keys that are questions (q1, q2, ..., q9a, q9b, etc.)
      if (/^q\d+[a-z]*$/i.test(question) && Array.isArray(cols)) {
        const flatAnswers = cols.flat().map((val) => (val ? '1' : '0'));
        flat[question] = flatAnswers;
      }
    });
    return flat;
  }

  // Import from what we exported
  importFlat(flatObj) {
    const newState = this.getDefaultState();

    Object.entries(flatObj).forEach(([question, answers]) => {
      if (!newState[question]) return;
      const structure = newState[question];
      const lengths = structure.map((col) => col.length);
      let idx = 0;
      for (let col = 0; col < structure.length; col++) {
        for (let ans = 0; ans < lengths[col]; ans++) {
          structure[col][ans] = answers[idx] === '1';
          idx++;
        }
      }
    });

    this.state = newState;
  }

  // Score checklist using the last column of each question (Yes/Partial Yes/No)
  scoreChecklist() {
    // Critical items by question key (adjust as needed for your checklist)
    const criticalItems = ['q2', 'q4', 'q7', 'q9a', 'q9b', 'q11a', 'q11b', 'q13', 'q15'];
    let criticalFlaws = 0;
    let nonCriticalFlaws = 0;

    // Helper to get the selected answer from the last column of a question
    const getSelected = (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) return null;
      const lastCol = arr[arr.length - 1];
      if (!Array.isArray(lastCol)) return null;
      const idx = lastCol.findIndex((v) => v === true);
      if (idx === -1) return null;
      // Map index to label as needed; here: 0=Yes, 1=Partial Yes, 2=No, etc.
      if (lastCol.length === 2) return idx === 0 ? 'Yes' : 'No';
      if (lastCol.length === 3) return ['Yes', 'Partial Yes', 'No'][idx] || null;
      if (lastCol.length === 4) return ['Yes', 'Partial Yes', 'No', 'Other'][idx] || null;
      return null;
    };

    Object.entries(this.state).forEach(([question, arr]) => {
      if (!/^q\d+[a-z]*$/i.test(question)) return;
      const selected = getSelected(arr);
      if (!selected) return;
      if (selected !== 'Yes') {
        if (criticalItems.includes(question)) {
          criticalFlaws++;
        } else {
          nonCriticalFlaws++;
        }
      }
    });

    if (criticalFlaws > 1) return 'Critically Low';
    if (criticalFlaws === 1) return 'Low';
    if (nonCriticalFlaws > 1) return 'Moderate';
    return 'High';
  }
}
