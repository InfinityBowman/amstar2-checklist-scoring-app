from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from typing import List, Optional

from app.db.session import get_session
from app.models.user import User
from app.schemas.user import UserResponse, UserSearchResponse
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get the current authenticated user's profile.
    
    Requires valid access token in Authorization header.
    Returns user information without sensitive data.
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        created_at=current_user.created_at,
        email_verified_at=current_user.email_verified_at
    )


@router.get("/search", response_model=List[UserSearchResponse])
async def search_users(
    q: Optional[str] = Query(None, description="Search query for name or email"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results to return"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Search for users by name or email.
    
    This endpoint allows searching for users to add to projects.
    Results are limited and exclude the current user.
    """
    query = select(User).where(User.id != current_user.id)
    
    if q:
        # Search by name or email (case-insensitive)
        search_term = f"%{q}%"
        query = query.where(
            or_(
                func.lower(User.name).like(func.lower(search_term)),
                func.lower(User.email).like(func.lower(search_term))
            )
        )
    
    # Limit results and only return verified users
    query = query.where(User.email_verified_at.isnot(None)).limit(limit)
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return [
        UserSearchResponse(
            id=user.id,
            email=user.email,
            name=user.name
        )
        for user in users
    ]
