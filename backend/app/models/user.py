import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy import Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    email_verification_code = Column(Text, nullable=True)
    email_verification_requested_at = Column(DateTime(timezone=True), nullable=True)
    password_reset_code = Column(Text, nullable=True)
    password_reset_at = Column(DateTime(timezone=True), nullable=True)
    password_reset_requested_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    checklists = relationship("Checklist", back_populates="reviewer")
    project_memberships = relationship("ProjectMember", back_populates="user", cascade="all, delete-orphan")
    review_assignments = relationship("ReviewAssignment", back_populates="user", cascade="all, delete-orphan")

    # Create a composite index on email for faster lookups
    __table_args__ = (
        Index('ix_users_email', 'email'),
    )