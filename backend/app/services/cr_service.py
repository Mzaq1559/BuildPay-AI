from datetime import datetime, timezone
from sqlmodel import Session, select
from app.models.check_request import CheckRequest, CheckRequestStatus
from app.models.boq import BOQItem
from app.models.user import User
from app.schemas.check_request import CheckRequestCreate, CheckRequestDecision
from app.services.audit_service import record_event
from app.models.audit import AuditEventType


def _next_cr_number(session: Session, project_id: int) -> str:
    existing = session.exec(
        select(CheckRequest)
        .where(CheckRequest.project_id == project_id)
        .order_by(CheckRequest.id)
    ).all()
    n = len(existing) + 1
    return f"CR-{project_id:03d}-{n:04d}"


def create_check_request(
    session: Session,
    project_id: int,
    data: CheckRequestCreate,
    current_user: User,
) -> CheckRequest:
    cr = CheckRequest(
        cr_number=_next_cr_number(session, project_id),
        project_id=project_id,
        boq_item_id=data.boq_item_id,
        submitted_by=current_user.id,
        status=CheckRequestStatus.DRAFT,
        location=data.location,
        description=data.description,
        requested_quantity=data.requested_quantity,
        unit=data.unit,
        notes=data.notes,
    )
    session.add(cr)
    session.commit()
    session.refresh(cr)

    record_event(
        session=session,
        event_type=AuditEventType.CREATED,
        entity_type="check_request",
        entity_id=cr.id,
        entity_reference=cr.cr_number,
        description=f"{current_user.full_name} created Check Request {cr.cr_number}",
        project_id=project_id,
        actor=current_user,
        new_state=CheckRequestStatus.DRAFT.value,
    )
    return cr


def submit_check_request(
    session: Session,
    cr: CheckRequest,
    current_user: User,
) -> CheckRequest:
    old_status = cr.status.value
    cr.status = CheckRequestStatus.SUBMITTED
    cr.submitted_at = datetime.now(timezone.utc)
    cr.updated_at = datetime.now(timezone.utc)
    session.add(cr)
    session.commit()
    session.refresh(cr)

    record_event(
        session=session,
        event_type=AuditEventType.SUBMITTED,
        entity_type="check_request",
        entity_id=cr.id,
        entity_reference=cr.cr_number,
        description=f"{current_user.full_name} submitted Check Request {cr.cr_number} for review",
        project_id=cr.project_id,
        actor=current_user,
        previous_state=old_status,
        new_state=CheckRequestStatus.SUBMITTED.value,
    )
    return cr


def decide_check_request(
    session: Session,
    cr: CheckRequest,
    decision_data: CheckRequestDecision,
    current_user: User,
) -> CheckRequest:
    old_status = cr.status.value
    decision_map = {
        "approved": CheckRequestStatus.APPROVED,
        "returned": CheckRequestStatus.RETURNED,
        "rejected": CheckRequestStatus.REJECTED,
    }
    new_status = decision_map.get(decision_data.decision)
    if not new_status:
        raise ValueError(f"Invalid decision: {decision_data.decision}")

    cr.status = new_status
    cr.approved_by = current_user.id
    cr.decision_notes = decision_data.notes
    cr.decided_at = datetime.now(timezone.utc)
    cr.updated_at = datetime.now(timezone.utc)
    session.add(cr)

    # If approved, update BOQ item executed quantity
    if new_status == CheckRequestStatus.APPROVED:
        boq_item = session.get(BOQItem, cr.boq_item_id)
        if boq_item:
            boq_item.executed_quantity += cr.requested_quantity
            boq_item.updated_at = datetime.now(timezone.utc)
            session.add(boq_item)

    session.commit()
    session.refresh(cr)

    event_map = {
        CheckRequestStatus.APPROVED: AuditEventType.APPROVED,
        CheckRequestStatus.RETURNED: AuditEventType.RETURNED,
        CheckRequestStatus.REJECTED: AuditEventType.REJECTED,
    }
    record_event(
        session=session,
        event_type=event_map[new_status],
        entity_type="check_request",
        entity_id=cr.id,
        entity_reference=cr.cr_number,
        description=f"{current_user.full_name} ({current_user.role.value}) {decision_data.decision} Check Request {cr.cr_number}",
        project_id=cr.project_id,
        actor=current_user,
        previous_state=old_status,
        new_state=new_status.value,
        event_metadata={"notes": decision_data.notes or ""},
    )
    return cr
