from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.project import ProjectStatus


class ProjectCreate(BaseModel):
    project_number: str
    name: str
    description: Optional[str] = None
    location: str
    client_name: str
    contractor_name: str
    consultant_name: Optional[str] = None
    status: ProjectStatus = ProjectStatus.ACTIVE
    contract_value: float = 0.0
    currency: str = "PKR"
    retention_rate: float = 0.10
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    boq_type: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    status: Optional[ProjectStatus] = None
    contract_value: Optional[float] = None
    retention_rate: Optional[float] = None
    end_date: Optional[datetime] = None


class ProjectResponse(BaseModel):
    id: int
    project_number: str
    name: str
    description: Optional[str] = None
    location: str
    client_name: str
    contractor_name: str
    consultant_name: Optional[str] = None
    status: ProjectStatus
    contract_value: float
    currency: str
    retention_rate: float
    boq_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectSummary(ProjectResponse):
    open_check_requests: int = 0
    pending_variations: int = 0
    total_certified: float = 0.0
    ai_flags: int = 0
