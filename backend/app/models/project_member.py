import uuid
from sqlalchemy import Column, String, ForeignKey, CheckConstraint, Index, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class ProjectMember(Base):
    """
    Tracks which users are members of which projects and their roles.
    A user can be either an 'owner' or a 'member' of a project.
    """
    __tablename__ = "project_members"

    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), nullable=False, default='member')

    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_memberships")

    __table_args__ = (
        PrimaryKeyConstraint('project_id', 'user_id'),
        CheckConstraint("role IN ('owner', 'member')", name='valid_role'),
        Index('ix_project_members_project_id', 'project_id'),
        Index('ix_project_members_user_id', 'user_id'),
    )