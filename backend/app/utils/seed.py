"""
Database seeding utility.
This script seeds the database with initial data for development.
It should be run after all migrations have been applied.
"""
import asyncio
import logging
import os
import re
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session

logger = logging.getLogger(__name__)

def split_sql_statements(sql_content):
    """
    Split SQL content into separate statements that can be executed individually.
    This handles statements separated by semicolons, but preserves semicolons within
    statements (like those in JSON literals or function definitions).
    """
    statements = []
    current_statement = []
    lines = sql_content.split('\n')
    
    for line in lines:
        # Skip comments and empty lines when determining statement boundaries
        stripped_line = line.strip()
        if not stripped_line or stripped_line.startswith('--'):
            current_statement.append(line)
            continue
            
        # Check if the line ends with a semicolon (statement terminator)
        if stripped_line.endswith(';'):
            current_statement.append(line)
            statements.append('\n'.join(current_statement))
            current_statement = []
        else:
            current_statement.append(line)
    
    # Add any remaining statement
    if current_statement:
        statements.append('\n'.join(current_statement))
    
    return statements

async def seed_database():
    """
    Seed the database with initial data for development.
    Only runs in development mode.
    """
    # if os.getenv("ENV", "development") != "development":
    #     logger.info("Skipping database seeding in non-development environment")
    #     return
    
    # Check if database is already seeded
    needs_seeding = await check_needs_seeding()
    if not needs_seeding:
        logger.info("Database already appears to be seeded. Skipping seeding.")
        return
    
    logger.info("Database needs seeding. Proceeding with full seed.")
    
    # Seed all tables in the correct order
    await seed_demo_users()
    await seed_demo_projects()
    await seed_demo_project_members()
    await seed_demo_reviews()
    await seed_demo_review_assignments()
    await seed_demo_checklists()
    await seed_demo_checklist_answers()
    
    logger.info("Full database seeding completed successfully.")

async def check_needs_seeding():
    """Check if the database needs seeding"""
    async for db in get_session():
        try:
            # Check users
            result = await db.execute(text("SELECT COUNT(*) FROM users"))
            user_count = result.scalar() or 0
            if user_count == 0:
                return True
            
            # Check specifically for demo users
            result = await db.execute(text("SELECT COUNT(*) FROM users WHERE email IN ('admin@example.com', 'user@example.com', 'reviewer@example.com')"))
            demo_user_count = result.scalar() or 0
            
            # Check projects
            try:
                result = await db.execute(text("SELECT COUNT(*) FROM projects"))
                project_count = result.scalar() or 0
            except Exception:
                logger.warning("Projects table may not exist yet")
                project_count = 0
                
            # Check reviews
            try:
                result = await db.execute(text("SELECT COUNT(*) FROM reviews"))
                review_count = result.scalar() or 0
            except Exception:
                logger.warning("Reviews table may not exist yet")
                review_count = 0
            
            # If we have demo users and some data in projects and reviews, assume we're seeded
            if demo_user_count > 0 and project_count > 0 and review_count > 0:
                return False
            else:
                return True
                
        except Exception as e:
            logger.warning(f"Error checking if database needs seeding: {e}")
            # If there's an error (like tables don't exist), we assume we need to seed
            return True

