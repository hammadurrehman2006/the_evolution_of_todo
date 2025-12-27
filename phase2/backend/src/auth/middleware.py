from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .jwt_utils import verify_access_token, is_token_revoked
from typing import Optional
import logging
import time

logger = logging.getLogger(__name__)


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True, refresh_interval: int = 300):
        """
        Initialize JWT Bearer authentication middleware.

        Args:
            auto_error: Whether to automatically raise HTTPException on invalid auth
            refresh_interval: Time interval in seconds to refresh token validation (0 to disable)
        """
        super(JWTBearer, self).__init__(auto_error=auto_error)
        self.refresh_interval = refresh_interval

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)

        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication scheme. Use Bearer token.",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            token = credentials.credentials

            # Basic security checks
            if not self._is_valid_token_format(token):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token format.",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # Verify token hasn't been revoked
            if is_token_revoked(token, "access"):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has been revoked.",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            user_id = self.verify_jwt(token)
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token.",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # Additional security: Add timestamp to help prevent replay attacks
            request.state.user_id = user_id
            request.state.authenticated_at = int(time.time())
            request.state.token = token  # Store for potential future use

            return token
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    def _is_valid_token_format(self, token: str) -> bool:
        """
        Basic validation of JWT token format (3 parts separated by dots)
        """
        if not token or not isinstance(token, str):
            return False
        parts = token.split('.')
        return len(parts) == 3

    def verify_jwt(self, jwt_token: str) -> Optional[str]:
        try:
            user_id = verify_access_token(jwt_token)
            if user_id:
                return user_id
            return None
        except Exception as e:
            logger.error(f"Error verifying JWT: {e}")
            return None