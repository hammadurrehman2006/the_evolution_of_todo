"""
JWT Utilities and Token Management for the Todo Application

This module provides comprehensive JWT token handling including:
- Access and refresh token creation
- Token validation and decoding
- Token refresh functionality
- Security measures and validation
- Integration with JWTToken model
- Proper error handling and security best practices
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from sqlmodel import Session, select
from src.models.user import User
from src.models.jwt_token import JWTToken, TokenType
from src.database import engine
import uuid
import hashlib
from enum import Enum


# Initialize password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY", "your-refresh-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_HOURS = 24

# Security configuration
MAX_LOGIN_ATTEMPTS = 5
LOGIN_ATTEMPT_WINDOW = 900  # 15 minutes in seconds


class TokenSecurityError(Exception):
    """Base exception for token security issues"""
    pass


class TokenValidationError(Exception):
    """Exception raised when a token validation fails"""
    pass


class TokenRevokedError(Exception):
    """Exception raised when a token has been revoked"""
    pass


class TokenExpiredError(Exception):
    """Exception raised when a token has expired"""
    pass


class JWTManager:
    """
    Comprehensive JWT token manager handling all token operations
    """

    def __init__(self):
        self.access_token_expire_minutes = ACCESS_TOKEN_EXPIRE_MINUTES
        self.refresh_token_expire_hours = REFRESH_TOKEN_EXPIRE_HOURS
        self.algorithm = ALGORITHM

    def _hash_token(self, token: str) -> str:
        """
        Create a secure hash of the token for database storage

        Args:
            token: The raw token string

        Returns:
            SHA-256 hash of the token
        """
        return hashlib.sha256(token.encode()).hexdigest()

    def create_access_token(self, user_id: str, expires_delta: Optional[timedelta] = None) -> str:
        """
        Create an access token for a user with proper security measures

        Args:
            user_id: The ID of the user
            expires_delta: Optional timedelta for custom expiration

        Returns:
            Encoded JWT access token
        """
        if expires_delta is None:
            expires_delta = timedelta(minutes=self.access_token_expire_minutes)

        # Validate user_id format
        if not user_id or len(user_id) == 0:
            raise TokenValidationError("User ID cannot be empty")

        expire = datetime.utcnow() + expires_delta
        to_encode = {
            "sub": user_id,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": TokenType.ACCESS.value,
            "jti": str(uuid.uuid4())  # JWT ID for additional security
        }

        encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=self.algorithm)
        return encoded_jwt

    def create_refresh_token(self, user_id: str, expires_delta: Optional[timedelta] = None) -> str:
        """
        Create a refresh token for a user with proper security measures

        Args:
            user_id: The ID of the user
            expires_delta: Optional timedelta for custom expiration

        Returns:
            Encoded JWT refresh token
        """
        if expires_delta is None:
            expires_delta = timedelta(hours=self.refresh_token_expire_hours)

        # Validate user_id format
        if not user_id or len(user_id) == 0:
            raise TokenValidationError("User ID cannot be empty")

        expire = datetime.utcnow() + expires_delta
        to_encode = {
            "sub": user_id,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": TokenType.REFRESH.value,
            "jti": str(uuid.uuid4())  # JWT ID for additional security
        }

        encoded_jwt = jwt.encode(to_encode, JWT_REFRESH_SECRET_KEY, algorithm=self.algorithm)
        return encoded_jwt

    def decode_token(self, token: str, token_type: TokenType) -> Optional[Dict[str, Any]]:
        """
        Decode and validate a JWT token with enhanced security

        Args:
            token: The JWT token to decode
            token_type: The expected type of token (access or refresh)

        Returns:
            Dictionary containing token payload if valid, None otherwise
        """
        try:
            if not token:
                raise TokenValidationError("Token cannot be empty")

            # Validate token format (basic check)
            if token.count('.') != 2:
                raise TokenValidationError("Invalid token format")

            secret_key = JWT_SECRET_KEY if token_type == TokenType.ACCESS else JWT_REFRESH_SECRET_KEY
            payload = jwt.decode(token, secret_key, algorithms=[self.algorithm])

            # Verify token type matches expected type
            token_payload_type = payload.get("type")
            if token_payload_type != token_type.value:
                raise TokenValidationError(f"Invalid token type: expected {token_type.value}, got {token_payload_type}")

            # Verify token hasn't expired (handled by jwt.decode automatically)
            user_id: str = payload.get("sub")
            if user_id is None:
                raise TokenValidationError("Token missing user ID")

            # Verify JWT ID exists
            jti = payload.get("jti")
            if not jti:
                raise TokenValidationError("Token missing JWT ID")

            return payload
        except JWTError as e:
            # Token is invalid or expired
            raise TokenValidationError(f"Token validation failed: {str(e)}")
        except Exception as e:
            # Other validation errors
            raise TokenValidationError(f"Token validation error: {str(e)}")

    def verify_access_token(self, token: str) -> Optional[str]:
        """
        Verify an access token and return the user ID if valid

        Args:
            token: The access token to verify

        Returns:
            User ID if token is valid, None otherwise
        """
        try:
            payload = self.decode_token(token, TokenType.ACCESS)
            user_id = payload.get("sub")

            if user_id is None:
                return None

            # Check if token has been revoked
            if self.is_token_revoked(token, TokenType.ACCESS):
                raise TokenRevokedError("Access token has been revoked")

            return user_id
        except (TokenValidationError, TokenRevokedError):
            return None

    def verify_refresh_token(self, token: str) -> Optional[str]:
        """
        Verify a refresh token and return the user ID if valid

        Args:
            token: The refresh token to verify

        Returns:
            User ID if token is valid, None otherwise
        """
        try:
            payload = self.decode_token(token, TokenType.REFRESH)
            user_id = payload.get("sub")

            if user_id is None:
                return None

            # Check if token has been revoked
            if self.is_token_revoked(token, TokenType.REFRESH):
                raise TokenRevokedError("Refresh token has been revoked")

            return user_id
        except (TokenValidationError, TokenRevokedError):
            return None

    def is_token_revoked(self, token: str, token_type: TokenType) -> bool:
        """
        Check if a token has been revoked in the database

        Args:
            token: The token to check
            token_type: The type of token to check

        Returns:
            True if token is revoked, False otherwise
        """
        try:
            # Decode the token to get user_id and expiration to identify the token in DB
            payload = self.decode_token(token, token_type)
            if not payload:
                return True  # Invalid token should be treated as revoked

            user_id = payload.get("sub")
            if not user_id:
                return True

            # Get the token hash to check against database
            token_hash = self._hash_token(token)

            # Connect to database and check if token exists and is revoked
            with Session(engine) as session:
                # We'll check if there's a JWTToken record with the same user_id, type, and is revoked
                # Since we don't store the full token in DB, we'll use the user_id, type, and expiration time
                # to identify the token
                token_exp = payload.get("exp")
                if token_exp:
                    token_exp_datetime = datetime.utcfromtimestamp(token_exp)

                    statement = select(JWTToken).where(
                        JWTToken.user_id == user_id,
                        JWTToken.type == token_type.value,
                        JWTToken.revoked == True  # Check if revoked
                    )

                    results = session.exec(statement).all()

                    # Check if any of the revoked tokens match this token's approximate expiration time
                    for db_token in results:
                        if abs((db_token.expires_at - token_exp_datetime).total_seconds()) < 60:  # Within 1 minute
                            return True

            return False
        except Exception:
            # If there's an error checking the database, treat as revoked for security
            return True

    def create_and_store_tokens(self, user_id: str) -> Dict[str, str]:
        """
        Create both access and refresh tokens and store them securely in the database

        Args:
            user_id: The ID of the user to create tokens for

        Returns:
            Dictionary containing both access and refresh tokens
        """
        # Validate user exists
        with Session(engine) as session:
            user = session.get(User, user_id)
            if not user:
                raise TokenValidationError("User does not exist")

            if not user.is_active:
                raise TokenValidationError("User account is not active")

        # Create tokens
        access_token = self.create_access_token(user_id)
        refresh_token = self.create_refresh_token(user_id)

        # Store tokens in database
        with Session(engine) as session:
            # Create access token record
            access_token_db = JWTToken(
                user_id=user_id,
                type=TokenType.ACCESS.value,
                expires_at=datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
            )

            # Create refresh token record
            refresh_token_db = JWTToken(
                user_id=user_id,
                type=TokenType.REFRESH.value,
                expires_at=datetime.utcnow() + timedelta(hours=self.refresh_token_expire_hours)
            )

            session.add(access_token_db)
            session.add(refresh_token_db)
            session.commit()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    def refresh_access_token(self, refresh_token: str) -> Optional[Dict[str, str]]:
        """
        Refresh an access token using a valid refresh token with security checks

        Args:
            refresh_token: The refresh token to use for generating new access token

        Returns:
            Dictionary containing new access token if refresh is valid, None otherwise
        """
        # Verify the refresh token
        user_id = self.verify_refresh_token(refresh_token)

        if not user_id:
            return None

        # Double-check if refresh token has been revoked (redundant check for security)
        if self.is_token_revoked(refresh_token, TokenType.REFRESH):
            return None

        # Validate user still exists and is active
        with Session(engine) as session:
            user = session.get(User, user_id)
            if not user or not user.is_active:
                return None

        # Create new access token
        new_access_token = self.create_access_token(user_id)

        # Store the new access token in the database
        with Session(engine) as session:
            new_access_token_db = JWTToken(
                user_id=user_id,
                type=TokenType.ACCESS.value,
                expires_at=datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
            )

            session.add(new_access_token_db)
            session.commit()

        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }

    def revoke_token(self, token: str, token_type: TokenType) -> bool:
        """
        Revoke a token by marking it as revoked in the database

        Args:
            token: The token to revoke
            token_type: The type of token to revoke

        Returns:
            True if token was successfully revoked, False otherwise
        """
        try:
            payload = self.decode_token(token, token_type)
            if not payload:
                return False

            user_id = payload.get("sub")
            if not user_id:
                return False

            # Get token expiration to identify the specific token
            token_exp = payload.get("exp")
            if not token_exp:
                return False

            token_exp_datetime = datetime.utcfromtimestamp(token_exp)

            # Find and revoke the specific token in the database
            with Session(engine) as session:
                # Look for the specific token by user_id, type, and expiration time
                statement = select(JWTToken).where(
                    JWTToken.user_id == user_id,
                    JWTToken.type == token_type.value,
                    JWTToken.expires_at >= token_exp_datetime - timedelta(seconds=30),  # Allow small time variance
                    JWTToken.expires_at <= token_exp_datetime + timedelta(seconds=30),
                    JWTToken.revoked == False  # Only revoke if not already revoked
                ).order_by(JWTToken.created_at.desc()).limit(1)

                result = session.exec(statement).first()
                if result:
                    result.revoked = True
                    session.add(result)
                    session.commit()
                    return True

            return False
        except Exception:
            return False

    def revoke_all_user_tokens(self, user_id: str) -> bool:
        """
        Revoke all tokens for a specific user

        Args:
            user_id: The ID of the user whose tokens should be revoked

        Returns:
            True if tokens were successfully revoked, False otherwise
        """
        try:
            with Session(engine) as session:
                # Get all non-revoked tokens for the user
                statement = select(JWTToken).where(
                    JWTToken.user_id == user_id,
                    JWTToken.revoked == False
                )
                results = session.exec(statement).all()

                # Mark all tokens as revoked
                for token in results:
                    token.revoked = True
                    session.add(token)

                session.commit()
                return True
        except Exception:
            return False

    def get_user_tokens(self, user_id: str) -> list[JWTToken]:
        """
        Get all tokens for a specific user

        Args:
            user_id: The ID of the user

        Returns:
            List of JWTToken objects for the user
        """
        try:
            with Session(engine) as session:
                statement = select(JWTToken).where(JWTToken.user_id == user_id)
                results = session.exec(statement).all()
                return results
        except Exception:
            return []

    def cleanup_expired_tokens(self) -> int:
        """
        Remove expired tokens from the database

        Returns:
            Number of tokens removed
        """
        try:
            current_time = datetime.utcnow()
            with Session(engine) as session:
                # Find all expired and non-revoked tokens
                statement = select(JWTToken).where(
                    JWTToken.expires_at < current_time,
                    JWTToken.revoked == False
                )
                expired_tokens = session.exec(statement).all()

                # Mark them as revoked (or delete them depending on your policy)
                # For audit purposes, we'll mark as revoked rather than delete
                tokens_updated = 0
                for token in expired_tokens:
                    token.revoked = True
                    session.add(token)
                    tokens_updated += 1

                session.commit()
                return tokens_updated
        except Exception:
            return 0


# Global JWT manager instance
jwt_manager = JWTManager()


# Convenience functions for backward compatibility and easier usage
def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create an access token for a user"""
    return jwt_manager.create_access_token(user_id, expires_delta)


