from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime, timezone


class IPCStatus(str, Enum):
    DRAFT = "draft"
    AI_REVIEW = "ai_review"
    HUMAN_REVIEW = "human_review"
    CERTIFIED = "certified"
    RETURNED = "returned"
    PAID = "paid"


class IPC(SQLModel, table=True):
    __tablename__ = "ipcs"

    id: Optional[int] = Field(default=None, primary_key=True)
    ipc_number: str = Field(unique=True, index=True)
    project_id: int = Field(foreign_key="projects.id", index=True)
    period_number: int
    status: IPCStatus = Field(default=IPCStatus.DRAFT)
    # Financial summary
    gross_amount: float = Field(default=0.0)
    retention_amount: float = Field(default=0.0)
    previous_certified_total: float = Field(default=0.0)
    current_certified_amount: float = Field(default=0.0)
    cumulative_certified_amount: float = Field(default=0.0)
    net_payable: float = Field(default=0.0)
    # Exceptions
    has_exceptions: bool = Field(default=False)
    exceptions_notes: Optional[str] = None
    # AI
    ai_review_id: Optional[int] = Field(default=None, foreign_key="ai_reviews.id")
    # Human decision
    certified_by: Optional[int] = Field(default=None, foreign_key="users.id")
    decision_notes: Optional[str] = None
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    decided_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class IPCLine(SQLModel, table=True):
    __tablename__ = "ipc_lines"

    id: Optional[int] = Field(default=None, primary_key=True)
    ipc_id: int = Field(foreign_key="ipcs.id", index=True)
    boq_item_id: int = Field(foreign_key="boq_items.id")
    check_request_id: Optional[int] = Field(default=None, foreign_key="check_requests.id")
    variation_id: Optional[int] = Field(default=None, foreign_key="variations.id")
    description: str
    unit: str
    boq_rate: float
    previous_quantity: float = Field(default=0.0)
    current_quantity: float
    cumulative_quantity: float
    current_amount: float  # current_quantity * boq_rate (server-side)
    cumulative_amount: float  # cumulative_quantity * boq_rate (server-side)
    has_exception: bool = Field(default=False)
    exception_note: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
