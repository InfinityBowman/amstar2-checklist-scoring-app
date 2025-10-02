from typing import Dict
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone

from app.core.config import settings
from app.db.session import get_session
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
    generate_verification_code,
    mock_send_verification_email
)

# In-memory store for verification codes (replace with DB in production)
verification_codes: Dict[str, str] = {}

router = APIRouter()
security = HTTPBearer(auto_error=False)


# ---------------- MODELS ---------------- 
class TokenResponse(BaseModel):
    accessToken: str


class SignupResponse(BaseModel):
    message: str
    user: UserResponse

class VerifyEmailRequest(BaseModel):
    email: str
    code: str


class VerifyEmailResponse(BaseModel):
    message: str


class SendVerificationRequest(BaseModel):
    email: EmailStr

class SendVerificationResponse(BaseModel):
    message: str


# ---------------- ENDPOINTS ----------------
@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_session)):
    """
    Create a new user account.
    sendCodeWithDelay
    - **email**: User's email address (must be unique)
    - **name**: User's display name
    - **password**: User's password (will be hashed)
    """
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        if existing_user.email_verified_at is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email not verified"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password,
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Return user data (without password)
    user_response = UserResponse(
        id=new_user.id,
        email=new_user.email,
        name=new_user.name,
        created_at=new_user.created_at
    )
    
    return SignupResponse(
        message="User created successfully",
        user=user_response
    )


@router.post("/signin", response_model=TokenResponse)
async def signin(
    user_data: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_session)
):
    """
    Sign in user and return access token with refresh token cookie.
    
    - **email**: User's email address
    - **password**: User's password
    
    Returns access token and sets refresh token as HttpOnly cookie.
    """
    # Find user by email
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check if email is verified
    if user.email_verified_at is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email not verified"
        )
    
    # Create tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    
    # Set refresh token as HttpOnly cookie
    response.set_cookie(
        key="refresh",
        value=refresh_token,
        httponly=True,
        secure=True,  # Use HTTPS in production
        samesite="strict",
        path="/",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60  # Convert days to seconds
    )
    
    return TokenResponse(accessToken=access_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_session)
):
    """
    Refresh access token using refresh token from cookie.
    
    No request body required. Uses refresh token from HttpOnly cookie.
    """
    # Get refresh token from cookie
    refresh_token = request.cookies.get("refresh")
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )
    
    try:
        # Verify refresh token
        payload = verify_token(refresh_token, "refresh")
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Check if user still exists and is active
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        # Create new access token
        new_access_token = create_access_token({"sub": str(user.id)})
        
        return TokenResponse(accessToken=new_access_token)
        
    except HTTPException:
        # Clear invalid refresh token cookie
        response.delete_cookie(key="refresh", path="/")
        raise


@router.post("/signout")
async def signout(response: Response):
    """
    Sign out user by clearing refresh token cookie.
    
    No request body required. Clears the refresh token cookie.
    """
    response.delete_cookie(key="refresh", path="/")
    return {"message": "Successfully signed out"}


@router.post("/send-verification", response_model=SendVerificationResponse)
async def send_verification(
    request: SendVerificationRequest,
    db: AsyncSession = Depends(get_session)
):
    """
    Send a verification code to the user's email.
    """
    email = request.email.strip().lower()
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing email"
        )

    # Find user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Generate and store code
    code = generate_verification_code()
    user.email_verification_code = code
    user.email_verification_requested_at = datetime.now(timezone.utc)
    db.add(user)
    await db.commit()

    # Send email (mock for now)
    mock_send_verification_email(user.email, code)

    # send the code in the response since we dont actually send emails yet
    return SendVerificationResponse(message=f"Verification email sent. CODE: {code}")


@router.post("/verify-email", response_model=VerifyEmailResponse)
async def verify_email(
    request: VerifyEmailRequest,
    db: AsyncSession = Depends(get_session)
):
    """
    Verify the email with the code sent earlier.
    """
    email = request.email.strip().lower()
    code = request.code.strip()
    if not email or not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing email or code"
        )

    # Find user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check code against DB
    if not user.email_verification_code or user.email_verification_code != code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid verification code"
        )

    # Mark as verified
    user.email_verified_at = datetime.now(timezone.utc)
    user.email_verification_code = None
    user.email_verification_requested_at = None
    db.add(user)
    await db.commit()

    return VerifyEmailResponse(message="Email verified successfully")
    
