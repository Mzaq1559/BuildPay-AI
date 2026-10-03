from datetime import datetime, timezone
from sqlmodel import Session, select
from app.models.ipc import IPC, IPCLine, IPCStatus
from app.models.check_request import CheckRequest, CheckRequestStatus
from app.models.boq import BOQItem
from app.models.project import Project
from app.models.user import User
from app.services.audit_service import record_event
from app.models.audit import AuditEventType


def _next_ipc_number(session: Session, project_id: int) -> tuple[str, int]:
    existing = session.exec(
        select(IPC).where(IPC.project_id == project_id).order_by(IPC.period_number)
    ).all()
    period = len(existing) + 1
    return f"IPC-{project_id:03d}-{period:03d}", period


def generate_ipc(
    session: Session,
    project_id: int,
    current_user: User,
    period_start: datetime | None = None,
    period_end: datetime | None = None,
) -> IPC:
    project = session.get(Project, project_id)
    if not project:
        raise ValueError("Project not found")

    ipc_number, period_number = _next_ipc_number(session, project_id)

    # Get all approved CRs not yet in an IPC
    approved_crs = session.exec(
        select(CheckRequest).where(
            CheckRequest.project_id == project_id,
            CheckRequest.status == CheckRequestStatus.APPROVED,
        )
    ).all()

    ipc = IPC(
        ipc_number=ipc_number,
        project_id=project_id,
        period_number=period_number,
        status=IPCStatus.DRAFT,
        period_start=period_start,
        period_end=period_end,
    )
    session.add(ipc)
    session.commit()
    session.refresh(ipc)

    total_gross = 0.0
    lines_with_exceptions = []

    for cr in approved_crs:
        boq_item = session.get(BOQItem, cr.boq_item_id)
        if not boq_item:
            continue

        previous_qty = boq_item.certified_quantity
        current_qty = cr.requested_quantity
        cumulative_qty = previous_qty + current_qty
        current_amount = round(current_qty * boq_item.unit_rate, 2)
        cumulative_amount = round(cumulative_qty * boq_item.unit_rate, 2)

        has_exception = cumulative_qty > boq_item.current_approved_quantity
        exception_note = None
        if has_exception:
            exception_note = f"Cumulative quantity {cumulative_qty:.2f} exceeds approved {boq_item.current_approved_quantity:.2f}"
            lines_with_exceptions.append(exception_note)

        line = IPCLine(
            ipc_id=ipc.id,
            boq_item_id=boq_item.id,
            check_request_id=cr.id,
            description=boq_item.description,
            unit=boq_item.unit,
            boq_rate=boq_item.unit_rate,
            previous_quantity=previous_qty,
            current_quantity=current_qty,
            cumulative_quantity=cumulative_qty,
            current_amount=current_amount,
            cumulative_amount=cumulative_amount,
            has_exception=has_exception,
            exception_note=exception_note,
        )
        session.add(line)
        total_gross += current_amount

    session.commit()

    # Get previous certified total
    prev_ipcs = session.exec(
        select(IPC).where(
            IPC.project_id == project_id,
            IPC.id != ipc.id,
            IPC.status.in_([IPCStatus.CERTIFIED, IPCStatus.PAID]),
        )
    ).all()
    prev_total = sum(i.current_certified_amount for i in prev_ipcs)

    retention = round(total_gross * project.retention_rate, 2)
    net_payable = round(total_gross - retention, 2)
    cumulative_total = round(prev_total + total_gross, 2)

    ipc.gross_amount = round(total_gross, 2)
    ipc.retention_amount = retention
    ipc.net_payable = net_payable
    ipc.previous_certified_total = round(prev_total, 2)
    ipc.current_certified_amount = round(total_gross, 2)
    ipc.cumulative_certified_amount = cumulative_total
    ipc.has_exceptions = len(lines_with_exceptions) > 0
    ipc.exceptions_notes = "; ".join(lines_with_exceptions) if lines_with_exceptions else None
    ipc.submitted_at = datetime.now(timezone.utc)
    session.add(ipc)
    session.commit()
    session.refresh(ipc)

    record_event(
        session=session,
        event_type=AuditEventType.CREATED,
        entity_type="ipc",
        entity_id=ipc.id,
        entity_reference=ipc.ipc_number,
        description=f"IPC {ipc.ipc_number} generated with {len(approved_crs)} approved CRs. Gross: PKR {total_gross:,.0f}",
        project_id=project_id,
        actor=current_user,
        new_state=IPCStatus.DRAFT.value,
    )
    return ipc
