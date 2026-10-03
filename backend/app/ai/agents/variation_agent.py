"""
Variation in Quantity Agent
Identifies overruns, calculates additional quantities, summarizes justification.
CANNOT approve variations — human authority only.
"""
from sqlmodel import Session
from app.models.ai_review import AIFinding, AIFindingSeverity
from app.models.variation import Variation
from app.models.boq import BOQItem


async def run_variation_agent(
    session: Session,
    entity_id: int,
    entity_type: str,
    project_id: int,
) -> list[AIFinding]:
    findings = []
    if entity_type != "variation":
        return findings

    variation = session.get(Variation, entity_id)
    if not variation:
        return findings

    boq_item = session.get(BOQItem, variation.boq_item_id)

    # Verify quantities are mathematically consistent (deterministic tool)
    expected_revised = variation.current_approved_quantity + variation.proposed_additional_quantity
    if abs(expected_revised - variation.revised_proposed_quantity) > 0.01:
        findings.append(AIFinding(
            review_id=0,
            agent_name="Variation in Quantity Agent",
            severity=AIFindingSeverity.CRITICAL,
            finding=f"Quantity arithmetic inconsistency detected. Expected revised quantity: {expected_revised:.2f}, submitted: {variation.revised_proposed_quantity:.2f}.",
            confidence=1.0,
            evidence=[
                {"field": "current_approved", "value": variation.current_approved_quantity},
                {"field": "proposed_additional", "value": variation.proposed_additional_quantity},
                {"field": "submitted_revised", "value": variation.revised_proposed_quantity},
                {"field": "expected_revised", "value": expected_revised},
            ],
            is_blocking=True,
        ))
    else:
        expected_value = variation.proposed_additional_quantity * variation.boq_rate
        findings.append(AIFinding(
            review_id=0,
            agent_name="Variation in Quantity Agent",
            severity=AIFindingSeverity.INFO,
            finding=f"Variation quantities verified. Proposed additional: {variation.proposed_additional_quantity:.2f} {boq_item.unit if boq_item else ''}. Estimated value: PKR {expected_value:,.0f}. This is an AI estimate — human approval required.",
            confidence=0.95,
            evidence=[
                {"field": "proposed_additional_quantity", "value": variation.proposed_additional_quantity},
                {"field": "boq_rate", "value": variation.boq_rate},
                {"field": "estimated_value", "value": expected_value},
            ],
            recommendation="Review justification and approve, return, or reject. AI cannot approve variations.",
        ))

    # Justification quality check
    if len(variation.justification) < 30:
        findings.append(AIFinding(
            review_id=0,
            agent_name="Variation in Quantity Agent",
            severity=AIFindingSeverity.WARNING,
            finding="Variation justification is brief. Reviewers require adequate justification for variations.",
            confidence=0.88,
            recommendation="Provide detailed justification including reason for overrun.",
        ))

    return findings
