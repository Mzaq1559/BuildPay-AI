from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime, timezone


class VariationStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    AI_REVIEW = "ai_review"
    HUMAN_REVIEW = "human_review"
    APPROVED = "approved"
    RETURNED = "returned"
    REJECTED = "rejected"


class Variation(SQLModel, table=True):
    __tablename__ = "variations"

    id: Optional[int] = Field(default=None, primary_key=True)
    variation_number: str = Field(unique=True, index=True)
    project_id: int = Field(foreign_key="projects.id", index=True)
    check_request_id: Optional[int] = Field(default=None, foreign_key="check_requests.id")
    boq_item_id: int = Field(foreign_key="boq_items.id", index=True)
    submitted_by: int = Field(foreign_key="users.id")
    status: VariationStatus = Field(default=VariationStatus.DRAFT)
    # Quantity fields (from PRD Table 6)
    original_boq_quantity: float
    previously_approved_variation: float = Field(default=0.0)
    current_approved_quantity: float  # original + previously approved
    previously_certified_quantity: float = Field(default=0.0)
    required_cumulative_quantity: float  # quantity needed based on measurement
    proposed_additional_quantity: float
    revised_proposed_quantity: float  # current_approved + proposed_additional
    # Financial
    boq_rate: float
    estimated_variation_value: float  # proposed_additional * rate
    # Justification
    justification: str
    # AI
    ai_review_id: Optional[int] = Field(default=None, foreign_key="ai_reviews.id")
    ai_confidence: Optional[float] = None
    # Human decision
    approved_by: Optional[int] = Field(default=None, foreign_key="users.id")
    decision_notes: Optional[str] = None
    submitted_at: Optional[datetime] = None
    decided_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
