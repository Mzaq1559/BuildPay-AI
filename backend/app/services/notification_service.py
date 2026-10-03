from sqlmodel import Session
from app.models.notification import Notification, NotificationType


def notify_user(
    session: Session,
    user_id: int,
    notification_type: NotificationType,
    title: str,
    message: str,
    project_id: int | None = None,
    entity_type: str | None = None,
    entity_id: int | None = None,
    entity_reference: str | None = None,
) -> Notification:
    notif = Notification(
        user_id=user_id,
        project_id=project_id,
        notification_type=notification_type,
        title=title,
        message=message,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_reference=entity_reference,
    )
    session.add(notif)
    session.commit()
    session.refresh(notif)
    return notif
