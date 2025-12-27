from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
import uuid
from pydantic import field_validator, model_validator
from enum import Enum
from sqlalchemy import Column, DateTime, String, Boolean, ForeignKey
from sqlalchemy.sql import func


class TokenType(str, Enum):
    """Enum for token types"""
    ACCESS = "access"
    REFRESH = "refresh"


class JWTToken(SQLModel, table=True):
    """JWT Token model for tracking authentication tokens with Neon PostgreSQL compatibility"""

    __tablename__ = "jwt_tokens"  # Explicit table name for consistency

    # Primary key
    token_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        max_length=36  # UUID4 length
    )

    # Foreign key to User
    user_id: str = Field(
        sa_column=Column(
            "user_id",
            String,
            ForeignKey("users.user_id", ondelete="CASCADE"),
            nullable=False,
            index=True
        )
    )

    # Token type
    type: str = Field(
        sa_column=Column("type", String, nullable=False, index=True)
    )

    # Expiration
    expires_at: datetime = Field(
        sa_column=Column("expires_at", DateTime(timezone=True), nullable=False)
    )

    # Status
    revoked: bool = Field(
        default=False,
        sa_column=Column("revoked", Boolean, server_default="false")
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

    # Relationship to User (using string reference to avoid circular import)
    user: Optional["User"] = Relationship(back_populates="jwt_tokens")

    @field_validator('type')
    @classmethod
    def validate_type(cls, v):
        """Validate token type is one of the allowed values"""
        if v not in [TokenType.ACCESS.value, TokenType.REFRESH.value]:
            raise ValueError('Token type must be one of: access, refresh')

        return v

    @field_validator('expires_at')
    @classmethod
    def validate_expires_at(cls, v):
        """Validate expiration date is in the future and follows token type rules"""
        if v <= datetime.utcnow():
            raise ValueError('Expiration date must be in the future')

        # Note: We can't validate the exact time limits here because we don't have access to the type field
        # during this field validation. This validation would need to be done at the model level
        # or handled in the service layer when tokens are created.
        return v

    @field_validator('user_id')
    @classmethod
    def validate_user_id(cls, v):
        """Validate user_id is not empty"""
        if not v or len(v) == 0:
            raise ValueError('User ID cannot be empty')
        return v

    @model_validator(mode='after')
    def validate_token_rules(self):
        """Validate token-specific rules like expiration time limits"""
        if self.type == TokenType.ACCESS.value:
            # Access tokens should expire within 30 minutes (1800 seconds)
            time_diff = (self.expires_at - datetime.utcnow()).total_seconds()
            if time_diff > 1800:
                raise ValueError('Access tokens must expire within 30 minutes')
        elif self.type == TokenType.REFRESH.value:
            # Refresh tokens should expire within 24 hours (86400 seconds)
            time_diff = (self.expires_at - datetime.utcnow()).total_seconds()
            if time_diff > 86400:
                raise ValueError('Refresh tokens must expire within 24 hours')

        return self

    def __str__(self) -> str:
        return f"JWTToken(id={self.token_id}, user_id={self.user_id}, type={self.type}, expires_at={self.expires_at})"

    def __repr__(self) -> str:
        return self.__str__()