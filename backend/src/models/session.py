from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from .user import User


class Session(SQLModel, table=True):
    """
    Session model representing user sessions with JWT token tracking and security features.
    """
    __tablename__ = "sessions"

    # Primary key with UUID
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, nullable=False)

    # Foreign key to User
    user_id: str = Field(sa_column=Column("user_id", String, ForeignKey("users.user_id"), nullable=False, index=True))

    # JWT token tracking
    token_id: str = Field(sa_column=Column("token_id", String, nullable=False))

    # Expiration and timestamps
    expires_at: datetime = Field(sa_column=Column("expires_at", DateTime(timezone=True), nullable=False))
    created_at: datetime = Field(
        sa_column=Column("created_at", DateTime(timezone=True), server_default=func.now(), nullable=False)
    )
    last_accessed_at: datetime = Field(
        sa_column=Column("last_accessed_at", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    )

    # Security and tracking fields
    user_agent: Optional[str] = Field(sa_column=Column("user_agent", String, nullable=True))
    ip_address: Optional[str] = Field(sa_column=Column("ip_address", String, nullable=True))

    # Relationship to User
    user: User = Relationship(sa_relationship_kwargs={"lazy": "select", "back_populates": "sessions"})