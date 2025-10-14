from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional


class ProjectCreate(BaseModel):
    """Schema for creating a new project"""
    name: str = Field(..., description="Project name", min_length=1, max_length=255)


class ProjectUpdate(BaseModel):
    """Schema for updating a project"""
    name: Optional[str] = Field(None, description="Project name", min_length=1, max_length=255)


class ProjectResponse(BaseModel):
    """Schema for project response"""
    id: UUID
    owner_id: UUID
    name: str
    updated_at: datetime

    class Config:
        from_attributes = True

