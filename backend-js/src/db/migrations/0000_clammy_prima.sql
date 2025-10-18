CREATE TABLE "checklist_answers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"checklist_id" uuid NOT NULL,
	"question_key" text NOT NULL,
	"answers" jsonb NOT NULL,
	"critical" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "checklists" (
	"id" uuid PRIMARY KEY NOT NULL,
	"review_id" uuid NOT NULL,
	"reviewer_id" uuid,
	"type" text DEFAULT 'amstar' NOT NULL,
	"completed_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "review_assignments" (
	"review_id" uuid NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"email_verified_at" timestamp,
	"email_verification_code" text,
	"email_verification_requested_at" timestamp,
	"password_reset_at" timestamp,
	"password_reset_code" text,
	"password_reset_requested_at" timestamp,
	"timezone" text DEFAULT 'UTC',
	"locale" text DEFAULT 'en-US',
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
