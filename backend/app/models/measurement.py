from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime, timezone


class MeasurementStatus(str, Enum):
    RECORDED = "recorded"
    VERIFIED = "verified"
    DISPUTED = "disputed"


class Measurement(SQLModel, table=True):
    __tablename__ = "measurements"

    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="projects.id", index=True)
    check_request_id: Optional[int] = Field(default=None, foreign_key="check_requests.id")
    boq_item_id: int = Field(foreign_key="boq_items.id", index=True)
    recorded_by: int = Field(foreign_key="users.id")
    verified_by: Optional[int] = Field(default=None, foreign_key="users.id")
    status: MeasurementStatus = Field(default=MeasurementStatus.RECORDED)
    current_quantity: float
    previously_certified_quantity: float = Field(default=0.0)
    cumulative_quantity: float  # previously_certified + current
    remaining_approved_quantity: float  # approved_quantity - cumulative
    measurement_date: datetime
    location_description: Optional[str] = None
    comments: Optional[str] = None
    # Overrun detection
    is_overrun: bool = Field(default=False)
    overrun_quantity: float = Field(default=0.0)
    variation_id: Optional[int] = Field(default=None, foreign_key="variations.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
