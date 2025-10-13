import { describe, it, expect } from 'vitest';
import { createChecklist, scoreChecklist } from '../offline/AMSTAR2Checklist';

function makeChecklist() {
  // Create a valid default checklist with all "No" answers
  return createChecklist({
    name: 'Test',
    id: 'test-id',
    reviewerName: 'Reviewer',
    createdAt: Date.now(),
  });
}

describe('scoreChecklist', () => {
  it('returns "Critically Low" by default', () => {
    const checklist = makeChecklist();
    expect(scoreChecklist(checklist)).toBe('Critically Low');
  });

  it('returns "High" when all answers are Yes', () => {
    const checklist = makeChecklist();
    Object.keys(checklist).forEach((key) => {
      if (checklist[key]?.answers) {
        checklist[key].answers = checklist[key].answers.map((arr) => arr.map(() => true));
      }
    });
    expect(scoreChecklist(checklist)).toBe('High');
  });

  it('returns "High" when one non-critical answer (q1) is No', () => {
    const checklist = makeChecklist();
    Object.keys(checklist).forEach((key) => {
      if (checklist[key]?.answers) {
        checklist[key].answers = checklist[key].answers.map((arr) => arr.map(() => true));
      }
    });

    checklist.q1.answers = checklist.q1.answers.map((arr) => arr.map(() => false));
    expect(scoreChecklist(checklist)).toBe('High');
  });

  it('returns "High" when one non-critical answer (q5) is No', () => {
    const checklist = makeChecklist();
    Object.keys(checklist).forEach((key) => {
      if (checklist[key]?.answers) {
        checklist[key].answers = checklist[key].answers.map((arr) => arr.map(() => true));
      }
    });

    checklist.q5.answers = checklist.q5.answers.map((arr) => arr.map(() => false));
    expect(scoreChecklist(checklist)).toBe('High');
  });

  it('returns "High" when one non-critical answer (q6) is No', () => {
    const checklist = makeChecklist();
    Object.keys(checklist).forEach((key) => {
      if (checklist[key]?.answers) {
        checklist[key].answers = checklist[key].answers.map((arr) => arr.map(() => true));
      }
    });

    checklist.q6.answers = checklist.q6.answers.map((arr) => arr.map(() => false));
    expect(scoreChecklist(checklist)).toBe('High');
  });

  it('returns "High" when one non-critical answer (q3) is No', () => {
    const checklist = makeChecklist();
    Object.keys(checklist).forEach((key) => {
      if (checklist[key]?.answers) {
        checklist[key].answers = checklist[key].answers.map((arr) => arr.map(() => true));
      }
    });

    checklist.q3.answers = checklist.q3.answers.map((arr) => arr.map(() => false));
    expect(scoreChecklist(checklist)).toBe('High');
  });

  it('returns "Moderate" when two non-critical answers are not Yes', () => {
    const checklist = makeChecklist();
    // Set all answers to true
    Object.keys(checklist).forEach((key) => {
      if (checklist[key]?.answers) {
        checklist[key].answers = checklist[key].answers.map((arr) => arr.map(() => true));
      }
    });
    // Set two non-critical answers to all false (e.g., q1 and q5)
    checklist.q1.answers = checklist.q1.answers.map((arr) => arr.map(() => false));
    checklist.q5.answers = checklist.q5.answers.map((arr) => arr.map(() => false));

    expect(scoreChecklist(checklist)).toBe('Moderate');
  });

  it('returns "Moderate" when two non-critical answers are No', () => {
    const checklist = makeChecklist();
    // Set all answers to true
    Object.keys(checklist).forEach((key) => {
      if (checklist[key]?.answers) {
        checklist[key].answers = checklist[key].answers.map((arr) => arr.map(() => true));
      }
    });
    // Set two non-critical answers to all false (e.g., q1 and q5)
    checklist.q14.answers = checklist.q14.answers.map((arr) => arr.map(() => false));
    checklist.q16.answers = checklist.q16.answers.map((arr) => arr.map(() => false));

    expect(scoreChecklist(checklist)).toBe('Moderate');
  });

  it('returns "Low" when one critical answer (q2) is No', () => {
    // Set all answers to true
    const checklist = makeChecklist();
    Object.keys(checklist).forEach((key) => {
      if (checklist[key]?.answers) {
        checklist[key].answers = checklist[key].answers.map((arr) => arr.map(() => true));
      }
    });
    // Set one critical answer to all false (e.g., q2)
    checklist.q2.answers = checklist.q2.answers.map((arr) => arr.map(() => false));

    expect(scoreChecklist(checklist)).toBe('Low');
  });

  it('returns "Low" when one critical answer (q15) is No', () => {
    const checklist = makeChecklist();
    // Set all answers to true
    Object.keys(checklist).forEach((key) => {
      if (checklist[key]?.answers) {
        checklist[key].answers = checklist[key].answers.map((arr) => arr.map(() => true));
      }
    });
    // Set two non-critical answers to all false (e.g., q1 and q5)
    checklist.q15.answers = checklist.q15.answers.map((arr) => arr.map(() => false));

    expect(scoreChecklist(checklist)).toBe('Low');
  });

  it('returns "Critically Low" when two critical answers are No', () => {
    // Set all answers to true
    const checklist = makeChecklist();
    Object.keys(checklist).forEach((key) => {
      if (checklist[key]?.answers) {
        checklist[key].answers = checklist[key].answers.map((arr) => arr.map(() => true));
      }
    });
    // Set two critical answers to all false (e.g., q2 and q4)
    checklist.q2.answers = checklist.q2.answers.map((arr) => arr.map(() => false));
    checklist.q4.answers = checklist.q4.answers.map((arr) => arr.map(() => false));

    expect(scoreChecklist(checklist)).toBe('Critically Low');
  });

  it('treats "Partial Yes" as Yes: q2, q4, q7, q8, q9a, q9b', () => {
    const checklist = makeChecklist();
    Object.keys(checklist).forEach((key) => {
      if (checklist[key]?.answers) {
        // Set "Partial Yes" (index 1) for specified questions
        if (['q2', 'q4', 'q7', 'q8', 'q9a', 'q9b'].includes(key)) {
          checklist[key].answers[checklist[key].answers.length - 1] = [false, true, false, false];
        } else {
          // All other questions set to "Yes"
          checklist[key].answers = checklist[key].answers.map((arr) => arr.map(() => true));
        }
      }
    });
    expect(scoreChecklist(checklist)).toBe('High');
  });

  it('does not count "No MA" as a flaw: q9a, q9b, q11a, q11b, q12, q15', () => {
    const checklist = makeChecklist();
    Object.keys(checklist).forEach((key) => {
      if (checklist[key]?.answers) {
        // Set "No MA" for q9a and q9b at index 3
        if (key === 'q9a' || key === 'q9b') {
          checklist[key].answers[checklist[key].answers.length - 1] = [false, false, false, true];
        }
        // Set "No MA" for q11a, q11b, q12, q15 at index 2
        if (['q11a', 'q11b', 'q12', 'q15'].includes(key)) {
          checklist[key].answers[checklist[key].answers.length - 1] = [false, false, true, false];
        }
        // All other questions set to "Yes"
        if (!['q11a', 'q11b', 'q12', 'q15'].includes(key)) {
          checklist[key].answers = checklist[key].answers.map((arr) => arr.map(() => true));
        }
      }
    });
    expect(scoreChecklist(checklist)).toBe('High');
  });

  it('returns "Error" for invalid input', () => {
    expect(scoreChecklist(null)).toBe('Error');
    expect(scoreChecklist(undefined)).toBe('Error');
    expect(scoreChecklist('not-an-object')).toBe('Error');
  });
});
