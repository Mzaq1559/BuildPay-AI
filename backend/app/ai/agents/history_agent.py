"""
History & Duplicate Detection Agent
Compares current records with prior CRs, variations, and IPCs.
"""
from sqlmodel import Session, select
from app.models.ai_review import AIFinding, AIFindingSeverity
from app.models.check_request import CheckRequest, CheckRequestStatus
from app.models.variation import Variation
from app.models.boq import BOQItem


async def run_history_agent(
    session: Session,
    entity_id: int,
    entity_type: str,
    project_id: int,
) -> list[AIFinding]:
    findings = []

    if entity_type == "check_request":
        cr = session.get(CheckRequest, entity_id)
        if not cr:
            return findings

        # Look for similar recent CRs for same BOQ item
        recent_crs = session.exec(
            select(CheckRequest).where(
                CheckRequest.project_id == project_id,
                CheckRequest.boq_item_id == cr.boq_item_id,
                CheckRequest.id != entity_id,
                CheckRequest.status.in_([
                    CheckRequestStatus.APPROVED,
                    CheckRequestStatus.SUBMITTED,
                    CheckRequestStatus.HUMAN_REVIEW,
                ])
            )
        ).all()

        if recent_crs:
            total_prior = sum(r.requested_quantity for r in recent_crs)
            findings.append(AIFinding(
                review_id=0,
                agent_name="History & Duplicate Detection Agent",
                severity=AIFindingSeverity.INFO,
                finding=f"Found {len(recent_crs)} prior Check Request(s) for this BOQ item. Total prior quantity: {total_prior:.2f}.",
                confidence=0.97,
                evidence=[
                    {"cr_number": r.cr_number, "quantity": r.requested_quantity, "status": r.status}
                    for r in recent_crs[:5]
                ],
                recommendation="Ensure this CR does not duplicate previously approved quantities.",
            ))
        else:
            findings.append(AIFinding(
                review_id=0,
                agent_name="History & Duplicate Detection Agent",
                severity=AIFindingSeverity.OK,
                finding="No duplicate or conflicting prior Check Requests found for this BOQ item.",
                confidence=0.95,
            ))

    elif entity_type == "variation":
        variation = session.get(Variation, entity_id)
        if not variation:
            return findings

        prior_variations = session.exec(
            select(Variation).where(
                Variation.project_id == project_id,
                Variation.boq_item_id == variation.boq_item_id,
                Variation.id != entity_id,
            )
        ).all()

        if prior_variations:
            total_prior_value = sum(v.estimated_variation_value for v in prior_variations if v.status == "approved")
            findings.append(AIFinding(
                review_id=0,
                agent_name="History & Duplicate Detection Agent",
                severity=AIFindingSeverity.INFO,
                finding=f"{len(prior_variations)} prior variation(s) found for this BOQ item. Total previously approved value: PKR {total_prior_value:,.0f}.",
                confidence=0.96,
                evidence=[{"variation_number": v.variation_number, "status": v.status, "value": v.estimated_variation_value} for v in prior_variations[:5]],
            ))
        else:
            findings.append(AIFinding(
                review_id=0,
                agent_name="History & Duplicate Detection Agent",
                severity=AIFindingSeverity.OK,
                finding="No prior variations found for this BOQ item.",
                confidence=0.95,
            ))

    return findings
