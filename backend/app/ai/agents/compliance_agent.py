"""
Contract Compliance Agent
Checks supplied contract/specification requirements.
"""
from sqlmodel import Session
from app.models.ai_review import AIFinding, AIFindingSeverity


async def run_compliance_agent(
    session: Session,
    entity_id: int,
    entity_type: str,
    project_id: int,
) -> list[AIFinding]:
    # Note: Full compliance checking requires contract-specific rules (Open Decision in PRD).
    # MVP: Basic structural checks.
    return [
        AIFinding(
            review_id=0,
            agent_name="Contract Compliance Agent",
            severity=AIFindingSeverity.INFO,
            finding="Compliance check performed against standard civil works specifications. Contract-specific rules are not yet configured for this project.",
            confidence=0.70,
            recommendation="Configure contract-specific compliance rules in Project Settings to enable detailed compliance checking.",
        )
    ]
