import { pgTable, uuid, text, timestamp, boolean, jsonb, primaryKey } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  emailVerifiedAt: timestamp('email_verified_at', { mode: 'date' }),
  emailVerificationCode: text('email_verification_code'),
  emailVerificationRequestedAt: timestamp('email_verification_requested_at', { mode: 'date' }),
  passwordResetAt: timestamp('password_reset_at', { mode: 'date' }),
  passwordResetCode: text('password_reset_code'),
  passwordResetRequestedAt: timestamp('password_reset_requested_at', { mode: 'date' }),
  timezone: text('timezone').default('UTC'),
  locale: text('locale').default('en-US'),
});

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey(),
  ownerId: uuid('owner_id').notNull(),
  name: text('name').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

// Project Members table
export const projectMembers = pgTable(
  'project_members',
  {
    projectId: uuid('project_id').notNull(),
    userId: uuid('user_id').notNull(),
    role: text('role').notNull().default('member'), // 'owner' or 'member'
  },
  (table) => [{ pk: primaryKey({ columns: [table.projectId, table.userId] }) }],
);

// Reviews table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey(),
  projectId: uuid('project_id').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Review Assignments table
export const reviewAssignments = pgTable(
  'review_assignments',
  {
    reviewId: uuid('review_id').notNull(),
    userId: uuid('user_id').notNull(),
  },
  (table) => [{ pk: primaryKey({ columns: [table.reviewId, table.userId] }) }],
);

// Checklists table
export const checklists = pgTable('checklists', {
  id: uuid('id').primaryKey(),
  reviewId: uuid('review_id').notNull(),
  reviewerId: uuid('reviewer_id'),
  type: text('type').notNull().default('amstar'),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  updatedAt: timestamp('updated_at', { mode: 'date' }),
});

// Checklist Answers table
export const checklistAnswers = pgTable('checklist_answers', {
  id: uuid('id').primaryKey(),
  checklistId: uuid('checklist_id').notNull(),
  questionKey: text('question_key').notNull(),
  answers: jsonb('answers').notNull(),
  critical: boolean('critical').notNull().default(false),
  updatedAt: timestamp('updated_at', { mode: 'date' }),
});
