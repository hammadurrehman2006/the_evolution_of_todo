"""SQLModel data models for the Task Management API."""
from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy import JSON as SA_JSON, Text
import sqlalchemy as sa
from typing import Optional, List
from datetime import datetime, timezone
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
        tags: Array of tag strings stored as JSON
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
        sa_column=Column(SA_JSON),
        description="Array of tag strings stored as JSON"
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

    client_request_id: Optional[str] = Field(
        default=None,
        index=True,
        description="Client-provided idempotency key to prevent duplicate creation"
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp when task was created"
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of last modification"
    )


class User(SQLModel, table=True):
    """
    User model for Better Auth.
    """
    __tablename__ = "user"

    id: str = Field(primary_key=True)
    name: str
    email: str = Field(unique=True)
    emailVerified: bool
    image: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime


class Session(SQLModel, table=True):
    """
    Session model for Better Auth.
    """
    __tablename__ = "session"

    id: str = Field(primary_key=True)
    expiresAt: datetime
    token: str = Field(unique=True)
    createdAt: datetime
    updatedAt: datetime
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None
    userId: str = Field(foreign_key="user.id", ondelete="CASCADE")


class Account(SQLModel, table=True):
    """
    Account model for Better Auth.
    """
    __tablename__ = "account"

    id: str = Field(primary_key=True)
    accountId: str
    providerId: str
    userId: str = Field(foreign_key="user.id", ondelete="CASCADE")
    accessToken: Optional[str] = None
    refreshToken: Optional[str] = None
    idToken: Optional[str] = None
    accessTokenExpiresAt: Optional[datetime] = None
    refreshTokenExpiresAt: Optional[datetime] = None
    scope: Optional[str] = None
    password: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime


class Verification(SQLModel, table=True):
    """
    Verification model for Better Auth.
    """
    __tablename__ = "verification"

    id: str = Field(primary_key=True)
    identifier: str
    value: str
    expiresAt: datetime
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None


class Jwks(SQLModel, table=True):
    """
    JWKS model for Better Auth.
    """
    __tablename__ = "jwks"

    id: str = Field(primary_key=True)
    publicKey: str
    privateKey: str
    createdAt: datetime


class ConversationSession(SQLModel, table=True):
    """
    Conversation session for persistent chat history.
    Stores conversation threads for AI chatbot.
    """
    __tablename__ = "conversation_sessions"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True)
    )
    user_id: str = Field(index=True, description="User who owns this conversation")
    title: Optional[str] = Field(default=None, max_length=500, description="Conversation title")
    status: str = Field(default="active", max_length=50, description="active, archived, deleted")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="When conversation started"
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last message timestamp"
    )


class ConversationMessage(SQLModel, table=True):
    """
    Individual message in a conversation.
    """
    __tablename__ = "conversation_messages"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True)
    )
    session_id: uuid.UUID = Field(
        foreign_key="conversation_sessions.id",
        ondelete="CASCADE",
        index=True,
        description="Parent conversation session"
    )
    role: str = Field(max_length=50, description="user, assistant, system, or tool")
    content: str = Field(sa_column=Column(sa.Text), description="Message content")
    content_json: Optional[dict] = Field(default=None, sa_column=Column(SA_JSON), description="Structured content")
    token_count: Optional[int] = Field(default=None, description="Token count for this message")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="When message was created"
    )


class ToolCall(SQLModel, table=True):
    """
    Tool execution audit log for AI agent actions.
    """
    __tablename__ = "tool_calls"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True)
    )
    session_id: uuid.UUID = Field(
        foreign_key="conversation_sessions.id",
        ondelete="CASCADE",
        index=True,
        description="Parent conversation session"
    )
    message_id: Optional[uuid.UUID] = Field(
        default=None,
        foreign_key="conversation_messages.id",
        ondelete="SET NULL",
        description="Associated message"
    )
    tool_name: str = Field(max_length=255, description="Name of tool executed")
    input_json: dict = Field(sa_column=Column(SA_JSON), description="Tool input parameters")
    output_json: Optional[dict] = Field(default=None, sa_column=Column(SA_JSON), description="Tool output")
    status: str = Field(default="pending", max_length=50, description="pending, success, failed")
    error_message: Optional[str] = Field(default=None, description="Error message if failed")
    duration_ms: Optional[int] = Field(default=None, description="Execution time in milliseconds")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="When tool was called"
    )
