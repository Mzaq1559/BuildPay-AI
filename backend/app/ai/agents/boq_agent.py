"""
BOQ & Activity Agent
Verifies the BOQ item exists, checks quantities and rates.
"""
from sqlmodel import Session, select
from app.models.ai_review import AIFinding, AIFindingSeverity
from app.models.boq import BOQItem
from app.models.check_request import CheckRequest
from app.models.variation import Variation


async def run_boq_agent(
    session: Session,
    entity_id: int,
    entity_type: str,
    project_id: int,
) -> list[AIFinding]:
    findings = []

    if entity_type == "check_request":
        cr = session.get(CheckRequest, entity_id)
        if not cr:
            return [AIFinding(
                review_id=0,
                agent_name="BOQ & Activity Agent",
                severity=AIFindingSeverity.CRITICAL,
                finding="Check Request not found.",
                confidence=1.0,
            )]
        boq_item = session.get(BOQItem, cr.boq_item_id)
        if not boq_item:
            findings.append(AIFinding(
                review_id=0,
                agent_name="BOQ & Activity Agent",
                severity=AIFindingSeverity.CRITICAL,
                finding="BOQ item not found. Request cannot be processed without valid BOQ reference.",
                confidence=0.99,
                evidence=[{"field": "boq_item_id", "value": cr.boq_item_id}],
                recommendation="Verify BOQ item reference and resubmit.",
                is_blocking=True,
            ))
        else:
            # Check if requested quantity exceeds original BOQ
            remaining = boq_item.current_approved_quantity - boq_item.certified_quantity
            if cr.requested_quantity > remaining:
                findings.append(AIFinding(
                    review_id=0,
                    agent_name="BOQ & Activity Agent",
                    severity=AIFindingSeverity.WARNING,
                    finding=f"Requested quantity ({cr.requested_quantity} {cr.unit}) exceeds remaining approved quantity ({remaining:.2f} {boq_item.unit}).",
                    confidence=0.95,
                    evidence=[
                        {"field": "requested_quantity", "value": cr.requested_quantity},
                        {"field": "remaining_approved", "value": remaining},
                        {"field": "current_approved_quantity", "value": boq_item.current_approved_quantity},
                    ],
                    recommendation="A variation may be required. Human review recommended.",
                ))
            else:
                findings.append(AIFinding(
                    review_id=0,
                    agent_name="BOQ & Activity Agent",
                    severity=AIFindingSeverity.OK,
                    finding=f"BOQ item {boq_item.item_code} verified. Requested quantity is within approved limits.",
                    confidence=0.98,
                    evidence=[
                        {"field": "item_code", "value": boq_item.item_code},
                        {"field": "remaining_approved", "value": remaining},
                    ],
                ))

    elif entity_type == "variation":
        variation = session.get(Variation, entity_id)
        if variation:
            boq_item = session.get(BOQItem, variation.boq_item_id)
            if boq_item:
                findings.append(AIFinding(
                    review_id=0,
                    agent_name="BOQ & Activity Agent",
                    severity=AIFindingSeverity.INFO,
                    finding=f"BOQ item {boq_item.item_code} verified. Original BOQ quantity: {boq_item.original_quantity} {boq_item.unit}. Rate: PKR {boq_item.unit_rate:,.0f}.",
                    confidence=0.97,
                    evidence=[
                        {"field": "original_quantity", "value": boq_item.original_quantity},
                        {"field": "unit_rate", "value": boq_item.unit_rate},
                        {"field": "estimated_variation_value", "value": variation.estimated_variation_value},
                    ],
                ))

    return findings
