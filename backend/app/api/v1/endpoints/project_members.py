from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from pydantic import EmailStr

from app.db.session import get_session
from app.models.user import User
from app.models.project import Project
from app.utils.auth import get_current_user
from app.schemas.user import UserSearchResponse

router = APIRouter()


@router.post("/{project_id}/members/add-by-email", status_code=status.HTTP_201_CREATED)
async def add_project_member_by_email(
    project_id: UUID,
    email: EmailStr = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Add a user to a project by their email address.
    
    Only the project owner can add members to the project.
    The user must have a verified email address.
    """
    # Verify the project exists and current user is the owner
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project owner can add members"
        )
    
    # Find the user by email (must be verified)
    result = await db.execute(
        select(User).where(
            User.email == email,
            User.email_verified_at.isnot(None)
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or email not verified"
        )
    
    # Don't add the owner as a member
    if user.id == project.owner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already the project owner"
        )
    
    # Insert into project_members table
    query = """
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (:project_id, :user_id, :role)
    ON CONFLICT (project_id, user_id) DO NOTHING
    """
    
    await db.execute(
        query,
        {"project_id": project_id, "user_id": user.id, "role": "member"}
    )
    
    await db.commit()
    
    return {
        "message": "User added to project successfully",
        "user": UserSearchResponse(
            id=user.id,
            email=user.email,
            name=user.name
        )
    }


@router.post("/{project_id}/members/{user_id}", status_code=status.HTTP_201_CREATED)
async def add_project_member(
    project_id: UUID,
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Add a user to a project.
    
    Only the project owner can add members to the project.
    """
    # Verify the project exists and current user is the owner
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project owner can add members"
        )
    
    # Verify the user exists
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Insert into project_members table
    query = """
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (:project_id, :user_id, :role)
    ON CONFLICT (project_id, user_id) DO NOTHING
    """
    
    await db.execute(
        query,
        {"project_id": project_id, "user_id": user_id, "role": "member"}
    )
    
    await db.commit()
    
    return {"message": "User added to project successfully"}