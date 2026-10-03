from fastapi import APIRouter, HTTPException
from sqlmodel import select
from datetime import datetime, timezone
from app.core.deps import SessionDep, CurrentUser
from app.models.measurement import Measurement, MeasurementStatus
from app.models.boq import BOQItem
from app.schemas.measurement import MeasurementCreate, MeasurementResponse
from app.services.audit_service import record_event
from app.models.audit import AuditEventType

router = APIRouter()


@router.get("/{project_id}/measurements", response_model=list[MeasurementResponse])
def list_measurements(project_id: int, session: SessionDep, current_user: CurrentUser):
    return session.exec(
        select(Measurement).where(Measurement.project_id == project_id).order_by(Measurement.created_at.desc())
    ).all()


@router.post("/{project_id}/measurements", response_model=MeasurementResponse, status_code=201)
def create_measurement(project_id: int, data: MeasurementCreate, session: SessionDep, current_user: CurrentUser):
    boq_item = session.get(BOQItem, data.boq_item_id)
    if not boq_item:
        raise HTTPException(status_code=404, detail="BOQ item not found")

    previously_certified = boq_item.certified_quantity
    cumulative = previously_certified + data.current_quantity
    remaining = boq_item.current_approved_quantity - cumulative
    is_overrun = cumulative > boq_item.current_approved_quantity
    overrun_qty = max(0.0, cumulative - boq_item.current_approved_quantity)

    measurement = Measurement(
        project_id=project_id,
        check_request_id=data.check_request_id,
        boq_item_id=data.boq_item_id,
        recorded_by=current_user.id,
        status=MeasurementStatus.RECORDED,
        current_quantity=data.current_quantity,
        previously_certified_quantity=previously_certified,
        cumulative_quantity=cumulative,
        remaining_approved_quantity=remaining,
        measurement_date=data.measurement_date,
        location_description=data.location_description,
        comments=data.comments,
        is_overrun=is_overrun,
        overrun_quantity=overrun_qty,
    )
    session.add(measurement)
    session.commit()
    session.refresh(measurement)

    record_event(
        session=session, event_type=AuditEventType.CREATED,
        entity_type="measurement", entity_id=measurement.id,
        description=f"{current_user.full_name} recorded measurement: {data.current_quantity} {boq_item.unit} for {boq_item.item_code}",
        project_id=project_id, actor=current_user, new_state="recorded",
        event_metadata={"is_overrun": is_overrun, "overrun_quantity": overrun_qty},
    )
    return measurement


@router.get("/{project_id}/measurements/{m_id}", response_model=MeasurementResponse)
def get_measurement(project_id: int, m_id: int, session: SessionDep, current_user: CurrentUser):
    m = session.get(Measurement, m_id)
    if not m or m.project_id != project_id:
        raise HTTPException(status_code=404, detail="Measurement not found")
    return m
