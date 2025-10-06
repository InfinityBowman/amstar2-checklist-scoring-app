# Potential schema for the database

Users table  
Stores user accounts. Email verification code should time out after ~15min, so we store requested_at timestamp. Password reset code should time out after ~15min, so we store requested_at timestamp.

```sql
users (
  id                           UUID PRIMARY KEY,
  name                         TEXT NOT NULL,
  email                        TEXT UNIQUE NOT NULL,
  password_hash                TEXT NOT NULL,
  created_at                   TIMESTAMP DEFAULT now(),
  email_verified_at            TIMESTAMP,         -- when the email was verified
  email_verification_code       TEXT,              -- the current verification code
  email_verification_requested_at TIMESTAMP,        -- when verification was requested
  password_reset_at        TIMESTAMP, -- when password was reset
  password_reset_code         TEXT, -- the current reset code
  password_reset_requested_at     TIMESTAMP,-- when reset was requested
  timezone                     TEXT DEFAULT 'UTC', -- user's last known or sign up timezone
  locale                       TEXT DEFAULT 'en-US'  -- user's last detected locale
)
```

Projects table  
Represents a project owned by a user.

```sql
projects (
  id          UUID PRIMARY KEY,
  owner_id    UUID REFERENCES users(id) ON DELETE CASCADE, -- who owns this project
  name        TEXT NOT NULL, -- name of the project
  -- created_at  TIMESTAMP DEFAULT now(),
  updated_at  TIMESTAMP DEFAULT now()
)
```

Project Members table  
Tracks which users are members of which projects and their roles.

```sql
project_members (
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE, -- user belonging to this project
  role        TEXT CHECK (role IN ('owner','member')) DEFAULT 'member', -- user can be owner or member
  PRIMARY KEY (project_id, user_id)
)
```

Reviews table  
Represents a review within a project. We need this to be able to let multiple reviews have their own checklists for the same review.

```sql
reviews (
  id          UUID PRIMARY KEY,
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE, -- the project this review is part of
  name        TEXT NOT NULL, -- name of the review
  created_at  TIMESTAMP DEFAULT now()
  -- may also store a pdf for this review in s3 storage
)
```

Review Assignments table  
Assigns users to reviews. We need to be able to have users be assigned or assign themselves to a review.

```sql
review_assignments (
  review_id   UUID REFERENCES reviews(id) ON DELETE CASCADE, -- the review
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE, -- the user assigned to that review
  PRIMARY KEY (review_id, user_id)
)
```

Checklists table  
Represents a checklist filled out by a reviewer for a review.

```sql
checklists (
  id           UUID PRIMARY KEY,
  review_id    UUID REFERENCES reviews(id) ON DELETE CASCADE, -- links checklist to a specific review, allows multiple reviews in a project to each have multiple checklists associated with them
  reviewer_id  UUID REFERENCES users(id) ON DELETE CASCADE NULL, -- the user assigned to review this checklist (not required, checklists can be preset without assignments)
  type         TEXT CHECK (role IN ('amstar')) DEFAULT 'amstar', -- support for other formats later
  completed_at TIMESTAMP, -- save when checklist is marked as completed
  updated_at   TIMESTAMP -- save when this checklist was last updated
)
```

Checklist Answers table  
Stores answers for each question in a checklist. Each question is stored separately.

```sql
checklist_answers (
  id            UUID PRIMARY KEY,
  checklist_id  UUID REFERENCES checklists(id) ON DELETE CASCADE,
  question_key  TEXT NOT NULL, -- e.g. 'q1', 'q2', etc.
  answers       JSONB NOT NULL, -- store nested [false,true] arrays
  critical      BOOLEAN NOT NULL DEFAULT FALSE, -- determines the weight of this question when scoring
  updated_at    TIMESTAMP -- save when this specific question was last updated
)
```

A checklist currently has this structure in the frontend:

```json
{
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
      ... 16 total questions
}
```

# Entity Relational Model

### Relationship Summary

- Users → Projects: 1-to-many (owner relationship).
- Projects → Project Members → Users: many-to-many (role tracked).
- Projects → Reviews: 1-to-many.
- Reviews → Review Assignments → Users: many-to-many.
- Reviews → Checklists → Users (reviewer): 1-to-many (each reviewer gets a checklist).
- Checklists → Checklist Answers: 1-to-many (each question stored separately, JSON array for answers).

Cascade chain:  
Delete from projects:  
-Deletes all project_members for that project.  
--Deletes all reviews for that project.  
---Deletes all review_assignments for those reviews.  
---Deletes all checklists for those reviews.  
----Deletes all checklist_answers for those checklists.

---

### Notes

- review_assignments ensures only assigned reviewers can have checklists.
- checklists.type allows future expansion to different checklist formats.
- checklist_answers stores answers as JSON arrays, matching the frontend structure (q1, q2, etc.).

# Data Flow Diagram

[User]<br>
|--(Register/Login)--> (User Authentication) --> [Users]  
|--(Create Project)--> (Project Management) --> [Projects & Project Members]  
|--(Create Review)--> (Review Management) --> [Reviews & Review Assignments]  
|--(Fill Checklist)--> (Checklist Completion) --> [Checklists & Checklist Answers]  
|<--(View Projects/Reviews/Checklists)--|
