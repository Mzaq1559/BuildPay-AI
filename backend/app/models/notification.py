from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime, timezone


class NotificationType(str, Enum):
    APPROVAL_REQUIRED = "approval_required"
    AI_FINDING = "ai_finding"
    RETURNED = "returned"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEW_EVIDENCE = "new_evidence"
    VARIATION_UPDATE = "variation_update"
    IPC_UPDATE = "ipc_update"
    DOCUMENT_UPLOAD = "document_upload"
    WORKFLOW_TRANSITION = "workflow_transition"
    OVERRUN_DETECTED = "overrun_detected"


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    project_id: Optional[int] = Field(default=None, foreign_key="projects.id")
    notification_type: NotificationType
    title: str
    message: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    entity_reference: Optional[str] = None
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
