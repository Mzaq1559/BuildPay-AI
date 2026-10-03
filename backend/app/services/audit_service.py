from datetime import datetime, timezone
from sqlmodel import Session
from app.models.audit import AuditEvent, AuditEventType
from app.models.user import User


def record_event(
    session: Session,
    event_type: AuditEventType,
    entity_type: str,
    entity_id: int,
    description: str,
    project_id: int | None = None,
    actor: User | None = None,
    entity_reference: str | None = None,
    previous_state: str | None = None,
    new_state: str | None = None,
    event_metadata: dict | None = None,
) -> AuditEvent:
    event = AuditEvent(
        project_id=project_id,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_reference=entity_reference,
        event_type=event_type,
        description=description,
        actor_id=actor.id if actor else None,
        actor_name=actor.full_name if actor else "System",
        actor_role=actor.role.value if actor else "system",
        previous_state=previous_state,
        new_state=new_state,
        event_metadata=event_metadata or {},
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    return event
