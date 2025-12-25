"""
Task model with validation for the Todo Console Application
Task ID: T004
Specification section: Key Entities in spec.md
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Task:
    """
    Represents a single todo item with validation
    """
    id: int
    title: str
    description: str
    completed: bool
    created_at: datetime

    def __post_init__(self):
        """Validate task attributes after initialization"""
        self._validate_title()
        self._validate_description()

    def _validate_title(self):
        """Validate title length (1-200 characters)"""
        if not isinstance(self.title, str):
            raise ValueError("Title must be a string")
        if len(self.title) < 1 or len(self.title) > 200:
            raise ValueError("Title must be between 1 and 200 characters")

    def _validate_description(self):
        """Validate description length (0-1000 characters)"""
        if not isinstance(self.description, str):
            raise ValueError("Description must be a string")
        if len(self.description) > 1000:
            raise ValueError("Description must be between 0 and 1000 characters")

    @classmethod
    def create_task(cls, task_id: int, title: str, description: str = "") -> 'Task':
        """
        Factory method to create a new validated task
        Sets completion status to False by default and creates timestamp
        """
        return cls(
            id=task_id,
            title=title,
            description=description,
            completed=False,
            created_at=datetime.now()
        )

    def update_details(self, title: Optional[str] = None, description: Optional[str] = None):
        """
        Update task details with validation
        """
        if title is not None:
            self.title = title
            self._validate_title()

        if description is not None:
            self.description = description
            self._validate_description()


# Example usage and validation:
# task = Task.create_task(1, "Sample task", "Sample description")