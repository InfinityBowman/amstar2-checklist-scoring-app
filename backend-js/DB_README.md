# Drizzle ORM with Elysia.js Guide

This guide explains how to use Drizzle ORM with Elysia.js for the AMSTAR2 Checklist Scoring App.

## Overview

The project uses:

- **Drizzle ORM**: Modern TypeScript ORM
- **PostgreSQL**: Database
- **Elysia.js**: Fast HTTP framework for Bun
- **Drizzle-Kit**: Migration and schema management tool

## Database Schema Structure

The schema is defined in `/src/db/schema/` with the following files:

- `user.js`: User account schema
- `project.js`: Projects owned by users
- `review.js`: Reviews within projects
- `checklist.js`: Checklists for reviews
- `checklistAnswer.js`: Answers for checklist questions
- `index.js`: Exports all schemas

## Avoiding Deprecated Features

The project follows the modern Drizzle approach for defining tables and indexes:

1. **Table definitions** are created using `pgTable` without the third callback argument
2. **Indexes** are defined separately after the table definition:

```javascript
// Modern approach (avoiding deprecation warnings)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  // other fields...
});

// Define indexes separately
export const usersEmailIndex = pgTable('users_email_idx', {}).index('ix_users_email', { columns: [users.email] });
```

## Available Scripts

- `bun run dev`: Start development server with auto-reload
- `bun run db:generate`: Generate migration files using drizzle-kit
- `bun run db:migrate`: Apply migrations to the database
- `bun run db:push`: Push schema changes directly to DB (dev only)
- `bun run db:studio`: Launch Drizzle Studio for visual DB management
- `bun run db:drop`: Delete all tables/data (use with caution)

## Development Workflow

1. **Make schema changes**: Edit files in `src/db/schema/`
2. **Generate migrations**: `bun run db:generate`
3. **Apply migrations**: `bun run db:migrate`
4. **Develop API**: Create routes in `src/routes/api/`

## Type Safety

Drizzle generates type-safe query builders and models automatically. Use the `relations` API to define relationships between tables:

```javascript
export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  reviews: many('reviews'),
}));
```

## Best Practices

1. **Always generate migrations** for schema changes
2. **Use parameter binding** instead of string interpolation for SQL
3. **Leverage Zod schemas** created by `createInsertSchema` and `createSelectSchema`
4. **Organize related models** in separate files
5. **Use transactions** for multi-step operations
