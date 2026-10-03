# Security Model

- **Authentication**: JWT tokens (passwords hashed with bcrypt).
- **Authorization**: RBAC (Role-Based Access Control) enforced at the route level via FastAPI dependencies.
- **Audit**: Immutable `AuditEvent` records tracking who did what and when.
