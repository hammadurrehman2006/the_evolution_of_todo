from typing import Optional
from datetime import datetime, timedelta
from sqlmodel import Session, select
from fastapi import HTTPException, status
from passlib.context import CryptContext
import secrets
import string

from ..models.user import User
from ..models.jwt_token import JWTToken
from ..database import get_session
from ..config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(self, db_session: Session):
        self.db_session = db_session

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a plain password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Hash a password."""
        return pwd_context.hash(password)

    def create_user(self, email: str, password: str, first_name: str = None, last_name: str = None) -> User:
        """Create a new user with hashed password."""
        # Check if user already exists
        existing_user = self.db_session.exec(
            select(User).where(User.email == email)
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash the password
        hashed_password = self.get_password_hash(password)

        # Generate email verification token
        verification_token = self.generate_verification_token()

        # Create new user
        user = User(
            email=email,
            password_hash=hashed_password,
            first_name=first_name,
            last_name=last_name,
            email_verification_token=verification_token,
            email_verified=False
        )

        self.db_session.add(user)
        self.db_session.commit()
        self.db_session.refresh(user)

        return user

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = self.db_session.exec(
            select(User).where(User.email == email)
        ).first()

        if not user or not self.verify_password(password, user.password_hash):
            return None

        return user

    def generate_verification_token(self) -> str:
        """Generate a random token for email verification."""
        return secrets.token_urlsafe(32)

    def verify_email_token(self, token: str) -> Optional[User]:
        """Verify email verification token and activate the user."""
        user = self.db_session.exec(
            select(User).where(User.email_verification_token == token)
        ).first()

        if not user:
            return None

        # Update user to mark email as verified
        user.email_verified = True
        user.email_verification_token = None
        user.updated_at = datetime.utcnow()

        self.db_session.add(user)
        self.db_session.commit()
        self.db_session.refresh(user)

        return user

    def generate_password_reset_token(self) -> str:
        """Generate a random token for password reset."""
        return secrets.token_urlsafe(32)

    def create_password_reset_token(self, email: str) -> Optional[str]:
        """Create a password reset token for a user."""
        user = self.db_session.exec(
            select(User).where(User.email == email)
        ).first()

        if not user:
            # Don't reveal that the email doesn't exist for security
            return ""

        reset_token = self.generate_password_reset_token()
        user.password_reset_token = reset_token
        user.password_reset_expires = datetime.utcnow() + timedelta(hours=1)
        user.updated_at = datetime.utcnow()

        self.db_session.add(user)
        self.db_session.commit()

        return reset_token

    def verify_password_reset_token(self, token: str, new_password: str) -> bool:
        """Verify password reset token and update the password."""
        user = self.db_session.exec(
            select(User).where(User.password_reset_token == token)
        ).first()

        if not user or user.password_reset_expires < datetime.utcnow():
            return False

        # Update password
        user.password_hash = self.get_password_hash(new_password)
        user.password_reset_token = None
        user.password_reset_expires = None
        user.updated_at = datetime.utcnow()

        self.db_session.add(user)
        self.db_session.commit()

        return True

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.db_session.exec(
            select(User).where(User.email == email)
        ).first()

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        return self.db_session.exec(
            select(User).where(User.user_id == user_id)
        ).first()

    def update_user_last_login(self, user_id: str):
        """Update user's last login timestamp."""
        user = self.get_user_by_id(user_id)
        if user:
            user.last_login_at = datetime.utcnow()
            user.updated_at = datetime.utcnow()
            self.db_session.add(user)
            self.db_session.commit()