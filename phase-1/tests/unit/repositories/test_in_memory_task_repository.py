"""
Unit tests for InMemoryTaskRepository
Task ID: T034
"""
import pytest
from src.repositories.in_memory_task_repository import InMemoryTaskRepository
from src.models.task import Task


class TestInMemoryTaskRepository:
    """Test cases for InMemoryTaskRepository"""

    def test_create_task(self):
        """Test creating a task"""
        repo = InMemoryTaskRepository()
        task = Task.create_task(0, "Test Title", "Test Description")

        created_task = repo.create(task)

        assert created_task.id is not None
        assert created_task.title == "Test Title"
        assert created_task.description == "Test Description"

    def test_get_task_by_id(self):
        """Test retrieving a task by ID"""
        repo = InMemoryTaskRepository()
        task = Task.create_task(1, "Test Title", "Test Description")
        repo.create(task)

        retrieved_task = repo.get_by_id(1)

        assert retrieved_task is not None
        assert retrieved_task.id == 1
        assert retrieved_task.title == "Test Title"

    def test_get_nonexistent_task(self):
        """Test retrieving a non-existent task"""
        repo = InMemoryTaskRepository()

        retrieved_task = repo.get_by_id(999)

        assert retrieved_task is None

    def test_get_all_tasks(self):
        """Test retrieving all tasks"""
        repo = InMemoryTaskRepository()
        task1 = Task.create_task(1, "Test Title 1", "Test Description 1")
        task2 = Task.create_task(2, "Test Title 2", "Test Description 2")
        repo.create(task1)
        repo.create(task2)

        all_tasks = repo.get_all()

        assert len(all_tasks) == 2
        assert any(task.id == 1 for task in all_tasks)
        assert any(task.id == 2 for task in all_tasks)

    def test_update_task(self):
        """Test updating a task"""
        repo = InMemoryTaskRepository()
        original_task = Task.create_task(1, "Original Title", "Original Description")
        repo.create(original_task)

        updated_task = Task.create_task(1, "Updated Title", "Updated Description")
        result = repo.update(1, updated_task)

        assert result is not None
        assert result.title == "Updated Title"
        assert result.description == "Updated Description"

    def test_update_nonexistent_task(self):
        """Test updating a non-existent task"""
        repo = InMemoryTaskRepository()
        task = Task.create_task(1, "Updated Title", "Updated Description")

        result = repo.update(999, task)

        assert result is None

    def test_delete_task(self):
        """Test deleting a task"""
        repo = InMemoryTaskRepository()
        task = Task.create_task(1, "Test Title", "Test Description")
        repo.create(task)

        success = repo.delete(1)

        assert success is True
        assert repo.get_by_id(1) is None

    def test_delete_nonexistent_task(self):
        """Test deleting a non-existent task"""
        repo = InMemoryTaskRepository()

        success = repo.delete(999)

        assert success is False

    def test_exists_method(self):
        """Test exists method"""
        repo = InMemoryTaskRepository()
        task = Task.create_task(1, "Test Title", "Test Description")
        repo.create(task)

        assert repo.exists(1) is True
        assert repo.exists(999) is False