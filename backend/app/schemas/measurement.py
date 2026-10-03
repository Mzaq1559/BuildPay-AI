from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.measurement import MeasurementStatus


class MeasurementCreate(BaseModel):
    check_request_id: Optional[int] = None
    boq_item_id: int
    current_quantity: float
    measurement_date: datetime
    location_description: Optional[str] = None
    comments: Optional[str] = None


class MeasurementResponse(BaseModel):
    id: int
    project_id: int
    check_request_id: Optional[int] = None
    boq_item_id: int
    recorded_by: int
    verified_by: Optional[int] = None
    status: MeasurementStatus
    current_quantity: float
    previously_certified_quantity: float
    cumulative_quantity: float
    remaining_approved_quantity: float
    measurement_date: datetime
    location_description: Optional[str] = None
    comments: Optional[str] = None
    is_overrun: bool
    overrun_quantity: float
    variation_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}
