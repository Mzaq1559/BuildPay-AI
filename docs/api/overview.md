# API Overview

The backend exposes a REST API powered by FastAPI.
All endpoints under `/api/v1` require JWT authentication (except `/auth/login` and `/auth/register`).

Features:
- Pydantic models for validation.
- Dependency Injection for DB sessions and current user.
- Bearer token authentication.
