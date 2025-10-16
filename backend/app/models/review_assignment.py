import uuid
from sqlalchemy import Column, ForeignKey, Index, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class ReviewAssignment(Base):
    """
    Assigns users to reviews.
    Represents a many-to-many relationship between reviews and users.
    """
    __tablename__ = "review_assignments"

    review_id = Column(UUID(as_uuid=True), ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    review = relationship("Review", back_populates="assignments")
    user = relationship("User", back_populates="review_assignments")

    __table_args__ = (
        PrimaryKeyConstraint('review_id', 'user_id'),
        Index('ix_review_assignments_review_id', 'review_id'),
        Index('ix_review_assignments_user_id', 'user_id'),
    )