import os
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlmodel import select
from app.core.deps import SessionDep, CurrentUser
from app.core.config import settings
from app.models.document import Document, DocumentEntityType, DocumentStatus
from app.services.audit_service import record_event
from app.models.audit import AuditEventType

router = APIRouter()


@router.post("/documents", response_model=dict, status_code=201)
async def upload_document(
    project_id: int = Form(...),
    entity_type: str = Form(...),
    entity_id: int = Form(...),
    description: str = Form(default=""),
    file: UploadFile = File(...),
    session: SessionDep = ...,
    current_user: CurrentUser = ...,
):
    # Validate file extension
    ext = Path(file.filename).suffix.lower().lstrip(".")
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type .{ext} not allowed")

    # Save file
    upload_path = Path(settings.UPLOAD_DIR) / str(project_id)
    upload_path.mkdir(parents=True, exist_ok=True)
    unique_name = f"{uuid.uuid4()}.{ext}"
    file_path = upload_path / unique_name

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds maximum size")

    with open(file_path, "wb") as f:
        f.write(content)

    doc = Document(
        project_id=project_id,
        entity_type=DocumentEntityType(entity_type),
        entity_id=entity_id,
        filename=unique_name,
        original_filename=file.filename,
        file_path=str(file_path),
        file_size=len(content),
        content_type=file.content_type or "application/octet-stream",
        status=DocumentStatus.UPLOADED,
        description=description,
        uploaded_by=current_user.id,
    )
    session.add(doc)
    session.commit()
    session.refresh(doc)

    record_event(
        session=session, event_type=AuditEventType.UPLOADED,
        entity_type="document", entity_id=doc.id,
        description=f"{current_user.full_name} uploaded {file.filename}",
        project_id=project_id, actor=current_user, new_state="uploaded",
    )
    return {"id": doc.id, "filename": doc.original_filename, "status": doc.status}


@router.get("/documents", response_model=list[dict])
def list_documents(
    project_id: int,
    entity_type: str | None = None,
    entity_id: int | None = None,
    session: SessionDep = ...,
    current_user: CurrentUser = ...,
):
    query = select(Document).where(Document.project_id == project_id)
    if entity_type:
        query = query.where(Document.entity_type == entity_type)
    if entity_id:
        query = query.where(Document.entity_id == entity_id)
    docs = session.exec(query.order_by(Document.created_at.desc())).all()
    return [
        {
            "id": d.id, "original_filename": d.original_filename,
            "status": d.status, "description": d.description,
            "content_type": d.content_type, "file_size": d.file_size,
            "uploaded_by": d.uploaded_by, "created_at": d.created_at,
            "entity_type": d.entity_type, "entity_id": d.entity_id,
        }
        for d in docs
    ]


@router.get("/documents/{doc_id}/download")
def download_document(doc_id: int, session: SessionDep, current_user: CurrentUser):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(path=doc.file_path, filename=doc.original_filename, media_type=doc.content_type)
