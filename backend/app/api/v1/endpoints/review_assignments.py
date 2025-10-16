from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.db.session import get_session
from app.models.user import User
from app.models.review import Review
from app.models.project import Project
from app.utils.auth import get_current_user

router = APIRouter()


@router.post("/{review_id}/assign/{user_id}", status_code=status.HTTP_201_CREATED)
async def assign_reviewer(
    review_id: UUID,
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Assign a user as reviewer for a specific review.
    
    Only the project owner or project members can assign reviewers.
    """
    # Verify the review exists
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Get the project
    result = await db.execute(select(Project).where(Project.id == review.project_id))
    project = result.scalar_one_or_none()
    
    # Check if current user is project owner
    is_owner = project.owner_id == current_user.id
    
    # If not owner, check if user is a project member
    if not is_owner:
        # Query project_members table
        query = """
        SELECT 1 FROM project_members
        WHERE project_id = :project_id AND user_id = :user_id
        """
        
        result = await db.execute(
            query,
            {"project_id": project.id, "user_id": current_user.id}
        )
        
        is_member = result.scalar_one_or_none() is not None
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be a project owner or member to assign reviewers"
            )
    
    # Verify the user being assigned exists
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if the user is a member of the project
    if user_id != project.owner_id:
        # Query project_members table
        query = """
        SELECT 1 FROM project_members
        WHERE project_id = :project_id AND user_id = :user_id
        """
        
        result = await db.execute(
            query,
            {"project_id": project.id, "user_id": user_id}
        )
        
        is_project_member = result.scalar_one_or_none() is not None
        
        if not is_project_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User must be a project member to be assigned as a reviewer"
            )
    
    # Insert into review_assignments table
    query = """
    INSERT INTO review_assignments (review_id, user_id)
    VALUES (:review_id, :user_id)
    ON CONFLICT (review_id, user_id) DO NOTHING
    """
    
    await db.execute(
        query,
        {"review_id": review_id, "user_id": user_id}
    )
    
    await db.commit()
    
    return {"message": "Reviewer assigned successfully"}