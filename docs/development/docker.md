# Docker Architecture

- `postgres`: PostgreSQL 16 Alpine. Volume `postgres_data` persists data.
- `backend`: FastAPI Python server on port 8000. Waits for DB health check.
- `frontend`: Next.js Node server on port 3000.

PostgreSQL port is not exposed to the host by default to ensure security and prevent conflicts.
