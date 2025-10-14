from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional


class ReviewCreate(BaseModel):
    """Schema for creating a new review"""
    name: str = Field(..., description="Review name", min_length=1, max_length=255)
    project_id: UUID = Field(..., description="ID of the project this review belongs to")


class ReviewUpdate(BaseModel):
    """Schema for updating a review"""
    name: Optional[str] = Field(None, description="Review name", min_length=1, max_length=255)


class ReviewResponse(BaseModel):
    """Schema for review response"""
    id: UUID
    project_id: UUID
    name: str
    created_at: datetime

    class Config:
        from_attributes = True

