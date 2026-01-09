"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, Field, field_validator, field_serializer
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid


class PriorityEnum(str, Enum):
    """Task priority levels."""
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class SortField(str, Enum):
    """Valid sort fields for task listing."""
    DUE_DATE = "due_date"
    TITLE = "title"
    PRIORITY = "priority"


class SortOrder(str, Enum):
    """Sort order direction."""
    ASC = "asc"
    DESC = "desc"


class TaskCreate(BaseModel):
    """Schema for creating a new task."""

    title: str = Field(min_length=1, max_length=200, description="Task title (required, 1-200 characters)")
    description: Optional[str] = Field(default=None, max_length=2000, description="Optional description (max 2000 characters)")
    priority: Optional[PriorityEnum] = Field(default=PriorityEnum.MEDIUM, description="Priority level (High/Medium/Low)")
    tags: Optional[List[str]] = Field(default=None, description="Array of tag strings")
    due_date: Optional[datetime] = Field(default=None, description="Due date and time (ISO 8601)")
    reminder_at: Optional[datetime] = Field(default=None, description="Reminder time (must be <= due_date)")
    is_recurring: bool = Field(default=False, description="Whether task auto-reschedules")
    recurrence_rule: Optional[str] = Field(default=None, max_length=500, description="iCalendar RRULE format")

    @field_validator('reminder_at')
    @classmethod
    def validate_reminder_before_due(cls, v, info):
        """Ensure reminder_at is before or equal to due_date."""
        due_date = info.data.get('due_date')
        if v is not None and due_date is not None and v > due_date:
            raise ValueError('reminder_at must be before or equal to due_date')
        return v

    @field_validator('recurrence_rule')
    @classmethod
    def validate_recurrence_rule_required(cls, v, info):
        """Ensure recurrence_rule is provided if is_recurring is True."""
        is_recurring = info.data.get('is_recurring', False)
        if is_recurring and not v:
            raise ValueError('recurrence_rule is required when is_recurring is True')
        return v

    @field_validator('tags')
    @classmethod
    def deduplicate_tags(cls, v):
        """Remove duplicate tags."""
        if v is not None:
            return list(set(v))
        return v


class TaskUpdate(BaseModel):
    """Schema for updating an existing task (partial updates supported)."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    priority: Optional[PriorityEnum] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    reminder_at: Optional[datetime] = None
    is_recurring: Optional[bool] = None
    recurrence_rule: Optional[str] = Field(default=None, max_length=500)

    @field_validator('reminder_at')
    @classmethod
    def validate_reminder_before_due(cls, v, info):
        """Ensure reminder_at is before or equal to due_date if both provided."""
        due_date = info.data.get('due_date')
        if v is not None and due_date is not None and v > due_date:
            raise ValueError('reminder_at must be before or equal to due_date')
        return v

    @field_validator('tags')
    @classmethod
    def deduplicate_tags(cls, v):
        """Remove duplicate tags."""
        if v is not None:
            return list(set(v))
        return v


class TaskResponse(BaseModel):
    """Schema for task response."""

    id: uuid.UUID
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    priority: PriorityEnum
    tags: Optional[List[str]]
    due_date: Optional[datetime]
    reminder_at: Optional[datetime]
    is_recurring: bool
    recurrence_rule: Optional[str]
    created_at: datetime
    updated_at: datetime

    @field_serializer('due_date', 'reminder_at', 'created_at', 'updated_at')
    def serialize_datetime(self, dt: Optional[datetime], _info):
        """Ensure datetimes are serialized with UTC timezone."""
        if dt is None:
            return None
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """Schema for task list response with pagination."""

    items: List[TaskResponse]
    total: int
    limit: int
    offset: int


class TaskQueryParams(BaseModel):
    """Query parameters for filtering and sorting tasks."""

    q: Optional[str] = Field(default=None, description="Keyword search (title/description)")
    status: Optional[bool] = Field(default=None, description="Filter by completion status")
    priority: Optional[PriorityEnum] = Field(default=None, description="Filter by priority")
    tags: Optional[str] = Field(default=None, description="Filter by tags (comma-separated)")
    due_date_from: Optional[datetime] = Field(default=None, description="Filter tasks due after this date")
    due_date_to: Optional[datetime] = Field(default=None, description="Filter tasks due before this date")
    sort_by: SortField = Field(default=SortField.DUE_DATE, description="Sort field")
    sort_order: SortOrder = Field(default=SortOrder.ASC, description="Sort order")
    limit: int = Field(default=50, ge=1, le=100, description="Page size (max 100)")
    offset: int = Field(default=0, ge=0, description="Pagination offset")

    @property
    def tags_list(self) -> Optional[List[str]]:
        """Parse comma-separated tags into list."""
        if self.tags:
            return [tag.strip() for tag in self.tags.split(',') if tag.strip()]
        return None


class ToggleResponse(BaseModel):
    """Response for toggle completion endpoint."""

    task: TaskResponse
    new_task: Optional[TaskResponse] = None  # For recurring tasks
