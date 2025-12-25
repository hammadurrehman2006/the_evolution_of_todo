"""
Task Service with business logic for the Todo Console Application
Task ID: T006
Specification section: Business logic requirements in spec.md
"""
from typing import List, Optional
from src.models.task import Task
from src.repositories.in_memory_task_repository import InMemoryTaskRepository


class TaskService:
    """
    Business logic layer for task operations
    """

    def __init__(self, repository: InMemoryTaskRepository):
        self.repository = repository

    def add_task(self, title: str, description: str = "") -> Task:
        """
        Add a new task with validation
        Task ID: T011 for US1 implementation
        Specification: FR-001, FR-008, FR-009
        """
        # Validation is handled by the Task model
        task = Task.create_task(0, title, description)
        return self.repository.create(task)

    def get_all_tasks(self) -> List[Task]:
        """
        Get all tasks
        Task ID: T015 for US2 implementation
        Specification: FR-004
        """
        return self.repository.get_all()

    def toggle_task_completion(self, task_id: int) -> Optional[Task]:
        """
        Toggle the completion status of a task
        Task ID: T019 for US3 implementation
        Specification: FR-005
        """
        task = self.repository.get_by_id(task_id)
        if task is None:
            return None

        # Create a new task with the opposite completion status
        updated_task = Task(
            id=task.id,
            title=task.title,
            description=task.description,
            completed=not task.completed,
            created_at=task.created_at
        )
        return self.repository.update(task_id, updated_task)

    def update_task(self, task_id: int, title: Optional[str] = None, description: Optional[str] = None) -> Optional[Task]:
        """
        Update task details (title and/or description)
        Task ID: T023 for US4 implementation
        Specification: FR-006, FR-008, FR-009
        """
        task = self.repository.get_by_id(task_id)
        if task is None:
            return None

        # Prepare updated task with new values or existing ones
        updated_title = title if title is not None else task.title
        updated_description = description if description is not None else task.description

        updated_task = Task(
            id=task.id,
            title=updated_title,
            description=updated_description,
            completed=task.completed,
            created_at=task.created_at
        )
        return self.repository.update(task_id, updated_task)

    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task by ID
        Task ID: T027 for US5 implementation
        Specification: FR-007
        """
        return self.repository.delete(task_id)

    def mark_task_complete(self, task_id: int) -> Optional[Task]:
        """
        Mark a task as complete
        Task ID: Related to US3 implementation
        Specification: FR-005
        """
        task = self.repository.get_by_id(task_id)
        if task is None:
            return None

        if task.completed:
            return task  # Already complete

        updated_task = Task(
            id=task.id,
            title=task.title,
            description=task.description,
            completed=True,
            created_at=task.created_at
        )
        return self.repository.update(task_id, updated_task)

    def mark_task_incomplete(self, task_id: int) -> Optional[Task]:
        """
        Mark a task as incomplete
        Task ID: Related to US3 implementation
        Specification: FR-005
        """
        task = self.repository.get_by_id(task_id)
        if task is None:
            return None

        if not task.completed:
            return task  # Already incomplete

        updated_task = Task(
            id=task.id,
            title=task.title,
            description=task.description,
            completed=False,
            created_at=task.created_at
        )
        return self.repository.update(task_id, updated_task)