from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime, timezone


class BOQSection(str, Enum):
    MOBILIZATION = "Mobilization"
    GREY_STRUCTURE = "Grey Structure"
    FINISHING = "Finishing"
    OTHER = "Other"


class BOQ(SQLModel, table=True):
    __tablename__ = "boqs"

    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="projects.id", index=True)
    name: str
    boq_type: str  # "5_marla", "10_marla", "1_kanal"
    currency: str = Field(default="PKR")
    plot_area_sqft: Optional[float] = None
    covered_area_sqft: Optional[float] = None
    storeys: int = Field(default=2)
    notes: Optional[str] = None
    is_active: bool = Field(default=True)
    created_by: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BOQItem(SQLModel, table=True):
    __tablename__ = "boq_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    boq_id: int = Field(foreign_key="boqs.id", index=True)
    item_code: str = Field(index=True)
    section: BOQSection = Field(default=BOQSection.OTHER)
    description: str
    unit: str
    original_quantity: float
    unit_rate: float
    amount: float  # original_quantity * unit_rate (server-side computed)
    notes: Optional[str] = None
    # Execution tracking
    executed_quantity: float = Field(default=0.0)
    certified_quantity: float = Field(default=0.0)  # cumulative certified
    # Variation tracking
    approved_variation_quantity: float = Field(default=0.0)
    current_approved_quantity: float = Field(default=0.0)  # original + approved variations
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
