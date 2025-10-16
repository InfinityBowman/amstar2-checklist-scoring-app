"""
Database seeding utility.
This script seeds the database with initial data for development.
It should be run after all migrations have been applied.
"""
import asyncio
import logging
import os
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session

logger = logging.getLogger(__name__)

async def seed_database():
    """
    Seed the database with initial data for development.
    Only runs in development mode.
    """
    if os.getenv("ENV", "development") != "development":
        logger.info("Skipping database seeding in non-development environment")
        return
    
    # Get the init.sql file path - in Docker environment it's at the root
    if os.path.exists("/init.sql"):
        init_sql_path = Path("/init.sql")
    else:
        init_sql_path = Path(__file__).parents[3] / "init.sql"
    
    if not init_sql_path.exists():
        logger.warning(f"Seed file {init_sql_path} not found")
        return
    
    logger.info(f"Seeding database using {init_sql_path}")
    
    # Read the SQL file content
    with open(init_sql_path, "r") as f:
        sql_content = f.read()
    
    # Get a database session
    async for db in get_session():
        # First check if users table exists and has data
        try:
            result = await db.execute(text("SELECT COUNT(*) FROM users"))
            count = result.scalar()
            if count > 0:
                logger.info("Database already has user data, skipping seeding")
                return
        except Exception:
            logger.warning("Failed to check users table, it may not exist yet")
            return
        
        # Execute the SQL seed commands
        try:
            await db.execute(text(sql_content))
            await db.commit()
            logger.info("Database seeded successfully")
        except Exception as e:
            logger.error(f"Error seeding database: {e}")
            await db.rollback()

if __name__ == "__main__":
    # Can be run directly for testing
    asyncio.run(seed_database())