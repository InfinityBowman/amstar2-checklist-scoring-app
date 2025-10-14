from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional, List, Any


class ChecklistAnswerData(BaseModel):
    """Schema for a single question's answer data"""
    answers: List[List[bool]] = Field(..., description="Nested array of boolean answers")
    critical: bool = Field(default=False, description="Whether this is a critical question")


class ChecklistCreate(BaseModel):
    """Schema for creating a new checklist"""
    review_id: UUID = Field(..., description="ID of the review this checklist belongs to")
    reviewer_id: Optional[UUID] = Field(None, description="ID of the user assigned as reviewer")
    type: str = Field(default="amstar", description="Type of checklist")


class ChecklistUpdate(BaseModel):
    """Schema for updating a checklist"""
    reviewer_id: Optional[UUID] = Field(None, description="ID of the user assigned as reviewer")
    completed_at: Optional[datetime] = Field(None, description="When the checklist was completed")


class ChecklistAnswerCreate(BaseModel):
    """Schema for creating/updating a checklist answer"""
    question_key: str = Field(..., description="Question identifier (e.g., 'q1', 'q2')")
    answers: List[List[bool]] = Field(..., description="Nested array of boolean answers")
    critical: bool = Field(default=False, description="Whether this is a critical question")


class ChecklistAnswerResponse(BaseModel):
    """Schema for checklist answer response"""
    id: UUID
    checklist_id: UUID
    question_key: str
    answers: List[List[bool]]
    critical: bool
    updated_at: datetime

    class Config:
        from_attributes = True


class ChecklistResponse(BaseModel):
    """Schema for checklist response"""
    id: UUID
    review_id: UUID
    reviewer_id: Optional[UUID]
    type: str
    completed_at: Optional[datetime]
    updated_at: datetime

    class Config:
        from_attributes = True


class ChecklistWithAnswersResponse(BaseModel):
    """Schema for checklist response with all answers included"""
    id: UUID
    review_id: UUID
    reviewer_id: Optional[UUID]
    type: str
    completed_at: Optional[datetime]
    updated_at: datetime
    answers: List[ChecklistAnswerResponse] = []

    class Config:
        from_attributes = True


class ChecklistFrontendFormat(BaseModel):
    """
    Schema matching the frontend checklist structure.
    This format includes all questions as top-level fields (q1-q16).
    """
    id: UUID
    name: str = Field(default="", description="Checklist name (derived from review)")
    reviewerName: str = Field(default="", description="Reviewer name")
    createdAt: datetime
    
    # Question answers (q1-q16)
    q1: Optional[ChecklistAnswerData] = None
    q2: Optional[ChecklistAnswerData] = None
    q3: Optional[ChecklistAnswerData] = None
    q4: Optional[ChecklistAnswerData] = None
    q5: Optional[ChecklistAnswerData] = None
    q6: Optional[ChecklistAnswerData] = None
    q7: Optional[ChecklistAnswerData] = None
    q8: Optional[ChecklistAnswerData] = None
    q9: Optional[ChecklistAnswerData] = None
    q10: Optional[ChecklistAnswerData] = None
    q11: Optional[ChecklistAnswerData] = None
    q12: Optional[ChecklistAnswerData] = None
    q13: Optional[ChecklistAnswerData] = None
    q14: Optional[ChecklistAnswerData] = None
    q15: Optional[ChecklistAnswerData] = None
    q16: Optional[ChecklistAnswerData] = None

    class Config:
        from_attributes = True

