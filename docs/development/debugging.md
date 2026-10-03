# Debugging Guide

### Containers not starting
```bash
docker compose logs backend
```

### Backend Import Error
Rebuild the container:
```bash
docker compose build backend
```

### Frontend cannot reach backend
Verify `NEXT_PUBLIC_API_URL` is correct in frontend environment.
