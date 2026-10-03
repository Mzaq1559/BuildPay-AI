from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from datetime import datetime, timezone


class AIFindingSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    OK = "ok"


class AIFinding(SQLModel, table=True):
    __tablename__ = "ai_findings"

    id: Optional[int] = Field(default=None, primary_key=True)
    review_id: int = Field(foreign_key="ai_reviews.id", index=True)
    agent_name: str
    severity: AIFindingSeverity = Field(default=AIFindingSeverity.INFO)
    finding: str
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    evidence: list = Field(default=[], sa_column=Column(JSON))
    recommendation: Optional[str] = None
    is_blocking: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AIReview(SQLModel, table=True):
    __tablename__ = "ai_reviews"

    id: Optional[int] = Field(default=None, primary_key=True)
    entity_type: str  # "check_request", "variation", "ipc"
    entity_id: int
    project_id: int = Field(foreign_key="projects.id")
    status: str = Field(default="pending")  # pending, running, completed, failed
    overall_confidence: Optional[float] = None
    overall_recommendation: Optional[str] = None
    agents_run: list = Field(default=[], sa_column=Column(JSON))
    summary: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
