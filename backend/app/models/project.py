from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
from decimal import Decimal


class ProjectStatus(str, Enum):
    PLANNING = "planning"
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Project(SQLModel, table=True):
    __tablename__ = "projects"

    id: Optional[int] = Field(default=None, primary_key=True)
    project_number: str = Field(unique=True, index=True)
    name: str
    description: Optional[str] = None
    location: str
    client_name: str
    contractor_name: str
    consultant_name: Optional[str] = None
    status: ProjectStatus = Field(default=ProjectStatus.ACTIVE)
    contract_value: float = Field(default=0.0)
    currency: str = Field(default="PKR")
    retention_rate: float = Field(default=0.10)  # 10%
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    boq_type: Optional[str] = None  # "5_marla", "10_marla", "1_kanal"
    created_by: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
