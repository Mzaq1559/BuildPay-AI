"""
AI Orchestrator for BuildPay AI.
Runs 9 specialized agents sequentially, produces structured findings.
AI findings are recommendations only - humans make all final decisions.
"""
from typing import Optional
from datetime import datetime, timezone
from sqlmodel import Session, select
import json

from app.core.config import settings
from app.models.ai_review import AIReview, AIFinding, AIFindingSeverity
from app.models.check_request import CheckRequest
from app.models.variation import Variation
from app.models.ipc import IPC
from app.ai.agents import (
    run_boq_agent,
    run_check_request_agent,
    run_evidence_agent,
    run_quantity_agent,
    run_compliance_agent,
    run_variation_agent,
    run_history_agent,
    run_ipc_agent,
    run_review_agent,
)


async def run_cr_review(
    session: Session,
    check_request: CheckRequest,
    project_id: int,
) -> AIReview:
    """Run multi-agent AI review for a Check Request."""
    review = AIReview(
        entity_type="check_request",
        entity_id=check_request.id,
        project_id=project_id,
        status="running",
        started_at=datetime.now(timezone.utc),
    )
    session.add(review)
    session.commit()
    session.refresh(review)

    agents_run = []
    all_findings = []

    agent_runners = [
        ("BOQ & Activity Agent", run_boq_agent),
        ("Check Request Agent", run_check_request_agent),
        ("Document & Evidence Agent", run_evidence_agent),
        ("Measurement & Quantity Agent", run_quantity_agent),
        ("Contract Compliance Agent", run_compliance_agent),
        ("History & Duplicate Detection Agent", run_history_agent),
        ("Review & Audit Agent", run_review_agent),
    ]

    for agent_name, runner in agent_runners:
        try:
            findings = await runner(
                session=session,
                entity_id=check_request.id,
                entity_type="check_request",
                project_id=project_id,
            )
            for f in findings:
                f.review_id = review.id
                session.add(f)
                all_findings.append(f)
            agents_run.append(agent_name)
        except Exception as e:
            # Errors are visible, not silent
            err_finding = AIFinding(
                review_id=review.id,
                agent_name=agent_name,
                severity=AIFindingSeverity.WARNING,
                finding=f"Agent encountered an error: {str(e)}",
                confidence=0.0,
                evidence=[],
                recommendation="Review agent logs and retry.",
            )
            session.add(err_finding)
            all_findings.append(err_finding)

    session.commit()

    # Calculate overall confidence
    confidences = [f.confidence for f in all_findings if f.confidence > 0]
    overall_confidence = sum(confidences) / len(confidences) if confidences else 0.0

    # Determine overall recommendation
    has_critical = any(f.severity == AIFindingSeverity.CRITICAL for f in all_findings)
    has_warning = any(f.severity == AIFindingSeverity.WARNING for f in all_findings)
    if has_critical:
        recommendation = "Review required — critical findings identified"
    elif has_warning:
        recommendation = "Proceed with caution — warnings present"
    else:
        recommendation = "No significant issues identified"

    review.status = "completed"
    review.overall_confidence = overall_confidence
    review.overall_recommendation = recommendation
    review.agents_run = agents_run
    review.summary = _build_summary(all_findings)
    review.completed_at = datetime.now(timezone.utc)
    session.add(review)
    session.commit()
    session.refresh(review)
    return review


