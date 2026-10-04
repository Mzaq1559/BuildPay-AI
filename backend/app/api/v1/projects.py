from fastapi import APIRouter, HTTPException
from sqlmodel import select
from app.core.deps import SessionDep, CurrentUser
from app.models.project import Project
from app.models.check_request import CheckRequest, CheckRequestStatus
from app.models.variation import Variation, VariationStatus
from app.models.ai_review import AIReview, AIFinding, AIFindingSeverity
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectSummary
from app.services.audit_service import record_event
from app.models.audit import AuditEventType
from datetime import datetime, timezone

router = APIRouter()


@router.get("", response_model=list[ProjectResponse])
def list_projects(session: SessionDep, current_user: CurrentUser):
    return session.exec(select(Project).order_by(Project.created_at.desc())).all()


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(data: ProjectCreate, session: SessionDep, current_user: CurrentUser):
    existing = session.exec(select(Project).where(Project.project_number == data.project_number)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Project number already exists")
    project = Project(**data.model_dump(), created_by=current_user.id)
    session.add(project)
    session.commit()
    session.refresh(project)
    record_event(
        session=session, event_type=AuditEventType.CREATED,
        entity_type="project", entity_id=project.id,
        entity_reference=project.project_number,
        description=f"{current_user.full_name} created project {project.name}",
        project_id=project.id, actor=current_user, new_state="active",
    )
    return project


@router.get("/{project_id}", response_model=ProjectSummary)
def get_project(project_id: int, session: SessionDep, current_user: CurrentUser):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    open_crs = session.exec(
        select(CheckRequest).where(
            CheckRequest.project_id == project_id,
            CheckRequest.status.in_([CheckRequestStatus.SUBMITTED, CheckRequestStatus.HUMAN_REVIEW, CheckRequestStatus.AI_REVIEW])
        )
    ).all()
    pending_vars = session.exec(
        select(Variation).where(
            Variation.project_id == project_id,
            Variation.status.in_([VariationStatus.SUBMITTED, VariationStatus.HUMAN_REVIEW])
        )
    ).all()
    ai_flags = session.exec(
        select(AIFinding).join(AIReview, AIFinding.review_id == AIReview.id).where(
            AIReview.project_id == project_id,
            AIFinding.severity.in_([AIFindingSeverity.WARNING, AIFindingSeverity.CRITICAL]),
        )
    ).all()
    return ProjectSummary(
        **project.model_dump(),
        open_check_requests=len(open_crs),
        pending_variations=len(pending_vars),
        ai_flags=len(ai_flags),
    )


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, data: ProjectUpdate, session: SessionDep, current_user: CurrentUser):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(project, field, value)
    project.updated_at = datetime.now(timezone.utc)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project
