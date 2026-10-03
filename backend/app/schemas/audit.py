from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from app.models.audit import AuditEventType


class AuditEventResponse(BaseModel):
    id: int
    project_id: Optional[int] = None
    entity_type: str
    entity_id: int
    entity_reference: Optional[str] = None
    event_type: AuditEventType
    description: str
    actor_id: Optional[int] = None
    actor_name: Optional[str] = None
    actor_role: Optional[str] = None
    previous_state: Optional[str] = None
    new_state: Optional[str] = None
    event_metadata: dict = {}
    created_at: datetime

    model_config = {"from_attributes": True}
