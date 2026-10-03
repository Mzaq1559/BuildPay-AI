from fastapi import APIRouter
from app.api.v1 import auth, projects, boq, check_requests, measurements, variations, ipc, documents, audit, notifications, reports

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(boq.router, prefix="/projects", tags=["BOQ"])
api_router.include_router(check_requests.router, prefix="/projects", tags=["Check Requests"])
api_router.include_router(measurements.router, prefix="/projects", tags=["Measurements"])
api_router.include_router(variations.router, prefix="/projects", tags=["Variations"])
api_router.include_router(ipc.router, prefix="/projects", tags=["IPC"])
api_router.include_router(documents.router, prefix="", tags=["Documents"])
api_router.include_router(audit.router, prefix="", tags=["Audit"])
api_router.include_router(notifications.router, prefix="", tags=["Notifications"])
api_router.include_router(reports.router, prefix="/projects", tags=["Reports"])
