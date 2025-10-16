-- This script will run only once when the PostgreSQL container is first created
-- It initializes the database with demo data for development

-- Demo Users
INSERT INTO users (id, name, email, hashed_password, created_at, email_verified_at, timezone, locale)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Demo Admin', 'admin@example.com', '$2b$12$QE4YjeceRg.ctIXetOFkpekPTahVF1LvB3ltsxUea0iY4ZjCNL8rW', NOW(), NOW(), 'UTC', 'en-US'),
  ('22222222-2222-2222-2222-222222222222', 'Demo User', 'user@example.com', '$2b$12$QE4YjeceRg.ctIXetOFkpekPTahVF1LvB3ltsxUea0iY4ZjCNL8rW', NOW(), NOW(), 'UTC', 'en-US'),
  ('33333333-3333-3333-3333-333333333333', 'Test Reviewer', 'reviewer@example.com', '$2b$12$QE4YjeceRg.ctIXetOFkpekPTahVF1LvB3ltsxUea0iY4ZjCNL8rW', NOW(), NOW(), 'UTC', 'en-US');
-- Note: All passwords are set to 'Test111!'

-- Demo Projects
INSERT INTO projects (id, owner_id, name, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Systematic Review of Machine Learning in Healthcare', NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Meta-Analysis of COVID-19 Treatments', NOW());

-- Demo Project Members
INSERT INTO project_members (project_id, user_id, role)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'owner'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'member'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'member'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'owner'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'member');

-- Demo Reviews
INSERT INTO reviews (id, project_id, name, created_at)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ML for Cancer Detection', NOW()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'AI in Radiology', NOW()),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Remdesivir Efficacy', NOW());

-- Demo Review Assignments
INSERT INTO review_assignments (review_id, user_id)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222');

-- Demo Checklists
INSERT INTO checklists (id, review_id, reviewer_id, type, completed_at, updated_at)
VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'amstar', NOW(), NOW()),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'amstar', NULL, NOW()),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'amstar', NOW(), NOW()),
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'amstar', NULL, NOW());

-- Demo Checklist Answers
INSERT INTO checklist_answers (id, checklist_id, question_key, answers, critical, updated_at)
VALUES
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'q1', '[[true, false, false, false], [true], [false, true]]'::jsonb, true, NOW()),
  ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'q2', '[[false, true, false, false], [false, false, true], [false, false, true]]'::jsonb, true, NOW()),
  ('llllllll-llll-llll-llll-llllllllllll', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'q1', '[[false, true, false, false], [false], [true, false]]'::jsonb, true, NOW()),
  ('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'q2', '[[true, false, false, false], [false, true, false], [false, false, true]]'::jsonb, true, NOW());

-- Keep the scores table for backward compatibility
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  value FLOAT
);

INSERT INTO scores (name, value) VALUES
  ('Alice', 3.14),
  ('Bob', 2.71),
  ('Charlie', -1.618),
  ('David', 1.414),
  ('Eve', 0);