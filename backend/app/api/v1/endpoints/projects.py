from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID, uuid4
from datetime import datetime

from app.db.session import get_session
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse
from app.utils.auth import get_current_user

router = APIRouter()


async def generate_unique_uuid(db: AsyncSession) -> UUID:
    """Generate a UUID that doesn't exist in the database"""
    from sqlalchemy import select
    max_attempts = 10
    
    for _ in range(max_attempts):
        new_id = uuid4()
        # Check if UUID exists
        result = await db.execute(
            select(Project.id).where(Project.id == new_id)
        )
        if result.first() is None:
            return new_id
    
    # If we somehow hit max attempts, raise an error
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Unable to generate unique project ID"
    )

async def save_project_to_db(project: Project, db: AsyncSession):
    """Background task to save project to database"""
    start_time = datetime.utcnow()
    print(f"[Projects API] Starting background save at {start_time}")
    try:
        # Double-check UUID is still unique before saving
        result = await db.execute(
            select(Project.id).where(Project.id == project.id)
        )
        if result.first() is not None:
            print(f"[Projects API] UUID conflict detected for {project.id}")
            return
            
        db.add(project)
        await db.commit()
        await db.refresh(project)
        end_time = datetime.utcnow()
        print(f"[Projects API] Successfully saved project {project.id} to database")
        print(f"[Projects API] Background save took {(end_time - start_time).total_seconds()} seconds")
    except Exception as e:
        print(f"[Projects API] Error saving project to database: {e}")
        # Here you could implement retry logic or error notification

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Create a new project with optimistic response.
    
    Returns immediately with a projected state while saving occurs in background.
    """
    start_time = datetime.utcnow()
    print(f"[Projects API] Received create project request at {start_time}")
    print(f"[Projects API] Project name: {project_in.name}")
    print(f"[Projects API] User ID: {current_user.id}")
    
    # Generate a guaranteed unique UUID
    project_id = await generate_unique_uuid(db)
    
    # Create project instance with verified unique ID
    current_time = datetime.utcnow()
    project = Project(
        id=project_id,
        name=project_in.name,
        owner_id=current_user.id,
        created_at=current_time,
        updated_at=current_time
    )
    
    # Schedule database save for background
    background_tasks.add_task(save_project_to_db, project, db)
    
    # Return optimistic response immediately
    end_time = datetime.utcnow()
    print(f"[Projects API] Returning response at {end_time}")
    print(f"[Projects API] Request took {(end_time - start_time).total_seconds()} seconds")
    return project