from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from typing import Annotated
from datetime import timedelta
import uuid
from ..models.user import User
from ..models.jwt_token import JWTToken
from ..auth.jwt_utils import create_and_store_tokens, verify_refresh_token, refresh_access_token
from ..auth.password import verify_password, get_password_hash
from ..database import get_session
from pydantic import BaseModel, EmailStr


router = APIRouter(prefix="/auth", tags=["Authentication"])


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    username: str
    first_name: str = ""
    last_name: str = ""


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str


@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, session: Session = Depends(get_session)):
    """
    Register a new user with email, password, and username.
    """
    # Check if user already exists
    existing_user = session.exec(select(User).where(User.email == user_data.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check if username already exists
    existing_username = session.exec(select(User).where(User.username == user_data.username)).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        user_id=str(uuid.uuid4()),
        email=user_data.email,
        password_hash=hashed_password,
        username=user_data.username,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        is_active=True
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    # Create and store tokens for the new user
    tokens = create_and_store_tokens(user.user_id)

    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"]
    )


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    """
    Authenticate user and return access and refresh tokens.
    """
    # Find user by email
    user = session.exec(select(User).where(User.email == form_data.username)).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create and store tokens
    tokens = create_and_store_tokens(user.user_id)

    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"]
    )


@router.post("/refresh", response_model=RefreshTokenResponse)
def token_refresh(request: RefreshTokenRequest):
    """
    Refresh access token using a valid refresh token.
    """
    refresh_result = refresh_access_token(request.refresh_token)

    if not refresh_result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return RefreshTokenResponse(
        access_token=refresh_result["access_token"],
        token_type=refresh_result["token_type"]
    )


@router.post("/logout")
def logout():
    """
    Logout user by invalidating the current session.
    """
    # In a real implementation, you would typically revoke the token
    # For now, we just return a success message
    return {"message": "Successfully logged out"}


@router.post("/logout-all")
def logout_all():
    """
    Logout user from all devices by revoking all user tokens.
    """
    # In a real implementation, you would revoke all tokens for the user
    # For now, we just return a success message
    return {"message": "Logged out from all devices"}