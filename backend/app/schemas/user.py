from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: str = Field(..., description="User's email address")
    name: str = Field(..., description="User's name")
    password: str = Field(..., description="User's password")

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    created_at: datetime

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")
