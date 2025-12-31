"""
CLI command handlers for the Todo Console Application
Used by main.py for command processing
"""
import logging
import os
from typing import List, Optional
from src.services.task_service import TaskService

logger = logging.getLogger(__name__)


class Commands:
    """
    Handles CLI commands for the todo application
    """

    def __init__(self, task_service: TaskService):
        self.task_service = task_service

    def help_command(self):
        """
        Show available commands
        Task ID: T032 for help command implementation
        """
        print("\nAvailable commands:")
        print("  add \"title\" \"description\"     - Add a new task")
        print("  list                           - List all tasks with status")
        print("  update <id> \"title\" \"desc\"    - Update a task")
        print("  complete <id>                  - Mark a task as complete")
        print("  incomplete <id>                - Mark a task as incomplete")
        print("  delete <id>                    - Delete a task")
        print("  clear                          - Clear the terminal screen")
        print("  clear_all                      - Clear all tasks")
        print("  help                           - Show this help message")
        print("  exit                           - Exit the application")
        print()

    def add_command(self, args: List[str]):
        """
        Handle the add command
        Task ID: T012, T013 for US1 implementation
        """
        if len(args) < 1:
            logger.warning("Add command called with insufficient arguments")
            print("Usage: add \"title\" [\"description\"]")
            return

        title = args[0].strip('"')
        description = ""
        if len(args) > 1:
            description = args[1].strip('"')

        logger.info(f"Adding task: title='{title}', description='{description}'")
        try:
            task = self.task_service.add_task(title, description)
            logger.info(f"Task added successfully with ID: {task.id}")
            print(f"Task added successfully with ID: {task.id}")
        except ValueError as e:
            logger.error(f"Error adding task: {e}")
            print(f"Error: {e}")

    def list_command(self):
        """
        Handle the list command
        Task ID: T016, T017 for US2 implementation
        """
        logger.info("Listing all tasks")
        tasks = self.task_service.get_all_tasks()

        if not tasks:
            logger.info("No tasks found")
            print("No tasks found.")
            return

        logger.info(f"Found {len(tasks)} tasks")
        print("\nID  | Status    | Title              | Description")
        print("-" * 60)
        for task in tasks:
            status = "Complete" if task.completed else "Pending"
            # Truncate title and description to fit in columns
            title = task.title[:16]  # Limit title to 16 chars
            description = task.description[:20] if task.description else "(no description)"  # Limit description to 20 chars
            print(f"{task.id:<3} | {status:<9} | {title:<16} | {description}")
        print()

    def complete_command(self, args: List[str]):
        """
        Handle the complete command
        Task ID: T020, T021 for US3 implementation
        """
        if len(args) != 1:
            logger.warning("Complete command called with incorrect number of arguments")
            print("Usage: complete <id>")
            return

        try:
            task_id = int(args[0])
            logger.info(f"Marking task {task_id} as complete")
            task = self.task_service.mark_task_complete(task_id)
            if task:
                logger.info(f"Task {task_id} marked as complete")
                print(f"Task {task_id} marked as complete.")
            else:
                logger.warning(f"Task {task_id} not found for completion")
                print(f"Task {task_id} not found.")
        except ValueError:
            logger.error("Invalid task ID provided to complete command")
            print("Error: Task ID must be a number.")

    def incomplete_command(self, args: List[str]):
        """
        Handle the incomplete command
        Task ID: T020, T021 for US3 implementation
        """
        if len(args) != 1:
            logger.warning("Incomplete command called with incorrect number of arguments")
            print("Usage: incomplete <id>")
            return

        try:
            task_id = int(args[0])
            logger.info(f"Marking task {task_id} as incomplete")
            task = self.task_service.mark_task_incomplete(task_id)
            if task:
                logger.info(f"Task {task_id} marked as incomplete")
                print(f"Task {task_id} marked as incomplete.")
            else:
                logger.warning(f"Task {task_id} not found for marking incomplete")
                print(f"Task {task_id} not found.")
        except ValueError:
            logger.error("Invalid task ID provided to incomplete command")
            print("Error: Task ID must be a number.")

    def update_command(self, args: List[str]):
        """
        Handle the update command
        Task ID: T024, T025 for US4 implementation
        """
        if len(args) < 2:
            logger.warning("Update command called with insufficient arguments")
            print("Usage: update <id> \"title\" [\"description\"]")
            return

        try:
            task_id = int(args[0])
            title = args[1].strip('"')
            description = ""
            if len(args) > 2:
                description = args[2].strip('"')

            logger.info(f"Updating task {task_id}: title='{title}', description='{description}'")
            task = self.task_service.update_task(task_id, title, description)
            if task:
                logger.info(f"Task {task_id} updated successfully")
                print(f"Task {task_id} updated successfully.")
            else:
                logger.warning(f"Task {task_id} not found for update")
                print(f"Task {task_id} not found.")
        except ValueError as e:
            logger.error(f"Error updating task {task_id}: {e}")
            print(f"Error: {e}")

    def delete_command(self, args: List[str]):
        """
        Handle the delete command
        Task ID: T028, T029 for US5 implementation
        """
        if len(args) != 1:
            logger.warning("Delete command called with incorrect number of arguments")
            print("Usage: delete <id>")
            return

        try:
            task_id = int(args[0])
            logger.info(f"Deleting task {task_id}")
            success = self.task_service.delete_task(task_id)
            if success:
                logger.info(f"Task {task_id} deleted successfully")
                print(f"Task {task_id} deleted successfully.")
            else:
                logger.warning(f"Task {task_id} not found for deletion")
                print(f"Task {task_id} not found.")
        except ValueError:
            logger.error("Invalid task ID provided to delete command")
            print("Error: Task ID must be a number.")

    def clear_command(self):
        """
        Clear the terminal screen
        """
        # Clear screen based on OS
        os.system('cls' if os.name == 'nt' else 'clear')

    def clear_all_command(self):
        """
        Clear all tasks from the repository
        """
        logger.info("Clearing all tasks")
        tasks = self.task_service.get_all_tasks()
        task_count = len(tasks)

        if task_count == 0:
            print("No tasks to clear.")
            return

        # Delete all tasks
        for task in tasks:
            self.task_service.delete_task(task.id)

        logger.info(f"All {task_count} tasks have been cleared")
        print(f"All {task_count} tasks have been cleared.")