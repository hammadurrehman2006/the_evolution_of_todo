import pytest
from sqlmodel import SQLModel, create_engine, Session
from src.logic import TaskManager
from src.models import CreateTaskInput, UpdateTaskInput, TaskFilter
from src import database
import os

# Use SQLite in-memory for tests
TEST_DATABASE_URL = "sqlite://"

@pytest.fixture(name="session")
def session_fixture():
    # Use a file-based SQLite for testing to ensure visibility across connections if needed,
    # though in-memory should work if we use the same engine.
    test_engine = create_engine("sqlite:///test_mcp.db", connect_args={"check_same_thread": False})
    
    # Patch BEFORE creating tables to ensure metadata is bound to this engine
    old_engine = database.engine
    database.engine = test_engine
    
    SQLModel.metadata.create_all(test_engine)
    
    with Session(test_engine) as session:
        yield session
    
    SQLModel.metadata.drop_all(test_engine)
    database.engine = old_engine
    if os.path.exists("test_mcp.db"):
        os.remove("test_mcp.db")

@pytest.fixture
def manager(session):
    return TaskManager()

def test_create_task(manager):
    task = manager.create_task(CreateTaskInput(title="Test Task"))
    assert task.title == "Test Task"
    assert task.id is not None
    assert len(manager.read_tasks()) == 1

def test_read_tasks_filter(manager):
    manager.create_task(CreateTaskInput(title="Task 1", priority="High"))
    manager.create_task(CreateTaskInput(title="Task 2", priority="Low"))
    
    high_tasks = manager.read_tasks(TaskFilter(priority="High"))
    assert len(high_tasks) == 1
    assert high_tasks[0].title == "Task 1"

def test_create_task_idempotency(manager):
    request_id = "unique-req-123"
    task1 = manager.create_task(CreateTaskInput(title="Idempotent Task", client_request_id=request_id))
    task2 = manager.create_task(CreateTaskInput(title="Idempotent Task", client_request_id=request_id))
    
    assert task1.id == task2.id
    assert len(manager.read_tasks()) == 1

def test_update_task(manager):
    task = manager.create_task(CreateTaskInput(title="Old Title"))
    updated = manager.update_task(UpdateTaskInput(task_id=task.id, title="New Title", completed=True))
    
    assert updated.title == "New Title"
    assert updated.completed is True
    
    stored = manager.get_task(task.id)
    assert stored.title == "New Title"

def test_delete_task(manager):
    task = manager.create_task(CreateTaskInput(title="To Delete"))
    assert manager.delete_task(task.id) is True
    assert manager.get_task(task.id) is None
    assert manager.delete_task("non-existent") is False

def test_error_handling_rollback(manager, monkeypatch):
    from sqlmodel import Session
    # Simulate a database error during commit
    def mock_commit(self):
        raise Exception("Database explosion")
    monkeypatch.setattr(Session, "commit", mock_commit)
    
    with pytest.raises(RuntimeError) as excinfo:
        manager.create_task(CreateTaskInput(title="Fail Me"))
    assert "Failed to create task" in str(excinfo.value)