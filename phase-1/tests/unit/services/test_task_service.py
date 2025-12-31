"""
Unit tests for TaskService
Task ID: T034
"""
import pytest
from src.services.task_service import TaskService
from src.repositories.in_memory_task_repository import InMemoryTaskRepository
from src.models.task import Task


class TestTaskService:
    """Test cases for TaskService"""

    def setup_method(self):
        """Setup method to create a fresh repository and service for each test"""
        self.repo = InMemoryTaskRepository()
        self.service = TaskService(self.repo)

    def test_add_task_success(self):
        """Test adding a task successfully"""
        task = self.service.add_task("Test Title", "Test Description")

        assert task.id is not None
        assert task.title == "Test Title"
        assert task.description == "Test Description"
        assert task.completed is False

    def test_add_task_minimal(self):
        """Test adding a task with minimal parameters"""
        task = self.service.add_task("Test Title")

        assert task.title == "Test Title"
        assert task.description == ""

    def test_add_task_title_validation(self):
        """Test adding a task with invalid title"""
        with pytest.raises(ValueError):
            self.service.add_task("")

    def test_get_all_tasks(self):
        """Test retrieving all tasks"""
        self.service.add_task("Task 1", "Description 1")
        self.service.add_task("Task 2", "Description 2")

        tasks = self.service.get_all_tasks()

        assert len(tasks) == 2

    def test_toggle_task_completion(self):
        """Test toggling task completion status"""
        task = self.service.add_task("Test Title", "Test Description")

        # Initially should be incomplete
        assert task.completed is False

        # Toggle to complete
        toggled_task = self.service.toggle_task_completion(task.id)
        assert toggled_task.completed is True

        # Toggle back to incomplete
        toggled_task2 = self.service.toggle_task_completion(task.id)
        assert toggled_task2.completed is False

    def test_toggle_nonexistent_task(self):
        """Test toggling completion for non-existent task"""
        result = self.service.toggle_task_completion(999)

        assert result is None

    def test_update_task(self):
        """Test updating task details"""
        task = self.service.add_task("Original Title", "Original Description")

        updated_task = self.service.update_task(task.id, "New Title", "New Description")

        assert updated_task.title == "New Title"
        assert updated_task.description == "New Description"

    def test_update_task_partial(self):
        """Test updating task details partially"""
        task = self.service.add_task("Original Title", "Original Description")

        # Update only title
        updated_task = self.service.update_task(task.id, title="New Title")

        assert updated_task.title == "New Title"
        assert updated_task.description == "Original Description"

        # Update only description
        updated_task2 = self.service.update_task(task.id, description="New Description")

        assert updated_task2.title == "New Title"
        assert updated_task2.description == "New Description"

    def test_update_nonexistent_task(self):
        """Test updating non-existent task"""
        result = self.service.update_task(999, "New Title")

        assert result is None

    def test_delete_task(self):
        """Test deleting a task"""
        task = self.service.add_task("Test Title", "Test Description")

        success = self.service.delete_task(task.id)

        assert success is True

    def test_delete_nonexistent_task(self):
        """Test deleting non-existent task"""
        success = self.service.delete_task(999)

        assert success is False

    def test_mark_task_complete(self):
        """Test marking task as complete"""
        task = self.service.add_task("Test Title", "Test Description")
        assert task.completed is False

        completed_task = self.service.mark_task_complete(task.id)
        assert completed_task.completed is True

    def test_mark_task_incomplete(self):
        """Test marking task as incomplete"""
        task = self.service.add_task("Test Title", "Test Description")
        # First mark as complete
        self.service.mark_task_complete(task.id)

        incomplete_task = self.service.mark_task_incomplete(task.id)
        assert incomplete_task.completed is False

    def test_mark_nonexistent_task(self):
        """Test marking non-existent task"""
        result = self.service.mark_task_complete(999)
        assert result is None

        result = self.service.mark_task_incomplete(999)
        assert result is None