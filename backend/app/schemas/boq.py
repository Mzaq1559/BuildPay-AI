from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.boq import BOQSection


class BOQCreate(BaseModel):
    name: str
    boq_type: str
    currency: str = "PKR"
    plot_area_sqft: Optional[float] = None
    covered_area_sqft: Optional[float] = None
    notes: Optional[str] = None


class BOQResponse(BaseModel):
    id: int
    project_id: int
    name: str
    boq_type: str
    currency: str
    plot_area_sqft: Optional[float] = None
    covered_area_sqft: Optional[float] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class BOQItemResponse(BaseModel):
    id: int
    boq_id: int
    item_code: str
    section: BOQSection
    description: str
    unit: str
    original_quantity: float
    unit_rate: float
    amount: float
    notes: Optional[str] = None
    executed_quantity: float
    certified_quantity: float
    approved_variation_quantity: float
    current_approved_quantity: float
    remaining_quantity: float = 0.0  # computed

    model_config = {"from_attributes": True}


class BOQImportType(BaseModel):
    boq_type: str  # "5_marla", "10_marla", "1_kanal"
