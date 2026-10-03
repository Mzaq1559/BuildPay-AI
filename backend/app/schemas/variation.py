from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.variation import VariationStatus


class VariationCreate(BaseModel):
    check_request_id: Optional[int] = None
    boq_item_id: int
    justification: str
    proposed_additional_quantity: float


class VariationDecision(BaseModel):
    decision: str  # "approved", "returned", "rejected"
    notes: Optional[str] = None


class VariationResponse(BaseModel):
    id: int
    variation_number: str
    project_id: int
    check_request_id: Optional[int] = None
    boq_item_id: int
    submitted_by: int
    status: VariationStatus
    original_boq_quantity: float
    previously_approved_variation: float
    current_approved_quantity: float
    previously_certified_quantity: float
    required_cumulative_quantity: float
    proposed_additional_quantity: float
    revised_proposed_quantity: float
    boq_rate: float
    estimated_variation_value: float
    justification: str
    ai_confidence: Optional[float] = None
    approved_by: Optional[int] = None
    decision_notes: Optional[str] = None
    submitted_at: Optional[datetime] = None
    decided_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}
