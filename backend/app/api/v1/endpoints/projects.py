from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_session
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse
from app.utils.auth import get_current_user

router = APIRouter()


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Create a new project.
    """
    # Create project instance - UUID and timestamps are handled by the model
    project = Project(
        name=project_in.name,
        owner_id=current_user.id
    )
    
    # Save project to database
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    # Add the creator as an owner in the project_members table
    project_member = ProjectMember(
        project_id=project.id,
        user_id=current_user.id,
        role='owner'
    )
    
    # Save project membership
    db.add(project_member)
    await db.commit()
    
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Delete a project. Only the project owner can delete the project.
    """
    # Find the project
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if the current user is the project owner
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project owner can delete the project"
        )
    
    # Delete the project (CASCADE will handle related records)
    await db.delete(project)
    await db.commit()
    
    return None