async def run_variation_review(
    session: Session,
    variation: Variation,
    project_id: int,
) -> AIReview:
    """Run AI review for a Variation."""
    review = AIReview(
        entity_type="variation",
        entity_id=variation.id,
        project_id=project_id,
        status="running",
        started_at=datetime.now(timezone.utc),
    )
    session.add(review)
    session.commit()
    session.refresh(review)

    all_findings = []
    agents_run = []

    agent_runners = [
        ("BOQ & Activity Agent", run_boq_agent),
        ("Measurement & Quantity Agent", run_quantity_agent),
        ("Variation in Quantity Agent", run_variation_agent),
        ("History & Duplicate Detection Agent", run_history_agent),
        ("Review & Audit Agent", run_review_agent),
    ]

    for agent_name, runner in agent_runners:
        try:
            findings = await runner(
                session=session,
                entity_id=variation.id,
                entity_type="variation",
                project_id=project_id,
            )
            for f in findings:
                f.review_id = review.id
                session.add(f)
                all_findings.append(f)
            agents_run.append(agent_name)
        except Exception as e:
            err_finding = AIFinding(
                review_id=review.id,
                agent_name=agent_name,
                severity=AIFindingSeverity.WARNING,
                finding=f"Agent encountered an error: {str(e)}",
                confidence=0.0,
                evidence=[],
            )
            session.add(err_finding)

    session.commit()
    confidences = [f.confidence for f in all_findings if f.confidence > 0]
    overall_confidence = sum(confidences) / len(confidences) if confidences else 0.0
    has_critical = any(f.severity == AIFindingSeverity.CRITICAL for f in all_findings)
    recommendation = "Critical issues — human review required" if has_critical else "Variation appears justified"

    review.status = "completed"
    review.overall_confidence = overall_confidence
    review.overall_recommendation = recommendation
    review.agents_run = agents_run
    review.summary = _build_summary(all_findings)
    review.completed_at = datetime.now(timezone.utc)
    session.add(review)
    session.commit()
    session.refresh(review)
    return review


async def run_ipc_review(
    session: Session,
    ipc: IPC,
    project_id: int,
) -> AIReview:
    """Run AI review for an IPC."""
    review = AIReview(
        entity_type="ipc",
        entity_id=ipc.id,
        project_id=project_id,
        status="running",
        started_at=datetime.now(timezone.utc),
    )
    session.add(review)
    session.commit()
    session.refresh(review)

    all_findings = []
    agents_run = []

    agent_runners = [
        ("Measurement & Quantity Agent", run_quantity_agent),
        ("IPC Preparation & Reconciliation Agent", run_ipc_agent),
        ("History & Duplicate Detection Agent", run_history_agent),
        ("Review & Audit Agent", run_review_agent),
    ]

    for agent_name, runner in agent_runners:
        try:
            findings = await runner(
                session=session,
                entity_id=ipc.id,
                entity_type="ipc",
                project_id=project_id,
            )
            for f in findings:
                f.review_id = review.id
                session.add(f)
                all_findings.append(f)
            agents_run.append(agent_name)
        except Exception as e:
            err_finding = AIFinding(
                review_id=review.id,
                agent_name=agent_name,
                severity=AIFindingSeverity.WARNING,
                finding=f"Agent error: {str(e)}",
                confidence=0.0,
                evidence=[],
            )
            session.add(err_finding)

    session.commit()
    confidences = [f.confidence for f in all_findings if f.confidence > 0]
    overall_confidence = sum(confidences) / len(confidences) if confidences else 0.0
    has_critical = any(f.severity == AIFindingSeverity.CRITICAL for f in all_findings)
    recommendation = "IPC exceptions require human review" if has_critical else "IPC values reconciled — ready for human approval"

    review.status = "completed"
    review.overall_confidence = overall_confidence
    review.overall_recommendation = recommendation
    review.agents_run = agents_run
    review.summary = _build_summary(all_findings)
    review.completed_at = datetime.now(timezone.utc)
    session.add(review)
    session.commit()
    session.refresh(review)
    return review


def _build_summary(findings: list[AIFinding]) -> str:
    ok_count = sum(1 for f in findings if f.severity == AIFindingSeverity.OK)
    warning_count = sum(1 for f in findings if f.severity == AIFindingSeverity.WARNING)
    critical_count = sum(1 for f in findings if f.severity == AIFindingSeverity.CRITICAL)
    return (
        f"{ok_count} checks passed, {warning_count} warnings, {critical_count} critical issues. "
        f"All findings are AI recommendations — human approval required."
    )
