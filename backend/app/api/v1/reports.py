from fastapi import APIRouter, HTTPException
from sqlmodel import select, func
from app.core.deps import SessionDep, CurrentUser
from app.models.check_request import CheckRequest, CheckRequestStatus
from app.models.variation import Variation, VariationStatus
from app.models.ipc import IPC, IPCStatus
from app.models.boq import BOQ, BOQItem
from app.models.project import Project
from app.models.ai_review import AIFinding, AIFindingSeverity

router = APIRouter()


@router.get("/{project_id}/reports/dashboard")
def project_dashboard(project_id: int, session: SessionDep, current_user: CurrentUser):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    all_crs = session.exec(select(CheckRequest).where(CheckRequest.project_id == project_id)).all()
    all_vars = session.exec(select(Variation).where(Variation.project_id == project_id)).all()
    all_ipcs = session.exec(select(IPC).where(IPC.project_id == project_id)).all()
    boqs = session.exec(select(BOQ).where(BOQ.project_id == project_id)).all()

    cr_by_status = {}
    for cr in all_crs:
        cr_by_status[cr.status.value] = cr_by_status.get(cr.status.value, 0) + 1

    var_by_status = {}
    for v in all_vars:
        var_by_status[v.status.value] = var_by_status.get(v.status.value, 0) + 1

    approved_variation_value = sum(
        v.estimated_variation_value for v in all_vars if v.status == VariationStatus.APPROVED
    )
    total_certified = sum(i.current_certified_amount for i in all_ipcs if i.status in [IPCStatus.CERTIFIED, IPCStatus.PAID])
    total_paid = sum(i.net_payable for i in all_ipcs if i.status == IPCStatus.PAID)

    # BOQ totals
    total_boq_value = 0.0
    total_executed = 0.0
    boq_items = []
    for boq in boqs:
        items = session.exec(select(BOQItem).where(BOQItem.boq_id == boq.id)).all()
        for item in items:
            total_boq_value += item.amount
            total_executed += item.executed_quantity * item.unit_rate
            boq_items.append(item)

    progress_pct = round((total_executed / total_boq_value * 100) if total_boq_value > 0 else 0, 1)

    return {
        "project": {"id": project.id, "name": project.name, "status": project.status, "contract_value": project.contract_value, "currency": project.currency},
        "kpis": {
            "open_check_requests": sum(1 for cr in all_crs if cr.status in [CheckRequestStatus.SUBMITTED, CheckRequestStatus.AI_REVIEW, CheckRequestStatus.HUMAN_REVIEW]),
            "total_check_requests": len(all_crs),
            "pending_variations": sum(1 for v in all_vars if v.status in [VariationStatus.SUBMITTED, VariationStatus.HUMAN_REVIEW, VariationStatus.AI_REVIEW]),
            "approved_variation_value": approved_variation_value,
            "total_certified": total_certified,
            "total_paid": total_paid,
            "progress_percent": progress_pct,
            "total_boq_value": total_boq_value,
            "total_ipcs": len(all_ipcs),
        },
        "cr_by_status": cr_by_status,
        "variation_by_status": var_by_status,
        "ipc_timeline": [
            {"ipc_number": i.ipc_number, "period": i.period_number, "gross": i.gross_amount, "net": i.net_payable, "status": i.status}
            for i in sorted(all_ipcs, key=lambda x: x.period_number)
        ],
    }


@router.get("/{project_id}/reports/boq")
def boq_report(project_id: int, session: SessionDep, current_user: CurrentUser):
    boqs = session.exec(select(BOQ).where(BOQ.project_id == project_id)).all()
    result = []
    for boq in boqs:
        items = session.exec(select(BOQItem).where(BOQItem.boq_id == boq.id)).all()
        result.append({
            "boq_id": boq.id, "boq_name": boq.name, "boq_type": boq.boq_type,
            "items": [
                {
                    "item_code": i.item_code, "section": i.section, "description": i.description,
                    "unit": i.unit, "original_quantity": i.original_quantity, "unit_rate": i.unit_rate,
                    "amount": i.amount, "executed_quantity": i.executed_quantity,
                    "certified_quantity": i.certified_quantity,
                    "current_approved_quantity": i.current_approved_quantity,
                    "remaining_quantity": i.current_approved_quantity - i.certified_quantity,
                    "progress_pct": round(i.certified_quantity / i.current_approved_quantity * 100 if i.current_approved_quantity > 0 else 0, 1),
                }
                for i in items
            ]
        })
    return result
