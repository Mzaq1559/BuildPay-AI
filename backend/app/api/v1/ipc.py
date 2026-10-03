from fastapi import APIRouter, HTTPException
from sqlmodel import select
from datetime import datetime, timezone
from app.core.deps import SessionDep, CurrentUser
from app.models.ipc import IPC, IPCLine, IPCStatus
from app.models.user import UserRole
from app.schemas.ipc import IPCGenerateRequest, IPCDecision, IPCResponse, IPCLineResponse
from app.services.ipc_service import generate_ipc
from app.services.audit_service import record_event
from app.models.audit import AuditEventType

router = APIRouter()


@router.get("/{project_id}/ipc", response_model=list[IPCResponse])
def list_ipcs(project_id: int, session: SessionDep, current_user: CurrentUser):
    return session.exec(
        select(IPC).where(IPC.project_id == project_id).order_by(IPC.period_number)
    ).all()


@router.post("/{project_id}/ipc/generate", response_model=IPCResponse, status_code=201)
def generate_ipc_endpoint(project_id: int, data: IPCGenerateRequest, session: SessionDep, current_user: CurrentUser):
    return generate_ipc(session, project_id, current_user, data.period_start, data.period_end)


@router.get("/{project_id}/ipc/{ipc_id}", response_model=IPCResponse)
def get_ipc(project_id: int, ipc_id: int, session: SessionDep, current_user: CurrentUser):
    ipc = session.get(IPC, ipc_id)
    if not ipc or ipc.project_id != project_id:
        raise HTTPException(status_code=404, detail="IPC not found")
    return ipc


@router.get("/{project_id}/ipc/{ipc_id}/lines", response_model=list[IPCLineResponse])
def get_ipc_lines(project_id: int, ipc_id: int, session: SessionDep, current_user: CurrentUser):
    ipc = session.get(IPC, ipc_id)
    if not ipc or ipc.project_id != project_id:
        raise HTTPException(status_code=404, detail="IPC not found")
    return session.exec(select(IPCLine).where(IPCLine.ipc_id == ipc_id)).all()


@router.post("/{project_id}/ipc/{ipc_id}/ai-review", response_model=dict)
async def ipc_ai_review(project_id: int, ipc_id: int, session: SessionDep, current_user: CurrentUser):
    from app.ai.orchestrator import run_ipc_review
    ipc = session.get(IPC, ipc_id)
    if not ipc or ipc.project_id != project_id:
        raise HTTPException(status_code=404, detail="IPC not found")
    ipc.status = IPCStatus.AI_REVIEW
    ipc.updated_at = datetime.now(timezone.utc)
    session.add(ipc)
    session.commit()
    review = await run_ipc_review(session, ipc, project_id)
    ipc.status = IPCStatus.HUMAN_REVIEW
    ipc.ai_review_id = review.id
    ipc.updated_at = datetime.now(timezone.utc)
    session.add(ipc)
    session.commit()
    return {"review_id": review.id, "status": "completed", "confidence": review.overall_confidence}


@router.post("/{project_id}/ipc/{ipc_id}/decide", response_model=IPCResponse)
def decide_ipc(project_id: int, ipc_id: int, data: IPCDecision, session: SessionDep, current_user: CurrentUser):
    allowed_roles = [UserRole.CLIENT, UserRole.PROJECT_MANAGER, UserRole.ADMIN]
    if current_user.role not in allowed_roles:
        raise HTTPException(status_code=403, detail="Not authorized to certify IPCs")
    ipc = session.get(IPC, ipc_id)
    if not ipc or ipc.project_id != project_id:
        raise HTTPException(status_code=404, detail="IPC not found")
    decision_map = {"certified": IPCStatus.CERTIFIED, "returned": IPCStatus.RETURNED}
    new_status = decision_map.get(data.decision)
    if not new_status:
        raise HTTPException(status_code=400, detail="Invalid decision. Must be 'certified' or 'returned'")
    old_status = ipc.status.value
    ipc.status = new_status
    ipc.certified_by = current_user.id
    ipc.decision_notes = data.notes
    ipc.decided_at = datetime.now(timezone.utc)
    ipc.updated_at = datetime.now(timezone.utc)
    if new_status == IPCStatus.CERTIFIED:
        # Update BOQ item certified quantities
        lines = session.exec(select(IPCLine).where(IPCLine.ipc_id == ipc_id)).all()
        for line in lines:
            from app.models.boq import BOQItem
            boq_item = session.get(BOQItem, line.boq_item_id)
            if boq_item:
                boq_item.certified_quantity += line.current_quantity
                boq_item.updated_at = datetime.now(timezone.utc)
                session.add(boq_item)
    session.add(ipc)
    session.commit()
    session.refresh(ipc)
    record_event(
        session=session, event_type=AuditEventType.CERTIFIED if new_status == IPCStatus.CERTIFIED else AuditEventType.RETURNED,
        entity_type="ipc", entity_id=ipc.id, entity_reference=ipc.ipc_number,
        description=f"{current_user.full_name} ({current_user.role.value}) {data.decision} {ipc.ipc_number}. Net payable: PKR {ipc.net_payable:,.0f}",
        project_id=project_id, actor=current_user, previous_state=old_status, new_state=new_status.value,
    )
    return ipc
