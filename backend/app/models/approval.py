from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime, timezone


class ApprovalDecision(str, Enum):
    APPROVED = "approved"
    RETURNED = "returned"
    REJECTED = "rejected"


class Approval(SQLModel, table=True):
    __tablename__ = "approvals"

    id: Optional[int] = Field(default=None, primary_key=True)
    entity_type: str  # "check_request", "variation", "ipc"
    entity_id: int
    project_id: int = Field(foreign_key="projects.id")
    decided_by: int = Field(foreign_key="users.id")
    decision: ApprovalDecision
    comments: Optional[str] = None
    ai_review_id: Optional[int] = Field(default=None, foreign_key="ai_reviews.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