def create_refresh_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a refresh token for a user"""
    return jwt_manager.create_refresh_token(user_id, expires_delta)


def verify_access_token(token: str) -> Optional[str]:
    """Verify an access token and return the user ID if valid"""
    return jwt_manager.verify_access_token(token)


def verify_refresh_token(token: str) -> Optional[str]:
    """Verify a refresh token and return the user ID if valid"""
    return jwt_manager.verify_refresh_token(token)


def refresh_access_token(refresh_token: str) -> Optional[Dict[str, str]]:
    """Refresh an access token using a valid refresh token"""
    return jwt_manager.refresh_access_token(refresh_token)


def revoke_token(token: str, token_type: TokenType) -> bool:
    """Revoke a token by marking it as revoked in the database"""
    return jwt_manager.revoke_token(token, token_type)


def is_token_revoked(token: str, token_type: str) -> bool:
    """Check if a token has been revoked in the database"""
    # Convert string token_type to TokenType enum
    try:
        token_type_enum = TokenType(token_type)
    except ValueError:
        # If invalid token type, treat as revoked for security
        return True

    return jwt_manager.is_token_revoked(token, token_type_enum)


def create_and_store_tokens(user_id: str) -> Dict[str, str]:
    """Create both access and refresh tokens and store them in the database"""
    return jwt_manager.create_and_store_tokens(user_id)


def cleanup_expired_tokens() -> int:
    """Remove expired tokens from the database"""
    return jwt_manager.cleanup_expired_tokens()