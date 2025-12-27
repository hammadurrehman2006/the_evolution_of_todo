from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from .user import User


class JWTToken(SQLModel, table=True):
    """
    JWT Token model representing access and refresh tokens with revocation capabilities.
    """
    __tablename__ = "jwt_tokens"
    __table_args__ = (CheckConstraint("type IN ('access', 'refresh')", name="valid_token_type"),)

    # Primary key with UUID
    token_id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, nullable=False)

    # Foreign key to User
    user_id: str = Field(sa_column=Column("user_id", String, ForeignKey("users.user_id"), nullable=False, index=True))

    # Token type with validation
    type: str = Field(sa_column=Column("type", String, nullable=False))

    # Expiration and revocation
    expires_at: datetime = Field(sa_column=Column("expires_at", DateTime(timezone=True), nullable=False))
    revoked: bool = Field(default=False, sa_column=Column("revoked", Boolean, server_default="false"))

    # Timestamps
    created_at: datetime = Field(
        sa_column=Column("created_at", DateTime(timezone=True), server_default=func.now(), nullable=False)
    )

    # Relationship to User
    user: User = Relationship(sa_relationship_kwargs={"lazy": "select", "back_populates": "jwt_tokens"})