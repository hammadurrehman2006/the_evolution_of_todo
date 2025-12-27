"""
Authentication Dependencies for the Todo Application

This module provides dependency functions that work with the JWT middleware
to extract and validate user information from authenticated requests.
"""

from fastapi import Depends, HTTPException, status, Request
from typing import Optional
from .jwt_utils import verify_access_token
from .middleware import JWTBearer


def get_current_user_id(request: Request) -> str:
    """
    Extract the current user ID from the request state after JWT validation.

    This dependency should be used with the JWTBearer middleware to ensure
    that the user is authenticated and the user ID is available in the request state.

    Args:
        request: The incoming request object

    Returns:
        str: The user ID of the authenticated user

    Raises:
        HTTPException: If no user ID is found in the request state
    """
    user_id = getattr(request.state, 'user_id', None)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_id


def get_current_user_id_from_token(token: str = Depends(JWTBearer())) -> str:
    """
    Alternative dependency that validates the token and returns the user ID.
    This can be used when you need to validate the token directly without middleware.

    Args:
        token: The JWT token extracted and validated by JWTBearer

    Returns:
        str: The user ID of the authenticated user
    """
    user_id = verify_access_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_id


# Create an instance of JWTBearer for use as a dependency
jwt_bearer_dependency = JWTBearer()


def get_authenticated_user_id() -> str:
    """
    Dependency that can be used to require authentication on specific endpoints.
    This function is kept for backward compatibility with existing code.
    """
    # This is a placeholder that should be replaced with proper implementation
    # in the actual API routes that need authentication
    pass