import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { randomUUID } from 'crypto';
import { users, projects, projectMembers, reviews, reviewAssignments, checklists, checklistAnswers } from './schema.js';
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function seed() {
  // Create demo users
  const aliceId = randomUUID();
  const bobId = randomUUID();

  await db.insert(users).values([
    {
      id: aliceId,
      name: 'Alice Example',
      email: 'alice@example.com',
      passwordHash: 'hashedpassword1',
      locale: 'en-US',
      timezone: 'UTC',
    },
    {
      id: bobId,
      name: 'Bob Reviewer',
      email: 'bob@example.com',
      passwordHash: 'hashedpassword2',
      locale: 'en-US',
      timezone: 'UTC',
    },
  ]);

  // Create a project
  const projectId = randomUUID();
  await db.insert(projects).values([
    {
      id: projectId,
      ownerId: aliceId,
      name: 'AMSTAR2 Demo Project',
    },
  ]);

  // Add project members
  await db.insert(projectMembers).values([
    { projectId, userId: aliceId, role: 'owner' },
    { projectId, userId: bobId, role: 'member' },
  ]);

  // Create a review
  const reviewId = randomUUID();
  await db.insert(reviews).values([
    {
      id: reviewId,
      projectId,
      name: 'Review 1',
    },
  ]);

  // Assign Bob to the review
  await db.insert(reviewAssignments).values([{ reviewId, userId: bobId }]);

  // Create a checklist for Bob
  const checklistId = randomUUID();
  await db.insert(checklists).values([
    {
      id: checklistId,
      reviewId,
      reviewerId: bobId,
      type: 'amstar',
    },
  ]);

  // Add answers to the checklist
  await db.insert(checklistAnswers).values([
    {
      id: randomUUID(),
      checklistId,
      questionKey: 'Q1',
      answers: { value: 'Yes', notes: 'Meets criteria.' },
      critical: true,
    },
    {
      id: randomUUID(),
      checklistId,
      questionKey: 'Q2',
      answers: { value: 'No', notes: 'Missing details.' },
      critical: false,
    },
  ]);

  console.log('Seed data inserted!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
