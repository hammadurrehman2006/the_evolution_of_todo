"""SQLModel data models for the Task Management API."""
from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


class PriorityEnum(str, Enum):
    """Task priority levels."""
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class Task(SQLModel, table=True):
    """
    Task model representing a single task or to-do item.

    Attributes:
        id: Unique task identifier (UUID)
        user_id: User who owns this task (for multi-tenancy)
        title: Task title (1-200 characters, required)
        description: Optional task description (max 2000 characters)
        completed: Completion status (default: false)
        priority: Priority level (High/Medium/Low, default: Medium)
        tags: Array of tag strings stored as JSONB
        due_date: Optional due date/time
        reminder_at: Optional reminder time (must be <= due_date)
        is_recurring: Whether task auto-reschedules on completion
        recurrence_rule: iCalendar RRULE format for recurring tasks
        created_at: Timestamp when task was created
        updated_at: Timestamp of last modification
    """

    __tablename__ = "tasks"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True)
    )

    user_id: str = Field(
        index=True,
        description="User ID from JWT token for multi-tenancy"
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

    is_recurring: bool = Field(
        default=False,
        description="Whether task auto-reschedules on completion"
    )

    recurrence_rule: Optional[str] = Field(
        default=None,
        max_length=500,
        description="iCalendar RRULE format for recurring tasks"
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when task was created"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp of last modification"
    )
