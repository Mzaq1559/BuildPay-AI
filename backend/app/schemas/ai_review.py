from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from app.models.ai_review import AIFindingSeverity


class AIFindingResponse(BaseModel):
    id: int
    review_id: int
    agent_name: str
    severity: AIFindingSeverity
    finding: str
    confidence: float
    evidence: list = []
    recommendation: Optional[str] = None
    is_blocking: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AIReviewResponse(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    project_id: int
    status: str
    overall_confidence: Optional[float] = None
    overall_recommendation: Optional[str] = None
    agents_run: list = []
    summary: Optional[str] = None
    findings: list[AIFindingResponse] = []
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}
