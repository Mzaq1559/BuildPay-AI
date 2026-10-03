from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime, timezone


class CheckRequestStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    AI_REVIEW = "ai_review"
    HUMAN_REVIEW = "human_review"
    APPROVED = "approved"
    RETURNED = "returned"
    REJECTED = "rejected"


class CheckRequest(SQLModel, table=True):
    __tablename__ = "check_requests"

    id: Optional[int] = Field(default=None, primary_key=True)
    cr_number: str = Field(unique=True, index=True)
    project_id: int = Field(foreign_key="projects.id", index=True)
    boq_item_id: int = Field(foreign_key="boq_items.id", index=True)
    submitted_by: int = Field(foreign_key="users.id")
    status: CheckRequestStatus = Field(default=CheckRequestStatus.DRAFT)
    location: Optional[str] = None
    description: str
    requested_quantity: float
    unit: str
    notes: Optional[str] = None
    # AI review
    ai_review_id: Optional[int] = Field(default=None, foreign_key="ai_reviews.id")
    ai_confidence: Optional[float] = None
    # Human decision
    approved_by: Optional[int] = Field(default=None, foreign_key="users.id")
    decision_notes: Optional[str] = None
    submitted_at: Optional[datetime] = None
    ai_reviewed_at: Optional[datetime] = None
    decided_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
