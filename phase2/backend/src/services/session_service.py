from typing import Optional
from datetime import datetime, timedelta
from sqlmodel import Session, select
from fastapi import HTTPException, status
import secrets

from ..models.user import User
from ..models.session import Session as SessionModel
from ..models.jwt_token import JWTToken
from ..database import get_session
from ..config import settings


class SessionService:
    def __init__(self, db_session: Session):
        self.db_session = db_session

    def create_session(self, user_id: str, user_agent: str = None, ip_address: str = None) -> SessionModel:
        """Create a new session for a user."""
        # Revoke existing sessions for the user if needed (optional)
        # This is configurable based on security requirements

        # Generate a unique session token
        session_token = secrets.token_urlsafe(32)

        # Create session expiration (default to 24 hours)
        expires_at = datetime.utcnow() + timedelta(hours=24)

        session = SessionModel(
            user_id=user_id,
            token_id=session_token,
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address
        )

        self.db_session.add(session)
        self.db_session.commit()
        self.db_session.refresh(session)

        return session

    def get_session_by_token(self, token_id: str) -> Optional[SessionModel]:
        """Get an active session by its token ID."""
        session = self.db_session.exec(
            select(SessionModel)
            .where(SessionModel.token_id == token_id)
            .where(SessionModel.expires_at > datetime.utcnow())
        ).first()

        return session

    def get_sessions_by_user(self, user_id: str) -> list[SessionModel]:
        """Get all active sessions for a user."""
        sessions = self.db_session.exec(
            select(SessionModel)
            .where(SessionModel.user_id == user_id)
            .where(SessionModel.expires_at > datetime.utcnow())
        ).all()

        return sessions

    def revoke_session(self, token_id: str) -> bool:
        """Revoke a specific session by marking it as expired."""
        session = self.get_session_by_token(token_id)
        if session:
            session.expires_at = datetime.utcnow() - timedelta(seconds=1)  # Mark as expired
            self.db_session.add(session)
            self.db_session.commit()
            return True
        return False

    def revoke_all_user_sessions(self, user_id: str) -> int:
        """Revoke all active sessions for a user."""
        sessions = self.db_session.exec(
            select(SessionModel)
            .where(SessionModel.user_id == user_id)
            .where(SessionModel.expires_at > datetime.utcnow())
        ).all()

        revoked_count = 0
        for session in sessions:
            session.expires_at = datetime.utcnow() - timedelta(seconds=1)  # Mark as expired
            self.db_session.add(session)
            revoked_count += 1

        self.db_session.commit()
        return revoked_count

    def cleanup_expired_sessions(self) -> int:
        """Remove all expired sessions from the database."""
        expired_sessions = self.db_session.exec(
            select(SessionModel)
            .where(SessionModel.expires_at <= datetime.utcnow())
        ).all()

        deleted_count = 0
        for session in expired_sessions:
            self.db_session.delete(session)
            deleted_count += 1

        self.db_session.commit()
        return deleted_count

    def refresh_session(self, token_id: str, user_agent: str = None, ip_address: str = None) -> Optional[SessionModel]:
        """Extend an existing session's expiration time."""
        session = self.get_session_by_token(token_id)
        if session:
            # Extend the session by 24 hours from now
            session.expires_at = datetime.utcnow() + timedelta(hours=24)
            session.last_accessed_at = datetime.utcnow()

            # Update user agent and IP if provided
            if user_agent:
                session.user_agent = user_agent
            if ip_address:
                session.ip_address = ip_address

            self.db_session.add(session)
            self.db_session.commit()
            self.db_session.refresh(session)

            return session
        return None