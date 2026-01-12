from typing import Optional, List
from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from datetime import datetime, timezone
import uuid
from enum import Enum
from pydantic import BaseModel

class PriorityEnum(str, Enum):
    """Task priority levels."""
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class Task(SQLModel, table=True):
    """
    Task model representing a single task or to-do item.
    Matches the main backend schema.
    """
    __tablename__ = "tasks"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True)
    )

    user_id: str = Field(
        index=True,
        description="User ID for multi-tenancy"
    )

    title: str = Field(
        min_length=1,
        max_length=200,
        description="Task title (required, 1-200 characters)"
    )

    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Optional task description (max 2000 characters)"
    )

    completed: bool = Field(
        default=False,
        description="Completion status"
    )

    priority: PriorityEnum = Field(
        default=PriorityEnum.MEDIUM,
        description="Priority level (High/Medium/Low)"
    )

    tags: Optional[List[str]] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Array of tag strings stored as JSONB"
    )

    due_date: Optional[datetime] = Field(
        default=None,
        description="Task due date and time (ISO 8601, UTC)"
    )
    
    reminder_at: Optional[datetime] = Field(
        default=None,
        description="Reminder time (must be <= due_date)"
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp when task was created"
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of last modification"
    )

# Input/Filter models for MCP tools

class CreateTaskInput(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = PriorityEnum.MEDIUM
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None

class UpdateTaskInput(BaseModel):
    task_id: str
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[PriorityEnum] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None

class TaskFilter(BaseModel):
    completed: Optional[bool] = None
    priority: Optional[PriorityEnum] = None
    tag: Optional[str] = None