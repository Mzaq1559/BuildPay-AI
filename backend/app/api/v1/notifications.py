from fastapi import APIRouter
from sqlmodel import select
from datetime import datetime, timezone
from app.core.deps import SessionDep, CurrentUser
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse, NotificationMarkRead

router = APIRouter()


@router.get("/notifications", response_model=list[NotificationResponse])
def list_notifications(session: SessionDep, current_user: CurrentUser, unread_only: bool = False):
    query = select(Notification).where(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(50)
    if unread_only:
        query = query.where(Notification.is_read == False)
    return session.exec(query).all()


@router.post("/notifications/mark-read", response_model=dict)
def mark_notifications_read(data: NotificationMarkRead, session: SessionDep, current_user: CurrentUser):
    notifications = session.exec(
        select(Notification).where(
            Notification.id.in_(data.notification_ids),
            Notification.user_id == current_user.id,
        )
    ).all()
    for n in notifications:
        n.is_read = True
        session.add(n)
    session.commit()
    return {"marked_read": len(notifications)}