# Add demo users with the correct table schema
async def seed_demo_users():
    """Seed the database with demo users (password: Test111!)"""
    
    demo_users = [
        {
            "id": "11111111-1111-1111-1111-111111111111",
            "name": "Demo Admin",
            "email": "admin@example.com",
            "hashed_password": "$2b$12$QE4YjeceRg.ctIXetOFkpekPTahVF1LvB3ltsxUea0iY4ZjCNL8rW"
        },
        {
            "id": "22222222-2222-2222-2222-222222222222",
            "name": "Demo User",
            "email": "user@example.com",
            "hashed_password": "$2b$12$QE4YjeceRg.ctIXetOFkpekPTahVF1LvB3ltsxUea0iY4ZjCNL8rW"
        },
        {
            "id": "33333333-3333-3333-3333-333333333333",
            "name": "Test Reviewer",
            "email": "reviewer@example.com",
            "hashed_password": "$2b$12$QE4YjeceRg.ctIXetOFkpekPTahVF1LvB3ltsxUea0iY4ZjCNL8rW"
        }
    ]
    
    logger.info("Seeding demo users...")
    
    async for db in get_session():
        try:
            # Check if any demo users exist
            result = await db.execute(text("SELECT COUNT(*) FROM users WHERE email IN ('admin@example.com', 'user@example.com', 'reviewer@example.com')"))
            demo_count = result.scalar()
            if demo_count and demo_count > 0:
                logger.info(f"Found {demo_count} demo users, skipping user seeding")
                return
            
            # Add each user
            for user in demo_users:
                sql = f"""
                INSERT INTO users (id, name, email, hashed_password, created_at, updated_at, email_verified_at)
                VALUES 
                ('{user['id']}', '{user['name']}', '{user['email']}', 
                '{user['hashed_password']}', NOW(), NOW(), NOW());
                """
                try:
                    await db.execute(text(sql))
                    await db.commit()
                    logger.info(f"Added {user['email']} user")
                except Exception as e:
                    logger.error(f"Error adding user {user['email']}: {e}")
                    await db.rollback()
            
            logger.info("Demo users seeding completed")
        except Exception as e:
            logger.error(f"Error seeding demo users: {e}")
            await db.rollback()

async def seed_demo_projects():
    """Seed the database with demo projects"""
    
    demo_projects = [
        {
            "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            "owner_id": "11111111-1111-1111-1111-111111111111",
            "name": "Systematic Review of Machine Learning in Healthcare"
        },
        {
            "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
            "owner_id": "22222222-2222-2222-2222-222222222222",
            "name": "Meta-Analysis of COVID-19 Treatments"
        }
    ]
    
    logger.info("Seeding demo projects...")
    
    async for db in get_session():
        try:
            # Check if projects table has data
            result = await db.execute(text("SELECT COUNT(*) FROM projects"))
            count = result.scalar()
            if count and count > 0:
                logger.info(f"Projects table already has {count} rows, checking if demo projects exist")
                # Check if our demo projects exist
                result = await db.execute(text("SELECT COUNT(*) FROM projects WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')"))
                demo_count = result.scalar()
                if demo_count and demo_count > 0:
                    logger.info(f"Found {demo_count} demo projects, skipping project seeding")
                    return
            
            # Add each project
            for project in demo_projects:
                sql = f"""
                INSERT INTO projects (id, owner_id, name, created_at, updated_at)
                VALUES 
                ('{project['id']}', '{project['owner_id']}', '{project['name']}', NOW(), NOW());
                """
                try:
                    await db.execute(text(sql))
                    await db.commit()
                    logger.info(f"Added project '{project['name']}'")
                except Exception as e:
                    logger.error(f"Error adding project '{project['name']}': {e}")
                    await db.rollback()
            
            logger.info("Demo projects seeding completed")
        except Exception as e:
            logger.error(f"Error seeding demo projects: {e}")
            # Don't fail the entire seeding process if one step fails
            pass

