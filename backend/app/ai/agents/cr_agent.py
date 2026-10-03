"""
Check Request Agent
Validates the CR fields, checks description quality, unit match.
"""
from sqlmodel import Session
from app.models.ai_review import AIFinding, AIFindingSeverity
from app.models.check_request import CheckRequest
from app.models.boq import BOQItem


async def run_check_request_agent(
    session: Session,
    entity_id: int,
    entity_type: str,
    project_id: int,
) -> list[AIFinding]:
    findings = []
    if entity_type != "check_request":
        return findings

    cr = session.get(CheckRequest, entity_id)
    if not cr:
        return findings

    boq_item = session.get(BOQItem, cr.boq_item_id)

    # Check unit consistency
    if boq_item and cr.unit.upper() != boq_item.unit.upper():
        findings.append(AIFinding(
            review_id=0,
            agent_name="Check Request Agent",
            severity=AIFindingSeverity.WARNING,
            finding=f"Unit mismatch: CR uses '{cr.unit}' but BOQ specifies '{boq_item.unit}'.",
            confidence=0.96,
            evidence=[
                {"field": "cr_unit", "value": cr.unit},
                {"field": "boq_unit", "value": boq_item.unit},
            ],
            recommendation="Confirm correct unit of measurement with site team.",
        ))
    else:
        findings.append(AIFinding(
            review_id=0,
            agent_name="Check Request Agent",
            severity=AIFindingSeverity.OK,
            finding="Check Request fields validated. Unit of measurement consistent with BOQ.",
            confidence=0.94,
        ))

    # Check description quality
    if len(cr.description) < 20:
        findings.append(AIFinding(
            review_id=0,
            agent_name="Check Request Agent",
            severity=AIFindingSeverity.WARNING,
            finding="Description is very brief. A more detailed description helps reviewers and auditors.",
            confidence=0.85,
            recommendation="Provide a detailed description of the work being requested.",
        ))

    # Check for zero quantity
    if cr.requested_quantity <= 0:
        findings.append(AIFinding(
            review_id=0,
            agent_name="Check Request Agent",
            severity=AIFindingSeverity.CRITICAL,
            finding="Requested quantity is zero or negative. This is invalid.",
            confidence=1.0,
            is_blocking=True,
        ))

    return findings
