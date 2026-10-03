from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from datetime import datetime, timezone


class AuditEventType(str, Enum):
    CREATED = "created"
    SUBMITTED = "submitted"
    AI_REVIEW_STARTED = "ai_review_started"
    AI_REVIEW_COMPLETED = "ai_review_completed"
    AI_FINDING = "ai_finding"
    APPROVED = "approved"
    RETURNED = "returned"
    REJECTED = "rejected"
    MODIFIED = "modified"
    UPLOADED = "uploaded"
    CERTIFIED = "certified"
    PAID = "paid"
    STATUS_CHANGED = "status_changed"


class AuditEvent(SQLModel, table=True):
    __tablename__ = "audit_events"

    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: Optional[int] = Field(default=None, foreign_key="projects.id", index=True)
    entity_type: str
    entity_id: int
    entity_reference: Optional[str] = None  # e.g. "CR-001"
    event_type: AuditEventType
    description: str
    actor_id: Optional[int] = Field(default=None, foreign_key="users.id")
    actor_name: Optional[str] = None  # denormalized for audit integrity
    actor_role: Optional[str] = None  # denormalized
    previous_state: Optional[str] = None
    new_state: Optional[str] = None
    event_metadata: dict = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
