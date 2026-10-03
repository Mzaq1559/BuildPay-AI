# Environment Variables

| Variable | Required | Used By | Purpose | Example |
|---|---|---|---|---|
| POSTGRES_DB | Yes | docker-compose | DB name | buildpay |
| DATABASE_URL | Yes | backend | Connection string | postgresql://... |
| SECRET_KEY | Yes | backend | JWT signing | dev-secret-key... |
| GROQ_API_KEY | Yes | backend | AI Integration | gsk_... |
| NEXT_PUBLIC_API_URL| Yes | frontend | Backend API URL | http://localhost:8000/api/v1 |
