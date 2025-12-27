from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
import uuid
from pydantic import field_validator, model_validator
from sqlalchemy import Column, DateTime, String, Boolean, ForeignKey
from sqlalchemy.sql import func


class Todo(SQLModel, table=True):
    """Todo model for the application with Neon PostgreSQL compatibility"""

    __tablename__ = "todos"  # Explicit table name for consistency

    # Primary key
    todo_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=36  # UUID4 length
    )

    # Foreign key to User - critical for multi-user isolation
    user_id: str = Field(
        sa_column=Column(
            "user_id",
            String,
            ForeignKey("users.user_id", ondelete="CASCADE"),
            nullable=False,
            index=True  # Index for performance and multi-user isolation
        )
    )

    # Relationship to User
    user: Optional["User"] = Relationship(back_populates="todos")

    # Todo content with Neon-optimized columns
    title: str = Field(
        sa_column=Column("title", String, nullable=False, index=True)
    )
    description: Optional[str] = Field(
        default=None,
        sa_column=Column("description", String, nullable=True)
    )

    # Status with Neon-optimized columns
    completed: bool = Field(
        default=False,
        sa_column=Column("completed", Boolean, server_default="false")
    )
    completed_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column("completed_at", DateTime(timezone=True), nullable=True)
    )

    # Timestamps with Neon-optimized columns
    created_at: datetime = Field(
        sa_column=Column(
            "created_at",
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            "updated_at",
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False
        )
    )

    def set_completed(self, completed_status: bool):
        """Method to properly set completion status and timestamp"""
        self.completed = completed_status
        if completed_status:
            if self.completed_at is None:
                self.completed_at = datetime.utcnow()
        else:
            self.completed_at = None
        self.update_timestamp()
        return self

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        """Validate title length (1-200 chars)"""
        if not v or len(v) < 1 or len(v) > 200:
            raise ValueError('Title must be between 1 and 200 characters')
        return v

    @field_validator('description')
    @classmethod
    def validate_description(cls, v):
        """Validate description length (0-1000 chars)"""
        if v is not None and len(v) > 1000:
            raise ValueError('Description must be between 0 and 1000 characters')
        return v

    def model_dump(self, **kwargs):
        """Override model_dump to ensure proper serialization"""
        return super().model_dump(**kwargs)

    def update_timestamp(self):
        """Method to update the updated_at timestamp - call this before updating the record"""
        self.updated_at = datetime.utcnow()
        return self

    def __str__(self) -> str:
        return f"Todo(id={self.todo_id}, user_id={self.user_id}, title={self.title}, completed={self.completed})"

    def __repr__(self) -> str:
        return self.__str__()