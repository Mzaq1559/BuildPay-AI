import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session, select
from sqlmodel.pool import StaticPool
from app.main import app
from app.core.db import get_session
from app.seed.seed_data import seed_all
from app.models.user import User

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture(name="seeded_session")
def seeded_session_fixture(session: Session, client: TestClient):
    import app.core.db as db_core
    import app.seed.seed_data as seed_module
    
    original_core_engine = db_core.engine
    original_seed_engine = seed_module.engine
    
    db_core.engine = session.bind
    seed_module.engine = session.bind
    
    try:
        seed_all()
    finally:
        db_core.engine = original_core_engine
        seed_module.engine = original_seed_engine
        
    yield session

@pytest.fixture
def auth_headers(client: TestClient, seeded_session):
    def _auth_headers(email: str):
        response = client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "BuildPay2024!"}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    return _auth_headers

def test_health_check(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_seed_data(seeded_session: Session):
    # If seed_all succeeds without throwing, and we can query a user, it worked
    user = seeded_session.exec(select(User).where(User.email == "admin@buildpay.ai")).first()
    assert user is not None

def test_projects_endpoint(client: TestClient, auth_headers):
    headers = auth_headers("ahmed.contractor@dha.pk")
    response = client.get("/api/v1/projects", headers=headers)
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) > 0

def test_check_requests_workflow(client: TestClient, auth_headers):
    headers = auth_headers("ahmed.contractor@dha.pk")
    response = client.get("/api/v1/projects/1/check-requests", headers=headers)
    assert response.status_code == 200
    crs = response.json()
    assert len(crs) >= 0

def test_ipcs_endpoint(client: TestClient, auth_headers):
    headers = auth_headers("ahmed.contractor@dha.pk")
    response = client.get("/api/v1/projects/1/ipc", headers=headers)
    assert response.status_code == 200
    ipcs = response.json()
    assert len(ipcs) >= 0
