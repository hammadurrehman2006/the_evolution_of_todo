"""Integration tests for Task Management API."""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from datetime import datetime, timezone
import jwt
from config import settings
from main import app
from database import get_session, create_db_and_tables
from models import User


# Override database dependency for testing
@pytest.fixture(name="client")
def client_fixture():
    """Create test client with test database."""
    # Create in-memory SQLite database
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    
    # Create test user
    with Session(engine) as session:
        user = User(
            id="test-user-id",
            name="Test User",
            email="test@example.com",
            emailVerified=True,
            createdAt=datetime.now(timezone.utc),
            updatedAt=datetime.now(timezone.utc)
        )
        session.add(user)
        session.commit()
    
    def override_get_session():
        with Session(engine) as session:
            yield session
    
    # Override dependencies
    app.dependency_overrides[get_session] = override_get_session
    
    # Skip the startup event that creates tables (we already did it)
    # by not using the lifespan context
    with TestClient(app, raise_server_exceptions=False) as client:
        yield client
    
    app.dependency_overrides.clear()


@pytest.fixture(name="auth_headers")
def auth_headers_fixture():
    """Create JWT token for authentication."""
    token = jwt.encode(
        {
            "sub": "test-user-id",
            "exp": datetime.now(timezone.utc).timestamp() + 3600
        },
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm
    )
    return {"Authorization": f"Bearer {token}"}


class TestHealthEndpoint:
    """Test health check endpoint."""
    
    def test_health_check(self, client):
        """Test health endpoint returns healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert data["version"] == "1.0.0"


class TestTasksEndpoint:
    """Test task CRUD endpoints."""
    
    def test_create_task(self, client, auth_headers):
        """Test creating a new task."""
        task_data = {
            "title": "Test Task",
            "description": "Test Description",
            "priority": "High",
            "tags": ["test", "integration"]
        }
        response = client.post("/tasks/", json=task_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Task"
        assert data["description"] == "Test Description"
        assert data["priority"] == "High"
        assert data["completed"] is False
        assert "id" in data
    
    def test_get_tasks(self, client, auth_headers):
        """Test getting all tasks."""
        # Create a task first
        task_data = {"title": "Test Task"}
        client.post("/tasks/", json=task_data, headers=auth_headers)
        
        # Get all tasks
        response = client.get("/tasks/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) >= 1
    
    def test_get_task_by_id(self, client, auth_headers):
        """Test getting a single task by ID."""
        # Create a task
        task_data = {"title": "Single Task"}
        create_response = client.post("/tasks/", json=task_data, headers=auth_headers)
        task_id = create_response.json()["id"]
        
        # Get the task
        response = client.get(f"/tasks/{task_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == task_id
        assert data["title"] == "Single Task"
    
    def test_update_task(self, client, auth_headers):
        """Test updating a task."""
        # Create a task
        task_data = {"title": "Update Task"}
        create_response = client.post("/tasks/", json=task_data, headers=auth_headers)
        task_id = create_response.json()["id"]
        
        # Update the task
        update_data = {"title": "Updated Task", "completed": True}
        response = client.put(f"/tasks/{task_id}", json=update_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Task"
        assert data["completed"] is True
    
    def test_delete_task(self, client, auth_headers):
        """Test deleting a task."""
        # Create a task
        task_data = {"title": "Delete Task"}
        create_response = client.post("/tasks/", json=task_data, headers=auth_headers)
        task_id = create_response.json()["id"]
        
        # Delete the task
        response = client.delete(f"/tasks/{task_id}", headers=auth_headers)
        assert response.status_code == 204
        
        # Verify it's deleted
        get_response = client.get(f"/tasks/{task_id}", headers=auth_headers)
        assert get_response.status_code == 404
    
    def test_toggle_task(self, client, auth_headers):
        """Test toggling task completion."""
        # Create a task
        task_data = {"title": "Toggle Task"}
        create_response = client.post("/tasks/", json=task_data, headers=auth_headers)
        task_id = create_response.json()["id"]
        
        # Toggle the task
        response = client.post(f"/tasks/{task_id}/toggle", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["task"]["completed"] is True
    
    def test_filter_tasks_by_priority(self, client, auth_headers):
        """Test filtering tasks by priority."""
        # Create tasks with different priorities
        client.post("/tasks/", json={"title": "High Priority", "priority": "High"}, headers=auth_headers)
        client.post("/tasks/", json={"title": "Low Priority", "priority": "Low"}, headers=auth_headers)
        
        # Filter by high priority
        response = client.get("/tasks/?priority=High", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["priority"] == "High"
    
    def test_search_tasks(self, client, auth_headers):
        """Test searching tasks by keyword."""
        # Create tasks
        client.post("/tasks/", json={"title": "Find Me", "description": "Special task"}, headers=auth_headers)
        client.post("/tasks/", json={"title": "Other Task"}, headers=auth_headers)
        
        # Search for "Find"
        response = client.get("/tasks/?q=Find", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert "Find Me" in data["items"][0]["title"]


class TestAuthentication:
    """Test authentication and authorization."""
    
    def test_unauthorized_access(self, client):
        """Test that tasks endpoint requires authentication."""
        response = client.get("/tasks/")
        assert response.status_code in [401, 403]
    
    def test_invalid_token(self, client):
        """Test that invalid token is rejected."""
        headers = {"Authorization": "Bearer invalid-token"}
        response = client.get("/tasks/", headers=headers)
        assert response.status_code == 401
    
    def test_expired_token(self, client):
        """Test that expired token is rejected."""
        # Create expired token
        token = jwt.encode(
            {
                "sub": "test-user-id",
                "exp": datetime.now(timezone.utc).timestamp() - 3600  # Expired 1 hour ago
            },
            settings.jwt_secret,
            algorithm=settings.jwt_algorithm
        )
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/tasks/", headers=headers)
        assert response.status_code == 401


class TestIdempotency:
    """Test idempotency features."""
    
    def test_create_task_with_client_request_id(self, client, auth_headers):
        """Test creating task with idempotency key."""
        task_data = {
            "title": "Idempotent Task",
            "client_request_id": "unique-request-123"
        }
        
        # Create task first time
        response1 = client.post("/tasks/", json=task_data, headers=auth_headers)
        assert response1.status_code == 201
        task_id_1 = response1.json()["id"]
        
        # Create task with same client_request_id
        response2 = client.post("/tasks/", json=task_data, headers=auth_headers)
        # Should return existing task (idempotent)
        assert response2.status_code in [201, 400]  # Depends on implementation
