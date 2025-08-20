"""
Test configuration and fixtures
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import Base, get_db


# Create in-memory SQLite database for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for tests"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    """Create test client with test database"""
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user():
    """Create a test user fixture"""
    return {
        "email": "test@example.com",
        "password": "testpass123",
        "full_name": "Test User",
        "phone_number": "+66812345678"
    }


@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers for test user"""
    # Register user
    client.post("/register", json=test_user)
    
    # Login
    response = client.post("/login", json={
        "email": test_user["email"],
        "password": test_user["password"]
    })
    
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}