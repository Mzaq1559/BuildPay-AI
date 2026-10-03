from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.check_request import CheckRequestStatus


class CheckRequestCreate(BaseModel):
    boq_item_id: int
    location: Optional[str] = None
    description: str
    requested_quantity: float
    unit: str
    notes: Optional[str] = None


class CheckRequestDecision(BaseModel):
    decision: str  # "approved", "returned", "rejected"
    notes: Optional[str] = None


class CheckRequestResponse(BaseModel):
    id: int
    cr_number: str
    project_id: int
    boq_item_id: int
    submitted_by: int
    status: CheckRequestStatus
    location: Optional[str] = None
    description: str
    requested_quantity: float
    unit: str
    notes: Optional[str] = None
    ai_confidence: Optional[float] = None
    approved_by: Optional[int] = None
    decision_notes: Optional[str] = None
    submitted_at: Optional[datetime] = None
    decided_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}
