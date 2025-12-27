from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
import uuid
from enum import Enum
import re
from pydantic import validator, field_validator
from sqlalchemy import Column, DateTime, String, Boolean
from sqlalchemy.sql import func
from .todo import Todo
from .session import Session
from .jwt_token import JWTToken


class UserRole(str, Enum):
    """Enum for user roles"""
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"


class User(SQLModel, table=True):
    """User model for the application with Neon PostgreSQL compatibility"""

    __tablename__ = "users"  # Explicit table name for consistency

    # Primary key
    user_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=36  # UUID4 length
    )

    # User identification with Neon-optimized column definitions
    email: str = Field(
        sa_column=Column("email", String, unique=True, nullable=False, index=True)
    )
    email_verified: bool = Field(
        default=False,
        sa_column=Column("email_verified", Boolean, server_default="false")
    )
    username: Optional[str] = Field(
        default=None,
        sa_column=Column("username", String, unique=True, nullable=True, index=True)
    )

    # Authentication
    password_hash: str = Field(
        sa_column=Column("password_hash", String, nullable=False)
    )

    # Personal information
    first_name: Optional[str] = Field(
        default=None,
        sa_column=Column("first_name", String, nullable=True)
    )
    last_name: Optional[str] = Field(
        default=None,
        sa_column=Column("last_name", String, nullable=True)
    )

    # Access control
    role: str = Field(
        default=UserRole.USER.value,
        sa_column=Column("role", String, server_default="user")
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
    last_login_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column("last_login_at", DateTime(timezone=True), nullable=True)
    )

    # Status
    is_active: bool = Field(
        default=True,
        sa_column=Column("is_active", Boolean, server_default="true")
    )

    # Relationships - properly defined for Neon PostgreSQL
    todos: list["Todo"] = Relationship(back_populates="user", cascade_delete=True)
    sessions: list["Session"] = Relationship(back_populates="user", cascade_delete=True)
    jwt_tokens: list["JWTToken"] = Relationship(back_populates="user", cascade_delete=True)

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        """Validate email format"""
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError('Invalid email format')
        return v

    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        """Validate username format (3-30 chars, alphanumeric + underscore/hyphen only)"""
        if v is None:
            return v

        if len(v) < 3 or len(v) > 30:
            raise ValueError('Username must be between 3 and 30 characters')

        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Username can only contain alphanumeric characters, underscores, and hyphens')

        return v

    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        """Validate role is one of the allowed values"""
        if v not in [UserRole.USER.value, UserRole.ADMIN.value, UserRole.MODERATOR.value]:
            raise ValueError('Role must be one of: user, admin, moderator')
        return v

    @field_validator('password_hash')
    @classmethod
    def validate_password_hash(cls, v):
        """Validate password hash is not empty"""
        if not v or len(v) == 0:
            raise ValueError('Password hash cannot be empty')
        return v

    def __str__(self) -> str:
        return f"User(id={self.user_id}, email={self.email}, username={self.username})"

    def __repr__(self) -> str:
        return self.__str__()