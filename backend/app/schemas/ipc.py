from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.ipc import IPCStatus


class IPCGenerateRequest(BaseModel):
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None


class IPCDecision(BaseModel):
    decision: str  # "certified", "returned"
    notes: Optional[str] = None


class IPCLineResponse(BaseModel):
    id: int
    ipc_id: int
    boq_item_id: int
    check_request_id: Optional[int] = None
    variation_id: Optional[int] = None
    description: str
    unit: str
    boq_rate: float
    previous_quantity: float
    current_quantity: float
    cumulative_quantity: float
    current_amount: float
    cumulative_amount: float
    has_exception: bool
    exception_note: Optional[str] = None

    model_config = {"from_attributes": True}


class IPCResponse(BaseModel):
    id: int
    ipc_number: str
    project_id: int
    period_number: int
    status: IPCStatus
    gross_amount: float
    retention_amount: float
    previous_certified_total: float
    current_certified_amount: float
    cumulative_certified_amount: float
    net_payable: float
    has_exceptions: bool
    exceptions_notes: Optional[str] = None
    ai_confidence: Optional[float] = None
    certified_by: Optional[int] = None
    decision_notes: Optional[str] = None
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    decided_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}
