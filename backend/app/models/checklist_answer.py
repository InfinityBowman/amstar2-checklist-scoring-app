import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base


class ChecklistAnswer(Base):
    """
    Stores answers for each question in a checklist.
    Each question is stored separately with its answers as JSONB.
    """
    __tablename__ = "checklist_answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    checklist_id = Column(UUID(as_uuid=True), ForeignKey("checklists.id", ondelete="CASCADE"), nullable=False, index=True)
    question_key = Column(String(50), nullable=False)  # e.g., 'q1', 'q2', etc.
    answers = Column(JSONB, nullable=False)  # Nested arrays like [[false, false], [true]]
    critical = Column(Boolean, nullable=False, default=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    checklist = relationship("Checklist", back_populates="answers")

    __table_args__ = (
        Index('ix_checklist_answers_checklist_id', 'checklist_id'),
        # Composite index for efficient lookup by checklist + question
        Index('ix_checklist_answers_checklist_question', 'checklist_id', 'question_key'),
    )

