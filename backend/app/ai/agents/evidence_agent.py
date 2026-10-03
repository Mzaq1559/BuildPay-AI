"""
Document & Evidence Agent
Checks required documents and identifies missing/insufficient evidence.
AI explicitly states when evidence is unavailable.
"""
from sqlmodel import Session, select
from app.models.ai_review import AIFinding, AIFindingSeverity
from app.models.document import Document, DocumentEntityType


async def run_evidence_agent(
    session: Session,
    entity_id: int,
    entity_type: str,
    project_id: int,
) -> list[AIFinding]:
    findings = []

    entity_map = {
        "check_request": DocumentEntityType.CHECK_REQUEST,
        "variation": DocumentEntityType.VARIATION,
        "ipc": DocumentEntityType.IPC,
    }
    doc_entity_type = entity_map.get(entity_type)
    if not doc_entity_type:
        return findings

    docs = session.exec(
        select(Document).where(
            Document.entity_type == doc_entity_type,
            Document.entity_id == entity_id,
        )
    ).all()

    if not docs:
        findings.append(AIFinding(
            review_id=0,
            agent_name="Document & Evidence Agent",
            severity=AIFindingSeverity.WARNING,
            finding="No supporting documents found. Evidence is unavailable for this submission.",
            confidence=1.0,
            evidence=[],
            recommendation="Upload required evidence: site photographs, measurement sheets, or relevant certificates.",
        ))
    else:
        from app.models.document import DocumentStatus
        verified = [d for d in docs if d.status == DocumentStatus.VERIFIED]
        unverified = [d for d in docs if d.status == DocumentStatus.UPLOADED]
        rejected = [d for d in docs if d.status == DocumentStatus.REJECTED]

        if rejected:
            findings.append(AIFinding(
                review_id=0,
                agent_name="Document & Evidence Agent",
                severity=AIFindingSeverity.CRITICAL,
                finding=f"{len(rejected)} document(s) have been rejected. Submission should not proceed until rejected evidence is replaced.",
                confidence=0.99,
                evidence=[{"filename": d.original_filename} for d in rejected],
                recommendation="Replace rejected documents before resubmission.",
                is_blocking=True,
            ))
        if unverified and not verified:
            findings.append(AIFinding(
                review_id=0,
                agent_name="Document & Evidence Agent",
                severity=AIFindingSeverity.WARNING,
                finding=f"{len(unverified)} document(s) uploaded but none verified yet. Reviewer should verify evidence.",
                confidence=0.90,
                evidence=[{"filename": d.original_filename, "status": d.status} for d in unverified],
                recommendation="Verify uploaded documents before approving submission.",
            ))
        if verified:
            findings.append(AIFinding(
                review_id=0,
                agent_name="Document & Evidence Agent",
                severity=AIFindingSeverity.OK,
                finding=f"{len(verified)} verified document(s) found. Evidence appears sufficient.",
                confidence=0.88,
                evidence=[{"filename": d.original_filename} for d in verified],
            ))

    return findings
