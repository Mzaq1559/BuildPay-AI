from fastapi import APIRouter, HTTPException
from sqlmodel import select
from datetime import datetime, timezone
from app.core.deps import SessionDep, CurrentUser
from app.models.variation import Variation, VariationStatus
from app.models.boq import BOQItem
from app.models.user import UserRole
from app.schemas.variation import VariationCreate, VariationDecision, VariationResponse
from app.services.audit_service import record_event
from app.models.audit import AuditEventType

router = APIRouter()


@router.get("/{project_id}/variations", response_model=list[VariationResponse])
def list_variations(project_id: int, session: SessionDep, current_user: CurrentUser):
    return session.exec(
        select(Variation).where(Variation.project_id == project_id).order_by(Variation.created_at.desc())
    ).all()


@router.post("/{project_id}/variations", response_model=VariationResponse, status_code=201)
def create_variation(project_id: int, data: VariationCreate, session: SessionDep, current_user: CurrentUser):
    boq_item = session.get(BOQItem, data.boq_item_id)
    if not boq_item:
        raise HTTPException(status_code=404, detail="BOQ item not found")

    existing_vars = session.exec(
        select(Variation).where(
            Variation.project_id == project_id,
            Variation.boq_item_id == data.boq_item_id,
            Variation.status == VariationStatus.APPROVED,
        )
    ).all()
    prev_approved = sum(v.proposed_additional_quantity for v in existing_vars)
    current_approved = boq_item.original_quantity + prev_approved
    revised = current_approved + data.proposed_additional_quantity
    estimated_value = round(data.proposed_additional_quantity * boq_item.unit_rate, 2)

    n = len(session.exec(select(Variation).where(Variation.project_id == project_id)).all()) + 1
    var_number = f"VAR-{project_id:03d}-{n:04d}"

    variation = Variation(
        variation_number=var_number,
        project_id=project_id,
        check_request_id=data.check_request_id,
        boq_item_id=data.boq_item_id,
        submitted_by=current_user.id,
        status=VariationStatus.SUBMITTED,
        original_boq_quantity=boq_item.original_quantity,
        previously_approved_variation=prev_approved,
        current_approved_quantity=current_approved,
        previously_certified_quantity=boq_item.certified_quantity,
        required_cumulative_quantity=boq_item.certified_quantity + data.proposed_additional_quantity,
        proposed_additional_quantity=data.proposed_additional_quantity,
        revised_proposed_quantity=revised,
        boq_rate=boq_item.unit_rate,
        estimated_variation_value=estimated_value,
        justification=data.justification,
        submitted_at=datetime.now(timezone.utc),
    )
    session.add(variation)
    session.commit()
    session.refresh(variation)

    record_event(
        session=session, event_type=AuditEventType.SUBMITTED,
        entity_type="variation", entity_id=variation.id,
        entity_reference=variation.variation_number,
        description=f"{current_user.full_name} submitted {variation.variation_number}: +{data.proposed_additional_quantity} {boq_item.unit} (PKR {estimated_value:,.0f})",
        project_id=project_id, actor=current_user, new_state="submitted",
    )
    return variation


@router.get("/{project_id}/variations/{var_id}", response_model=VariationResponse)
def get_variation(project_id: int, var_id: int, session: SessionDep, current_user: CurrentUser):
    v = session.get(Variation, var_id)
    if not v or v.project_id != project_id:
        raise HTTPException(status_code=404, detail="Variation not found")
    return v


@router.post("/{project_id}/variations/{var_id}/ai-review", response_model=dict)
async def trigger_var_ai_review(project_id: int, var_id: int, session: SessionDep, current_user: CurrentUser):
    from app.ai.orchestrator import run_variation_review
    variation = session.get(Variation, var_id)
    if not variation or variation.project_id != project_id:
        raise HTTPException(status_code=404, detail="Variation not found")
    variation.status = VariationStatus.AI_REVIEW
    variation.updated_at = datetime.now(timezone.utc)
    session.add(variation)
    session.commit()
    review = await run_variation_review(session, variation, project_id)
    variation.status = VariationStatus.HUMAN_REVIEW
    variation.ai_review_id = review.id
    variation.ai_confidence = review.overall_confidence
    variation.updated_at = datetime.now(timezone.utc)
    session.add(variation)
    session.commit()
    return {"review_id": review.id, "status": "completed", "confidence": review.overall_confidence}


@router.post("/{project_id}/variations/{var_id}/decide", response_model=VariationResponse)
def decide_variation(
    project_id: int, var_id: int,
    data: VariationDecision,
    session: SessionDep, current_user: CurrentUser
):
    allowed_roles = [UserRole.CONSULTANT, UserRole.QUANTITY_SURVEYOR, UserRole.CLIENT, UserRole.PROJECT_MANAGER, UserRole.ADMIN]
    if current_user.role not in allowed_roles:
        raise HTTPException(status_code=403, detail="Not authorized to approve variations")

    variation = session.get(Variation, var_id)
    if not variation or variation.project_id != project_id:
        raise HTTPException(status_code=404, detail="Variation not found")
    if variation.submitted_by == current_user.id:
        raise HTTPException(status_code=403, detail="Cannot approve your own variation")

    decision_map = {"approved": VariationStatus.APPROVED, "returned": VariationStatus.RETURNED, "rejected": VariationStatus.REJECTED}
    new_status = decision_map.get(data.decision)
    if not new_status:
        raise HTTPException(status_code=400, detail="Invalid decision")

    old_status = variation.status.value
    variation.status = new_status
    variation.approved_by = current_user.id
    variation.decision_notes = data.notes
    variation.decided_at = datetime.now(timezone.utc)
    variation.updated_at = datetime.now(timezone.utc)

    if new_status == VariationStatus.APPROVED:
        boq_item = session.get(BOQItem, variation.boq_item_id)
        if boq_item:
            boq_item.approved_variation_quantity += variation.proposed_additional_quantity
            boq_item.current_approved_quantity = boq_item.original_quantity + boq_item.approved_variation_quantity
            boq_item.updated_at = datetime.now(timezone.utc)
            session.add(boq_item)

    session.add(variation)
    session.commit()
    session.refresh(variation)

    event_type_map = {
        VariationStatus.APPROVED: AuditEventType.APPROVED,
        VariationStatus.RETURNED: AuditEventType.RETURNED,
        VariationStatus.REJECTED: AuditEventType.REJECTED,
    }
    record_event(
        session=session, event_type=event_type_map[new_status],
        entity_type="variation", entity_id=variation.id,
        entity_reference=variation.variation_number,
        description=f"{current_user.full_name} ({current_user.role.value}) {data.decision} {variation.variation_number}",
        project_id=project_id, actor=current_user,
        previous_state=old_status, new_state=new_status.value,
        event_metadata={"notes": data.notes or ""},
    )
    return variation
