from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator
import re

class UserCreate(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    name: str = Field(..., description="User's name")
    password: str = Field(..., description="User's password")

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    created_at: datetime
    email_verified_at: datetime = None
    
class UserSearchResponse(BaseModel):
    """Lightweight user model for search results"""
    id: UUID
    email: EmailStr
    name: str

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")

class PasswordResetRequest(BaseModel):
    email: EmailStr = Field(..., description="User's email address")

class PasswordResetConfirm(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    code: str = Field(..., description="Password reset code")
    new_password: str = Field(..., description="New password", min_length=8)
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v
