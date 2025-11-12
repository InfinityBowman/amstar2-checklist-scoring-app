from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from uuid import UUID
from datetime import datetime

from app.db.session import get_session
from app.models.user import User
from app.models.review import Review
from app.models.checklist import Checklist
from app.models.review_assignment import ReviewAssignment
from app.schemas.checklist import ChecklistCreate, ChecklistResponse, ChecklistUpdate
from app.utils.auth import get_current_user

router = APIRouter()


@router.post("", response_model=ChecklistResponse, status_code=status.HTTP_201_CREATED)
async def create_checklist(
    checklist_in: ChecklistCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Create a new checklist for a review.
    
    User must be assigned to the review to create a checklist.
    """
    # Verify the review exists
    result = await db.execute(select(Review).where(Review.id == checklist_in.review_id))
    review = result.scalar_one_or_none()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # If reviewer_id is provided, verify it matches current user
    if checklist_in.reviewer_id and checklist_in.reviewer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create a checklist for yourself as the reviewer"
        )

    # Assign the reviewer to the review if not already assigned
    reviewer_id = checklist_in.reviewer_id or current_user.id
    assignment_exists = await db.execute(
        select(ReviewAssignment).where(
            ReviewAssignment.review_id == checklist_in.review_id,
            ReviewAssignment.user_id == reviewer_id
        )
    )
    if not assignment_exists.scalar_one_or_none():
        db.add(ReviewAssignment(review_id=checklist_in.review_id, user_id=reviewer_id))

    # Create the checklist
    checklist = Checklist(
        review_id=checklist_in.review_id,
        reviewer_id=reviewer_id,
        type=checklist_in.type
    )

    db.add(checklist)
    await db.commit()
    await db.refresh(checklist)

    return checklist


@router.put("/{checklist_id}/complete", response_model=ChecklistResponse)
async def complete_checklist(
    checklist_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Mark a checklist as completed.
    
    Only the assigned reviewer can mark a checklist as completed.
    """
    # Verify the checklist exists
    result = await db.execute(select(Checklist).where(Checklist.id == checklist_id))
    checklist = result.scalar_one_or_none()
    
    if not checklist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checklist not found"
        )
    
    # Ensure current user is the assigned reviewer
    if checklist.reviewer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the assigned reviewer can mark a checklist as completed"
        )
    
    # Update the checklist
    checklist.completed_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(checklist)
    
    return checklist


@router.delete("/{checklist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_checklist(
    checklist_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Delete a checklist. Only the assigned reviewer can delete their checklist.
    """
    result = await db.execute(select(Checklist).where(Checklist.id == checklist_id))
    checklist = result.scalar_one_or_none()
    if not checklist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checklist not found"
        )
    if checklist.reviewer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the assigned reviewer can delete this checklist"
        )
    await db.delete(checklist)
    await db.commit()
    return None