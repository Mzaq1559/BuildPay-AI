from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from app.core.config import settings
from app.core.db import create_db_and_tables
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    create_db_and_tables()

    # Seed demo users/data only when explicitly enabled.
    # This keeps production deployments safe from accidental demo-data creation.
    if os.getenv("SEED_DEMO_DATA", "").lower() == "true":
        from app.seed.seed_data import seed_all
        seed_all()

    yield


app = FastAPI(
    title="BuildPay AI",
    description="AI-assisted construction project controls and payment platform",
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Keep local development origins while also honoring the deployment-specific
# FRONTEND_URL configured through the environment (e.g. Azure Container Apps).
allowed_origins = list(settings.ALLOWED_ORIGINS)
if settings.FRONTEND_URL and settings.FRONTEND_URL not in allowed_origins:
    allowed_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
def health_check():
    return {"status": "healthy", "app": settings.APP_NAME, "version": settings.APP_VERSION}
