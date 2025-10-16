import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Review(Base):
    """
    Represents a review within a project.
    Each review can have multiple checklists (one per reviewer).
    """
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="reviews")
    checklists = relationship("Checklist", back_populates="review", cascade="all, delete-orphan")
    assignments = relationship("ReviewAssignment", back_populates="review", cascade="all, delete-orphan")

    __table_args__ = (
        Index('ix_reviews_project_id', 'project_id'),
    )
