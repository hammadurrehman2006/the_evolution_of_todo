"""
Unit tests for Task model
Task ID: T034
"""
import pytest
from datetime import datetime
from src.models.task import Task


class TestTask:
    """Test cases for Task model"""

    def test_create_task_success(self):
        """Test successful task creation with valid data"""
        task = Task.create_task(1, "Test Title", "Test Description")

        assert task.id == 1
        assert task.title == "Test Title"
        assert task.description == "Test Description"
        assert task.completed is False
        assert isinstance(task.created_at, datetime)

    def test_create_task_default_description(self):
        """Test task creation with default empty description"""
        task = Task.create_task(1, "Test Title")

        assert task.title == "Test Title"
        assert task.description == ""

    def test_title_validation_min_length(self):
        """Test title validation - minimum length"""
        with pytest.raises(ValueError, match="Title must be between 1 and 200 characters"):
            Task.create_task(1, "")

    def test_title_validation_max_length(self):
        """Test title validation - maximum length"""
        long_title = "A" * 201
        with pytest.raises(ValueError, match="Title must be between 1 and 200 characters"):
            Task.create_task(1, long_title)

    def test_description_validation_max_length(self):
        """Test description validation - maximum length"""
        long_description = "A" * 1001
        with pytest.raises(ValueError, match="Description must be between 0 and 1000 characters"):
            Task.create_task(1, "Test Title", long_description)

    def test_update_details(self):
        """Test updating task details with validation"""
        task = Task.create_task(1, "Original Title", "Original Description")

        # Update both title and description
        task.update_details("New Title", "New Description")

        assert task.title == "New Title"
        assert task.description == "New Description"

    def test_update_details_partial(self):
        """Test updating task details partially"""
        task = Task.create_task(1, "Original Title", "Original Description")

        # Update only title
        task.update_details(title="New Title")

        assert task.title == "New Title"
        assert task.description == "Original Description"

        # Update only description
        task.update_details(description="New Description")

        assert task.title == "New Title"
        assert task.description == "New Description"