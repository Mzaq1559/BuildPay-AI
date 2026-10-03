from fastapi import APIRouter, HTTPException
from sqlmodel import select
from app.core.deps import SessionDep, CurrentUser
from app.models.boq import BOQ, BOQItem
from app.schemas.boq import BOQResponse, BOQItemResponse, BOQImportType
from app.services.boq_service import import_boq_template, get_boq_with_items

router = APIRouter()


@router.get("/{project_id}/boq", response_model=list[BOQResponse])
def list_boqs(project_id: int, session: SessionDep, current_user: CurrentUser):
    return session.exec(select(BOQ).where(BOQ.project_id == project_id)).all()


@router.post("/{project_id}/boq/import", response_model=BOQResponse, status_code=201)
def import_boq(project_id: int, data: BOQImportType, session: SessionDep, current_user: CurrentUser):
    try:
        boq = import_boq_template(session, project_id, data.boq_type, current_user.id)
        return boq
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{project_id}/boq/{boq_id}/items", response_model=list[BOQItemResponse])
def list_boq_items(project_id: int, boq_id: int, session: SessionDep, current_user: CurrentUser):
    boq, items = get_boq_with_items(session, boq_id)
    if not boq or boq.project_id != project_id:
        raise HTTPException(status_code=404, detail="BOQ not found")
    result = []
    for item in items:
        d = item.model_dump()
        d["remaining_quantity"] = item.current_approved_quantity - item.certified_quantity
        result.append(BOQItemResponse(**d))
    return result


@router.get("/{project_id}/boq/{boq_id}/items/{item_id}", response_model=BOQItemResponse)
def get_boq_item(project_id: int, boq_id: int, item_id: int, session: SessionDep, current_user: CurrentUser):
    item = session.get(BOQItem, item_id)
    if not item or item.boq_id != boq_id:
        raise HTTPException(status_code=404, detail="BOQ item not found")
    d = item.model_dump()
    d["remaining_quantity"] = item.current_approved_quantity - item.certified_quantity
    return BOQItemResponse(**d)
