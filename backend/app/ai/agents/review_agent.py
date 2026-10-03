"""
Review & Audit Agent
Consolidates findings and prepares human review/audit packages.
"""
from sqlmodel import Session
from app.models.ai_review import AIFinding, AIFindingSeverity


async def run_review_agent(
    session: Session,
    entity_id: int,
    entity_type: str,
    project_id: int,
) -> list[AIFinding]:
    return [
        AIFinding(
            review_id=0,
            agent_name="Review & Audit Agent",
            severity=AIFindingSeverity.INFO,
            finding="AI review package consolidated. All findings above are AI recommendations only. Designated human authority must make the final approval, return, or rejection decision.",
            confidence=1.0,
            recommendation="Review all findings and exercise human judgment before deciding.",
        )
    ]
