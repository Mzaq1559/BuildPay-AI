from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime, timezone


class DocumentStatus(str, Enum):
    UPLOADED = "uploaded"
    UNDER_REVIEW = "under_review"
    VERIFIED = "verified"
    REJECTED = "rejected"
    MISSING = "missing"


class DocumentEntityType(str, Enum):
    CHECK_REQUEST = "check_request"
    VARIATION = "variation"
    IPC = "ipc"
    MEASUREMENT = "measurement"
    PROJECT = "project"


class Document(SQLModel, table=True):
    __tablename__ = "documents"

    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="projects.id", index=True)
    entity_type: DocumentEntityType
    entity_id: int
    filename: str
    original_filename: str
    file_path: str
    file_size: int  # bytes
    content_type: str
    status: DocumentStatus = Field(default=DocumentStatus.UPLOADED)
    description: Optional[str] = None
    uploaded_by: int = Field(foreign_key="users.id")
    reviewed_by: Optional[int] = Field(default=None, foreign_key="users.id")
    review_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
