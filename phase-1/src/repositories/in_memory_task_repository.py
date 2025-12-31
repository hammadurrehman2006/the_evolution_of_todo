"""
In-Memory Task Repository with CRUD operations for the Todo Console Application
Task ID: T005
Specification section: In-Memory Repository in data-model.md
"""
from typing import Dict, List, Optional
from src.models.task import Task


class InMemoryTaskRepository:
    """
    In-memory repository for task storage with CRUD operations
    Uses dictionary with integer keys (task ID) and Task objects as values
    """

    def __init__(self):
        self._tasks: Dict[int, Task] = {}
        self._next_id = 1

    def create(self, task: Task) -> Task:
        """
        Add new task to repository, assign unique ID
        Task ID: T010 for US1 implementation
        """
        # If the task doesn't have an ID yet, assign the next available ID
        if task.id == 0 or task.id is None:
            task.id = self._next_id
            self._next_id += 1
        elif task.id >= self._next_id:
            # Update the next_id if a higher ID is provided
            self._next_id = task.id + 1

        self._tasks[task.id] = task
        return task

    def get_by_id(self, task_id: int) -> Optional[Task]:
        """
        Retrieve task by ID
        """
        return self._tasks.get(task_id)

    def get_all(self) -> List[Task]:
        """
        Return all tasks in repository
        Task ID: T014 for US2 implementation
        """
        return list(self._tasks.values())

    def update(self, task_id: int, updated_task: Task) -> Optional[Task]:
        """
        Update existing task fields (except ID and created_at)
        Task ID: T018, T022 for US3, US4 implementation
        """
        if task_id not in self._tasks:
            return None

        # Preserve the original ID and creation time
        updated_task.id = self._tasks[task_id].id
        updated_task.created_at = self._tasks[task_id].created_at

        self._tasks[task_id] = updated_task
        return updated_task

    def delete(self, task_id: int) -> bool:
        """
        Remove task by ID
        Task ID: T026 for US5 implementation
        """
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False

    def exists(self, task_id: int) -> bool:
        """
        Check if a task exists by ID
        """
        return task_id in self._tasks