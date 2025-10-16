from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.db.session import get_session
from app.models.user import User
from app.models.checklist import Checklist
from app.models.checklist_answer import ChecklistAnswer
from app.schemas.checklist import ChecklistAnswerCreate, ChecklistAnswerResponse
from app.utils.auth import get_current_user

router = APIRouter()


@router.post("/{checklist_id}/answers", response_model=ChecklistAnswerResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_answer(
    checklist_id: UUID,
    answer_in: ChecklistAnswerCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Create or update an answer for a specific question in a checklist.
    
    Only the assigned reviewer can create or update answers.
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
            detail="Only the assigned reviewer can create or update answers"
        )
    
    # Check if a completed checklist can be edited
    if checklist.completed_at is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot edit a completed checklist"
        )
    
    # Check if the answer for this question already exists
    result = await db.execute(
        select(ChecklistAnswer).where(
            ChecklistAnswer.checklist_id == checklist_id,
            ChecklistAnswer.question_key == answer_in.question_key
        )
    )
    
    existing_answer = result.scalar_one_or_none()
    
    if existing_answer:
        # Update the existing answer
        existing_answer.answers = answer_in.answers
        existing_answer.critical = answer_in.critical
        await db.commit()
        await db.refresh(existing_answer)
        return existing_answer
    
    # Create a new answer
    answer = ChecklistAnswer(
        checklist_id=checklist_id,
        question_key=answer_in.question_key,
        answers=answer_in.answers,
        critical=answer_in.critical
    )
    
    db.add(answer)
    await db.commit()
    await db.refresh(answer)
    
    return answer