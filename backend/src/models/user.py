from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, CheckConstraint
from sqlalchemy.sql import func


class User(SQLModel, table=True):
    """
    User model representing application users with authentication and profile data.
    """
    __table_args__ = (CheckConstraint("role IN ('user', 'admin', 'moderator')", name="valid_role"),)

    # Primary key with UUID
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, nullable=False)

    # Email - required and unique
    email: str = Field(sa_column=Column("email", String, unique=True, nullable=False))

    # Email verification status
    email_verified: bool = Field(default=False, sa_column=Column("email_verified", Boolean, server_default="false"))

    # Username - optional but unique if provided
    username: Optional[str] = Field(sa_column=Column("username", String, unique=True, nullable=True))

    # Password hash - required for authentication
    password_hash: str = Field(sa_column=Column("password_hash", String, nullable=False))

    # Profile information - optional
    first_name: Optional[str] = Field(sa_column=Column("first_name", String, nullable=True))
    last_name: Optional[str] = Field(sa_column=Column("last_name", String, nullable=True))

    # Role with default value - restricted to specific values
    role: str = Field(default="user", sa_column=Column("role", String, server_default="user"))

    # Timestamps - auto-generated
    created_at: datetime = Field(
        sa_column=Column("created_at", DateTime(timezone=True), server_default=func.now(), nullable=False)
    )
    updated_at: datetime = Field(
        sa_column=Column("updated_at", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    )

    # Last login - optional
    last_login_at: Optional[datetime] = Field(sa_column=Column("last_login_at", DateTime(timezone=True), nullable=True))

    # Active status
    is_active: bool = Field(default=True, sa_column=Column("is_active", Boolean, server_default="true"))