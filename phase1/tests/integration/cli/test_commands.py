"""
Integration tests for CLI commands
Task ID: T034
"""
import io
import sys
from contextlib import redirect_stdout, redirect_stderr
from src.cli.commands import Commands
from src.services.task_service import TaskService
from src.repositories.in_memory_task_repository import InMemoryTaskRepository


class TestCLICommands:
    """Integration tests for CLI commands"""

    def setup_method(self):
        """Setup method to create a fresh environment for each test"""
        self.repo = InMemoryTaskRepository()
        self.service = TaskService(self.repo)
        self.commands = Commands(self.service)

    def test_add_command(self):
        """Test the add command"""
        # Capture output
        f = io.StringIO()
        with redirect_stdout(f):
            self.commands.add_command(["Test Title", "Test Description"])

        output = f.getvalue()
        assert "Task added successfully" in output

    def test_list_command(self):
        """Test the list command"""
        # Add a task first
        self.service.add_task("Test Title", "Test Description")

        # Capture output
        f = io.StringIO()
        with redirect_stdout(f):
            self.commands.list_command()

        output = f.getvalue()
        assert "Test" in output
        assert "Pending" in output

    def test_complete_command(self):
        """Test the complete command"""
        # Add a task first
        task = self.service.add_task("Test Title", "Test Description")

        # Capture output
        f = io.StringIO()
        with redirect_stdout(f):
            self.commands.complete_command([str(task.id)])

        output = f.getvalue()
        assert "marked as complete" in output

        # Verify the task is actually marked as complete
        updated_task = self.service.toggle_task_completion(task.id)  # Toggle again to check
        assert updated_task.completed is False  # Should be False since we toggled it back

    def test_update_command(self):
        """Test the update command"""
        # Add a task first
        task = self.service.add_task("Original Title", "Original Description")

        # Capture output
        f = io.StringIO()
        with redirect_stdout(f):
            self.commands.update_command([str(task.id), "Updated Title", "Updated Description"])

        output = f.getvalue()
        assert "updated successfully" in output

        # Verify the task was actually updated
        all_tasks = self.service.get_all_tasks()
        updated_task = next((t for t in all_tasks if t.id == task.id), None)
        assert updated_task is not None
        assert updated_task.title == "Updated Title"
        assert updated_task.description == "Updated Description"

    def test_delete_command(self):
        """Test the delete command"""
        # Add a task first
        task = self.service.add_task("Test Title", "Test Description")

        # Capture output
        f = io.StringIO()
        with redirect_stdout(f):
            self.commands.delete_command([str(task.id)])

        output = f.getvalue()
        assert "deleted successfully" in output

        # Verify the task was actually deleted
        all_tasks = self.service.get_all_tasks()
        assert len(all_tasks) == 0