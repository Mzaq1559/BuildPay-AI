# Deployment Overview

The current configuration is tailored for local development via `docker-compose.yml`.

Production deployment will require:
- Managed PostgreSQL (e.g., AWS RDS, Azure Postgres).
- Container hosting (e.g., AWS ECS, Azure Container Apps, or Kubernetes).
- Cloud storage for documents (S3/Blob Storage) instead of local volumes.
