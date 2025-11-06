from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from uuid import UUID

from app.db.session import get_session
from app.models.review import Review
from app.models.project import Project
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.utils.auth import get_current_user

router = APIRouter()


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Create a new review within a project.
    
    User must be the owner or a member of the project to create a review.
    """
    # Verify the project exists
    result = await db.execute(select(Project).where(Project.id == review_in.project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user is project owner
    is_owner = project.owner_id == current_user.id
    
    # If not owner, check if user is a project member
    if not is_owner:
        # Query project_members table
        query = text("""
        SELECT 1 FROM project_members
        WHERE project_id = :project_id AND user_id = :user_id
        """)
        
        result = await db.execute(
            query,
            {"project_id": review_in.project_id, "user_id": current_user.id}
        )
        
        is_member = result.scalar_one_or_none() is not None
        
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be a project owner or member to create reviews"
            )
    
    # Create the review
    review = Review(
        name=review_in.name,
        project_id=review_in.project_id
    )
    
    db.add(review)
    await db.commit()
    await db.refresh(review)
    
    return review


# Delete a review (only project owner can delete)
from fastapi import Path

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: UUID = Path(..., description="The ID of the review to delete"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    # Fetch the review and its project
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    # Fetch the project
    result = await db.execute(select(Project).where(Project.id == review.project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Only the project owner can delete
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the project owner can delete reviews")

    await db.delete(review)
    await db.commit()
    return None