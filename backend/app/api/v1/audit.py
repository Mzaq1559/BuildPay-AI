from fastapi import APIRouter
from sqlmodel import select
from app.core.deps import SessionDep, CurrentUser
from app.models.audit import AuditEvent
from app.schemas.audit import AuditEventResponse

router = APIRouter()


@router.get("/audit", response_model=list[AuditEventResponse])
def list_audit_events(
    project_id: int | None = None,
    entity_type: str | None = None,
    limit: int = 100,
    session: SessionDep = ...,
    current_user: CurrentUser = ...,
):
    query = select(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(limit)
    if project_id:
        query = query.where(AuditEvent.project_id == project_id)
    if entity_type:
        query = query.where(AuditEvent.entity_type == entity_type)
    return session.exec(query).all()
