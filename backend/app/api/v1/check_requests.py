from fastapi import APIRouter, HTTPException, BackgroundTasks
from sqlmodel import select
from app.core.deps import SessionDep, CurrentUser
from app.models.check_request import CheckRequest, CheckRequestStatus
from app.models.user import UserRole
from app.schemas.check_request import CheckRequestCreate, CheckRequestDecision, CheckRequestResponse
from app.services.cr_service import create_check_request, submit_check_request, decide_check_request
from app.services.audit_service import record_event
from app.models.audit import AuditEventType
import asyncio

router = APIRouter()


@router.get("/{project_id}/check-requests", response_model=list[CheckRequestResponse])
def list_crs(project_id: int, session: SessionDep, current_user: CurrentUser):
    return session.exec(
        select(CheckRequest).where(CheckRequest.project_id == project_id).order_by(CheckRequest.created_at.desc())
    ).all()


@router.post("/{project_id}/check-requests", response_model=CheckRequestResponse, status_code=201)
def create_cr(project_id: int, data: CheckRequestCreate, session: SessionDep, current_user: CurrentUser):
    return create_check_request(session, project_id, data, current_user)


@router.get("/{project_id}/check-requests/{cr_id}", response_model=CheckRequestResponse)
def get_cr(project_id: int, cr_id: int, session: SessionDep, current_user: CurrentUser):
    cr = session.get(CheckRequest, cr_id)
    if not cr or cr.project_id != project_id:
        raise HTTPException(status_code=404, detail="Check Request not found")
    return cr


@router.post("/{project_id}/check-requests/{cr_id}/submit", response_model=CheckRequestResponse)
def submit_cr(project_id: int, cr_id: int, session: SessionDep, current_user: CurrentUser, background_tasks: BackgroundTasks):
    cr = session.get(CheckRequest, cr_id)
    if not cr or cr.project_id != project_id:
        raise HTTPException(status_code=404, detail="Check Request not found")
    if cr.status != CheckRequestStatus.DRAFT:
        raise HTTPException(status_code=400, detail=f"Cannot submit CR in status {cr.status}")
    cr = submit_check_request(session, cr, current_user)
    # Trigger AI review in background
    background_tasks.add_task(_run_ai_review_bg, cr_id, project_id)
    return cr


@router.post("/{project_id}/check-requests/{cr_id}/decide", response_model=CheckRequestResponse)
def decide_cr(
    project_id: int,
    cr_id: int,
    data: CheckRequestDecision,
    session: SessionDep,
    current_user: CurrentUser,
):
    # Only consultants, QS, client, PM can approve
    allowed_roles = [UserRole.CONSULTANT, UserRole.QUANTITY_SURVEYOR, UserRole.CLIENT, UserRole.PROJECT_MANAGER, UserRole.ADMIN]
    if current_user.role not in allowed_roles:
        raise HTTPException(status_code=403, detail="Your role is not authorized to approve Check Requests")

    cr = session.get(CheckRequest, cr_id)
    if not cr or cr.project_id != project_id:
        raise HTTPException(status_code=404, detail="Check Request not found")

    # Contractors cannot approve their own submissions (PRD requirement)
    if cr.submitted_by == current_user.id:
        raise HTTPException(status_code=403, detail="Contractors cannot approve their own submissions")

    allowed_statuses = [CheckRequestStatus.HUMAN_REVIEW, CheckRequestStatus.SUBMITTED, CheckRequestStatus.AI_REVIEW]
    if cr.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Cannot decide on CR in status {cr.status}")

    return decide_check_request(session, cr, data, current_user)


def _run_ai_review_bg(cr_id: int, project_id: int):
    """Background task to run AI review."""
    pass  # AI review runs via dedicated endpoint for MVP transparency


@router.post("/{project_id}/check-requests/{cr_id}/ai-review", response_model=dict)
async def trigger_ai_review(project_id: int, cr_id: int, session: SessionDep, current_user: CurrentUser):
    from app.ai.orchestrator import run_cr_review
    from app.models.check_request import CheckRequest
    cr = session.get(CheckRequest, cr_id)
    if not cr or cr.project_id != project_id:
        raise HTTPException(status_code=404, detail="Check Request not found")
    cr.status = CheckRequestStatus.AI_REVIEW
    from datetime import datetime, timezone
    cr.updated_at = datetime.now(timezone.utc)
    session.add(cr)
    session.commit()
    record_event(
        session=session, event_type=AuditEventType.AI_REVIEW_STARTED,
        entity_type="check_request", entity_id=cr.id,
        entity_reference=cr.cr_number,
        description=f"AI review started for {cr.cr_number}",
        project_id=project_id,
    )
    review = await run_cr_review(session, cr, project_id)
    cr.status = CheckRequestStatus.HUMAN_REVIEW
    cr.ai_review_id = review.id
    cr.ai_confidence = review.overall_confidence
    cr.ai_reviewed_at = datetime.now(timezone.utc)
    cr.updated_at = datetime.now(timezone.utc)
    session.add(cr)
    session.commit()
    record_event(
        session=session, event_type=AuditEventType.AI_REVIEW_COMPLETED,
        entity_type="check_request", entity_id=cr.id,
        entity_reference=cr.cr_number,
        description=f"AI review completed for {cr.cr_number}. Confidence: {review.overall_confidence:.0%}. {review.summary}",
        project_id=project_id,
        event_metadata={"confidence": review.overall_confidence, "recommendation": review.overall_recommendation},
    )
    return {"review_id": review.id, "status": "completed", "confidence": review.overall_confidence, "recommendation": review.overall_recommendation}
