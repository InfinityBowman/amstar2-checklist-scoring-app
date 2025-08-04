export default class ChecklistState {
  constructor(initialState = null) {
    this.state = initialState || this.getDefaultState();
  }

  getDefaultState() {
    return {
      q1: [[false, false, false, false], [false], [false, false]],
      q2: [[false, false, false, false], [false], [false, false]],
      q3: [
        [false, false, false],
        [false, false],
      ],
      q4: [
        [false, false, false],
        [false, false, false, false, false],
        [false, false, false],
      ],
      q5: [
        [false, false],
        [false, false],
      ],
      q6: [
        [false, false],
        [false, false],
      ],
      q7: [[false], [false], [false, false, false]],
      q8: [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false],
      ],
      q9a: [
        [false, false],
        [false, false],
        [false, false, false, false],
      ],
      q9b: [
        [false, false],
        [false, false],
        [false, false, false, false],
      ],
      q10: [[false], [false, false]],
      q11a: [
        [false, false, false],
        [false, false, false],
      ],
      q11b: [
        [false, false, false, false],
        [false, false, false],
      ],
      q12: [
        [false, false],
        [false, false, false],
      ],
      q13: [
        [false, false],
        [false, false],
      ],
      q14: [
        [false, false],
        [false, false],
      ],
      q15: [[false], [false, false, false]],
      q16: [
        [false, false],
        [false, false],
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

  // Export for CSV
  exportFlat() {
    const flat = {};
    Object.entries(this.state).forEach(([question, cols]) => {
      Object.entries(cols).forEach(([column, answers]) => {
        Object.entries(answers).forEach(([answer, value]) => {
          flat[`${question}_${column}_${answer}`] = value;
        });
      });
    });
    return flat;
  }

  // Import  for CSV
  importFlat(flatObj) {
    const newState = this.getDefaultState();

    Object.entries(flatObj).forEach(([key, value]) => {
      const [question, column, answer] = key.split('_');
      if (newState[question] && newState[question][column]) {
        newState[question][column][answer] = value;
      }
    });

    this.state = newState;
  }
}
