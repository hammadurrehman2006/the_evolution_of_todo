"""
Persistent Task Repository with file-based storage for the Todo Console Application
Extends the in-memory repository to add save/load functionality
"""
import json
import os
from datetime import datetime
from typing import Dict, List, Optional
from src.models.task import Task
from src.repositories.in_memory_task_repository import InMemoryTaskRepository


class PersistentTaskRepository(InMemoryTaskRepository):
    """
    Persistent repository that extends in-memory storage with file-based persistence
    Saves tasks to a JSON file and loads them on startup
    """

    def __init__(self, file_path: str = "tasks.json"):
        super().__init__()
        self.file_path = file_path
        self.load_tasks()

    def _task_to_dict(self, task: Task) -> dict:
        """Convert Task object to dictionary for JSON serialization"""
        return {
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'completed': task.completed,
            'created_at': task.created_at.isoformat() if isinstance(task.created_at, datetime) else task.created_at
        }

    def _dict_to_task(self, data: dict) -> Task:
        """Convert dictionary back to Task object"""
        # Parse datetime from ISO string
        created_at = datetime.fromisoformat(data['created_at']) if isinstance(data['created_at'], str) else data['created_at']

        task = Task(
            id=data['id'],
            title=data['title'],
            description=data['description'],
            completed=data['completed'],
            created_at=created_at
        )
        return task

    def save_tasks(self):
        """Save all tasks to the JSON file"""
        tasks_data = []
        for task in self._tasks.values():
            tasks_data.append(self._task_to_dict(task))

        # Update next_id based on the highest ID in the tasks
        if self._tasks:
            self._next_id = max(task.id for task in self._tasks.values()) + 1
        else:
            self._next_id = 1

        data = {
            'tasks': tasks_data,
            'next_id': self._next_id
        }

        try:
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving tasks to file: {e}")

    def load_tasks(self):
        """Load tasks from the JSON file"""
        if not os.path.exists(self.file_path):
            return  # File doesn't exist, start with empty repository

        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Load tasks
            for task_data in data.get('tasks', []):
                task = self._dict_to_task(task_data)
                self._tasks[task.id] = task

            # Restore next_id
            self._next_id = data.get('next_id', 1)

        except Exception as e:
            print(f"Error loading tasks from file: {e}")

    def create(self, task: Task) -> Task:
        """Override create to save after adding task"""
        result = super().create(task)
        self.save_tasks()
        return result

    def update(self, task_id: int, updated_task: Task) -> Optional[Task]:
        """Override update to save after updating task"""
        result = super().update(task_id, updated_task)
        if result:
            self.save_tasks()
        return result

    def delete(self, task_id: int) -> bool:
        """Override delete to save after removing task"""
        result = super().delete(task_id)
        if result:
            self.save_tasks()
        return result