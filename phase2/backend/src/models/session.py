"""
Session model implementation for the Todo application.

Based on the data model specification from data-model.md, this model includes:

- session_id as primary key (UUID)
- user_id as foreign key to User (required)
- token_id (required, for JWT token tracking)
- expires_at (required, DateTime)
- created_at (auto-generated)
- last_accessed_at (auto-generated)
- user_agent (optional, for device tracking)
- ip_address (optional, for security)

Includes proper validation rules and relationships to the User model.
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
import uuid
from pydantic import field_validator
import ipaddress
from sqlalchemy import Column, DateTime, String, ForeignKey
from sqlalchemy.sql import func


class Session(SQLModel, table=True):
    """Session model for tracking user sessions with Neon PostgreSQL compatibility"""

    __tablename__ = "sessions"  # Explicit table name for consistency

    # Primary key
    session_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=36  # UUID4 length
    )

    # Foreign key to User - required, with index for performance
    user_id: str = Field(
        sa_column=Column(
            "user_id",
            String,
            ForeignKey("users.user_id", ondelete="CASCADE"),
            nullable=False,
            index=True
        )
    )

    # Token tracking - required
    token_id: str = Field(
        sa_column=Column("token_id", String, nullable=False, index=True)
    )

    # Session expiration - required
    expires_at: datetime = Field(
        sa_column=Column("expires_at", DateTime(timezone=True), nullable=False)
    )

    # Timestamps - auto-generated with Neon-optimized columns
    created_at: datetime = Field(
        sa_column=Column(
            "created_at",
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False
        )
    )
    last_accessed_at: datetime = Field(
        sa_column=Column(
            "last_accessed_at",
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False
        )
    )

    # Security information - optional
    user_agent: Optional[str] = Field(
        default=None,
        sa_column=Column("user_agent", String, nullable=True)
    )
    ip_address: Optional[str] = Field(
        default=None,
        sa_column=Column("ip_address", String, nullable=True)
    )

    # Relationship to User (using string reference to avoid circular import)
    user: Optional["User"] = Relationship(back_populates="sessions")

    @field_validator('expires_at')
    @classmethod
    def validate_expires_at(cls, v):
        """Validate expiration date is in the future (from data model validation rule)"""
        if v <= datetime.utcnow():
            raise ValueError('Expiration date must be in the future')
        return v

    @field_validator('token_id')
    @classmethod
    def validate_token_id(cls, v):
        """Validate token_id is not empty (from data model validation rule)"""
        if not v or len(v) == 0:
            raise ValueError('Token ID cannot be empty')
        return v

    @field_validator('ip_address')
    @classmethod
    def validate_ip_address(cls, v):
        """Validate IP address format if provided"""
        if v is None:
            return v

        try:
            ipaddress.ip_address(v)
        except ValueError:
            raise ValueError('Invalid IP address format')
        return v

    def __str__(self) -> str:
        return f"Session(id={self.session_id}, user_id={self.user_id}, expires_at={self.expires_at})"

    def __repr__(self) -> str:
        return self.__str__()