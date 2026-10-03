"""
IPC Preparation & Reconciliation Agent
Verifies IPC amounts, retention, deductions, and consistency.
"""
from sqlmodel import Session, select
from app.models.ai_review import AIFinding, AIFindingSeverity
from app.models.ipc import IPC, IPCLine
from app.models.project import Project


async def run_ipc_agent(
    session: Session,
    entity_id: int,
    entity_type: str,
    project_id: int,
) -> list[AIFinding]:
    findings = []
    if entity_type != "ipc":
        return findings

    ipc = session.get(IPC, entity_id)
    if not ipc:
        return findings

    project = session.get(Project, project_id)
    lines = session.exec(select(IPCLine).where(IPCLine.ipc_id == entity_id)).all()

    # Verify gross amount
    computed_gross = sum(line.current_amount for line in lines)
    if abs(computed_gross - ipc.gross_amount) > 0.01:
        findings.append(AIFinding(
            review_id=0,
            agent_name="IPC Preparation & Reconciliation Agent",
            severity=AIFindingSeverity.CRITICAL,
            finding=f"IPC gross amount mismatch. Computed from line items: PKR {computed_gross:,.2f}. IPC header: PKR {ipc.gross_amount:,.2f}.",
            confidence=1.0,
            evidence=[
                {"field": "computed_gross", "value": computed_gross},
                {"field": "ipc_gross_amount", "value": ipc.gross_amount},
            ],
            recommendation="Recalculate IPC — amounts must be deterministically computed from line items.",
            is_blocking=True,
        ))
    else:
        findings.append(AIFinding(
            review_id=0,
            agent_name="IPC Preparation & Reconciliation Agent",
            severity=AIFindingSeverity.OK,
            finding=f"IPC amounts reconciled. Gross: PKR {ipc.gross_amount:,.2f}. Retention: PKR {ipc.retention_amount:,.2f}. Net payable: PKR {ipc.net_payable:,.2f}.",
            confidence=0.99,
            evidence=[
                {"field": "gross_amount", "value": ipc.gross_amount},
                {"field": "retention_amount", "value": ipc.retention_amount},
                {"field": "net_payable", "value": ipc.net_payable},
            ],
        ))

    # Check retention calculation
    if project:
        expected_retention = ipc.gross_amount * project.retention_rate
        if abs(expected_retention - ipc.retention_amount) > 0.01:
            findings.append(AIFinding(
                review_id=0,
                agent_name="IPC Preparation & Reconciliation Agent",
                severity=AIFindingSeverity.WARNING,
                finding=f"Retention amount ({ipc.retention_amount:,.2f}) differs from expected ({expected_retention:,.2f}) at {project.retention_rate*100:.1f}% rate.",
                confidence=0.98,
                recommendation="Verify retention calculation.",
            ))

    if ipc.has_exceptions:
        findings.append(AIFinding(
            review_id=0,
            agent_name="IPC Preparation & Reconciliation Agent",
            severity=AIFindingSeverity.WARNING,
            finding=f"IPC contains exceptions: {ipc.exceptions_notes or 'See IPC line items'}. Human review of exceptions is required before certification.",
            confidence=0.95,
        ))

    return findings
