from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.notification import NotificationType


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    project_id: Optional[int] = None
    notification_type: NotificationType
    title: str
    message: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    entity_reference: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationMarkRead(BaseModel):
    notification_ids: list[int]
