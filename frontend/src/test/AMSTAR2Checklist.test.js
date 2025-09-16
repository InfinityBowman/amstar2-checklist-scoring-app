import { describe, it, expect } from 'vitest';
import AMSTAR2Checklist from '../offline/AMSTAR2Checklist';

function makeChecklist(overrides = {}) {
  // Create a valid checklist with all "Yes" answers
  const base = AMSTAR2Checklist.CreateChecklist({
    name: 'Test',
    id: 'test-id',
    reviewerName: 'Reviewer',
    createdAt: Date.now(),
  });
  return { ...base, ...overrides };
}

describe('AMSTAR2Checklist.scoreChecklist', () => {
  it('returns "High" when all answers are Yes', () => {
    const checklist = makeChecklist();
    Object.keys(checklist).forEach((key) => {
      if (checklist[key]?.answers) {
        checklist[key].answers = checklist[key].answers.map((arr) => arr.map(() => true));
      }
    });
    expect(AMSTAR2Checklist.scoreChecklist(checklist)).toBe('High');
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

    expect(AMSTAR2Checklist.scoreChecklist(checklist)).toBe('Moderate');
  });

  it('returns "Low" when one critical answer is not Yes', () => {
    // Set all answers to true
    const checklist = makeChecklist();
    Object.keys(checklist).forEach((key) => {
      if (checklist[key]?.answers) {
        checklist[key].answers = checklist[key].answers.map((arr) => arr.map(() => true));
      }
    });
    // Set one critical answer to all false (e.g., q2)
    checklist.q2.answers = checklist.q2.answers.map((arr) => arr.map(() => false));

    expect(AMSTAR2Checklist.scoreChecklist(checklist)).toBe('Low');
  });

  it('returns "Critically Low" when two critical answers are not Yes', () => {
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

    expect(AMSTAR2Checklist.scoreChecklist(checklist)).toBe('Critically Low');
  });

  it('returns "Error" for invalid input', () => {
    expect(AMSTAR2Checklist.scoreChecklist(null)).toBe('Error');
    expect(AMSTAR2Checklist.scoreChecklist(undefined)).toBe('Error');
    expect(AMSTAR2Checklist.scoreChecklist('not-an-object')).toBe('Error');
  });
});
