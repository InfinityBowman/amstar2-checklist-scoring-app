import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Index, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Checklist(Base):
    """
    Represents a checklist filled out by a reviewer for a review.
    Each checklist belongs to a specific review and can be assigned to a reviewer.
    """
    __tablename__ = "checklists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    review_id = Column(UUID(as_uuid=True), ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    type = Column(String(50), nullable=False, default='amstar')
    completed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    review = relationship("Review", back_populates="checklists")
    reviewer = relationship("User", back_populates="checklists")
    answers = relationship("ChecklistAnswer", back_populates="checklist", cascade="all, delete-orphan")

    __table_args__ = (
        Index('ix_checklists_review_id', 'review_id'),
        Index('ix_checklists_reviewer_id', 'reviewer_id'),
        CheckConstraint("type IN ('amstar')", name='check_checklist_type'),
    )