async def seed_demo_project_members():
    """Seed the database with demo project members"""
    
    demo_project_members = [
        {"project_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "user_id": "11111111-1111-1111-1111-111111111111", "role": "owner"},
        {"project_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "user_id": "22222222-2222-2222-2222-222222222222", "role": "member"},
        {"project_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "user_id": "33333333-3333-3333-3333-333333333333", "role": "member"},
        {"project_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "user_id": "22222222-2222-2222-2222-222222222222", "role": "owner"},
        {"project_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "user_id": "33333333-3333-3333-3333-333333333333", "role": "member"}
    ]
    
    logger.info("Seeding demo project members...")
    
    async for db in get_session():
        try:
            # Check if project_members table has data
            result = await db.execute(text("SELECT COUNT(*) FROM project_members"))
            count = result.scalar()
            if count and count > 0:
                logger.info(f"Project members table already has {count} rows, skipping")
                return
            
            # Add each project member
            for member in demo_project_members:
                sql = f"""
                INSERT INTO project_members (project_id, user_id, role)
                VALUES 
                ('{member['project_id']}', '{member['user_id']}', '{member['role']}');
                """
                try:
                    await db.execute(text(sql))
                    await db.commit()
                except Exception as e:
                    logger.error(f"Error adding project member: {e}")
                    await db.rollback()
            
            logger.info("Demo project members seeding completed")
        except Exception as e:
            logger.error(f"Error seeding demo project members: {e}")
            # Don't fail the entire seeding process if one step fails
            pass

async def seed_demo_reviews():
    """Seed the database with demo reviews"""
    
    demo_reviews = [
        {"id": "cccccccc-cccc-cccc-cccc-cccccccccccc", "project_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "name": "ML for Cancer Detection"},
        {"id": "dddddddd-dddd-dddd-dddd-dddddddddddd", "project_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "name": "AI in Radiology"},
        {"id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", "project_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "name": "Remdesivir Efficacy"}
    ]
    
    logger.info("Seeding demo reviews...")
    
    async for db in get_session():
        try:
            # Check if reviews table has data
            result = await db.execute(text("SELECT COUNT(*) FROM reviews"))
            count = result.scalar()
            if count and count > 0:
                logger.info(f"Reviews table already has {count} rows, checking if demo reviews exist")
                # Check if our demo reviews exist
                result = await db.execute(text("SELECT COUNT(*) FROM reviews WHERE id IN ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee')"))
                demo_count = result.scalar()
                if demo_count and demo_count > 0:
                    logger.info(f"Found {demo_count} demo reviews, skipping review seeding")
                    return
            
            # Add each review
            for review in demo_reviews:
                sql = f"""
                INSERT INTO reviews (id, project_id, name, created_at)
                VALUES 
                ('{review['id']}', '{review['project_id']}', '{review['name']}', NOW());
                """
                try:
                    await db.execute(text(sql))
                    await db.commit()
                    logger.info(f"Added review '{review['name']}'")
                except Exception as e:
                    logger.error(f"Error adding review '{review['name']}': {e}")
                    await db.rollback()
            
            logger.info("Demo reviews seeding completed")
        except Exception as e:
            logger.error(f"Error seeding demo reviews: {e}")
            # Don't fail the entire seeding process if one step fails
            pass

async def seed_demo_review_assignments():
    """Seed the database with demo review assignments"""
    
    demo_assignments = [
        {"review_id": "cccccccc-cccc-cccc-cccc-cccccccccccc", "user_id": "22222222-2222-2222-2222-222222222222"},
        {"review_id": "cccccccc-cccc-cccc-cccc-cccccccccccc", "user_id": "33333333-3333-3333-3333-333333333333"},
        {"review_id": "dddddddd-dddd-dddd-dddd-dddddddddddd", "user_id": "33333333-3333-3333-3333-333333333333"},
        {"review_id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", "user_id": "22222222-2222-2222-2222-222222222222"}
    ]
    
    logger.info("Seeding demo review assignments...")
    
    async for db in get_session():
        try:
            # Check if review_assignments table has data
            result = await db.execute(text("SELECT COUNT(*) FROM review_assignments"))
            count = result.scalar()
            if count and count > 0:
                logger.info(f"Review assignments table already has {count} rows, skipping")
                return
            
            # Add each assignment
            for assignment in demo_assignments:
                sql = f"""
                INSERT INTO review_assignments (review_id, user_id)
                VALUES 
                ('{assignment['review_id']}', '{assignment['user_id']}');
                """
                try:
                    await db.execute(text(sql))
                    await db.commit()
                except Exception as e:
                    logger.error(f"Error adding review assignment: {e}")
                    await db.rollback()
            
            logger.info("Demo review assignments seeding completed")
        except Exception as e:
            logger.error(f"Error seeding demo review assignments: {e}")
            # Don't fail the entire seeding process if one step fails
            pass

async def seed_demo_checklists():
    """Seed the database with demo checklists"""
    
    demo_checklists = [
        {"id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "review_id": "cccccccc-cccc-cccc-cccc-cccccccccccc", "reviewer_id": "22222222-2222-2222-2222-222222222222", "type": "amstar", "completed": True},
        {"id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", "review_id": "cccccccc-cccc-cccc-cccc-cccccccccccc", "reviewer_id": "33333333-3333-3333-3333-333333333333", "type": "amstar", "completed": False},
        {"id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33", "review_id": "dddddddd-dddd-dddd-dddd-dddddddddddd", "reviewer_id": "33333333-3333-3333-3333-333333333333", "type": "amstar", "completed": True},
        {"id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44", "review_id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", "reviewer_id": "22222222-2222-2222-2222-222222222222", "type": "amstar", "completed": False}
    ]
    
    logger.info("Seeding demo checklists...")
    
    async for db in get_session():
        try:
            # Check if checklists table has data
            result = await db.execute(text("SELECT COUNT(*) FROM checklists"))
            count = result.scalar()
            if count and count > 0:
                logger.info(f"Checklists table already has {count} rows, checking if demo checklists exist")
                # Check if any checklists exist
                if count >= len(demo_checklists):
                    logger.info(f"Found {count} checklists, skipping checklist seeding")
                    return
            
            # Add each checklist
            for checklist in demo_checklists:
                completed_at = "NOW()" if checklist["completed"] else "NULL"
                sql = f"""
                INSERT INTO checklists (id, review_id, reviewer_id, type, completed_at, updated_at)
                VALUES 
                ('{checklist['id']}', '{checklist['review_id']}', '{checklist['reviewer_id']}', '{checklist['type']}', {completed_at}, NOW());
                """
                try:
                    await db.execute(text(sql))
                    await db.commit()
                    logger.info(f"Added checklist for review {checklist['review_id']} and reviewer {checklist['reviewer_id']}")
                except Exception as e:
                    logger.error(f"Error adding checklist: {e}")
                    await db.rollback()
            
            logger.info("Demo checklists seeding completed")
        except Exception as e:
            logger.error(f"Error seeding demo checklists: {e}")
            # Don't fail the entire seeding process if one step fails
            pass

async def seed_demo_checklist_answers():
    """Seed the database with demo checklist answers"""
    
    demo_answers = [
        {"id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "checklist_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "question_key": "q1", "answers": "[[true, false, false, false], [true], [false, true]]", "critical": True},
        {"id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", "checklist_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "question_key": "q2", "answers": "[[false, true, false, false], [false, false, true], [false, false, true]]", "critical": True},
        {"id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33", "checklist_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33", "question_key": "q1", "answers": "[[false, true, false, false], [false], [true, false]]", "critical": True},
        {"id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44", "checklist_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33", "question_key": "q2", "answers": "[[true, false, false, false], [false, true, false], [false, false, true]]", "critical": True}
    ]
    
    logger.info("Seeding demo checklist answers...")
    
    async for db in get_session():
        try:
            # Check if checklist_answers table has data
            result = await db.execute(text("SELECT COUNT(*) FROM checklist_answers"))
            count = result.scalar()
            if count and count > 0:
                logger.info(f"Checklist answers table already has {count} rows, skipping")
                return
            
            # Add each answer
            for answer in demo_answers:
                sql = f"""
                INSERT INTO checklist_answers (id, checklist_id, question_key, answers, critical, updated_at)
                VALUES 
                ('{answer['id']}', '{answer['checklist_id']}', '{answer['question_key']}', '{answer['answers']}'::jsonb, {answer['critical']}, NOW());
                """
                try:
                    await db.execute(text(sql))
                    await db.commit()
                    logger.info(f"Added checklist answer for checklist {answer['checklist_id']} and question {answer['question_key']}")
                except Exception as e:
                    logger.error(f"Error adding checklist answer: {e}")
                    await db.rollback()
            
            logger.info("Demo checklist answers seeding completed")
        except Exception as e:
            logger.error(f"Error seeding demo checklist answers: {e}")
            # Don't fail the entire seeding process if one step fails
            pass

if __name__ == "__main__":
    # Can be run directly for testing
    asyncio.run(seed_database())