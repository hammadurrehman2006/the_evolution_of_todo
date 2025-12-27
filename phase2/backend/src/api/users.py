from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from ..models.user import User
from ..database import get_session
from ..auth.jwt_utils import verify_access_token
from pydantic import BaseModel


router = APIRouter(prefix="/users", tags=["Users"])


class UserProfileResponse(BaseModel):
    user_id: str
    email: str
    username: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    created_at: str
    updated_at: str
    last_login_at: str = None


class UserUpdateRequest(BaseModel):
    username: str = None
    first_name: str = None
    last_name: str = None


@router.get("/profile", response_model=UserProfileResponse)
def get_user_profile(
    current_user_id: str = Depends(verify_access_token),
    session: Session = Depends(get_session)
):
    """
    Get the profile information for the current user.
    """
    user = session.get(User, current_user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserProfileResponse(
        user_id=user.user_id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at.isoformat() if user.created_at else None,
        updated_at=user.updated_at.isoformat() if user.updated_at else None,
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None
    )


@router.put("/profile", response_model=UserProfileResponse)
def update_user_profile(
    user_update: UserUpdateRequest,
    current_user_id: str = Depends(verify_access_token),
    session: Session = Depends(get_session)
):
    """
    Update the profile information for the current user.
    """
    user = session.get(User, current_user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update fields if provided
    if user_update.username is not None:
        # Check if username is already taken by another user
        existing_user = session.exec(
            select(User).where(
                User.username == user_update.username,
                User.user_id != current_user_id
            )
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

        user.username = user_update.username

    if user_update.first_name is not None:
        user.first_name = user_update.first_name

    if user_update.last_name is not None:
        user.last_name = user_update.last_name

    session.add(user)
    session.commit()
    session.refresh(user)

    return UserProfileResponse(
        user_id=user.user_id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at.isoformat() if user.created_at else None,
        updated_at=user.updated_at.isoformat() if user.updated_at else None,
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None
    )


@router.get("/{user_id}", response_model=UserProfileResponse)
def get_user_by_id(
    user_id: str,
    current_user_id: str = Depends(verify_access_token),  # This ensures user is authenticated
    session: Session = Depends(get_session)
):
    """
    Get a user's public profile by their user ID.
    Note: This endpoint could be extended to have different permissions based on user roles.
    For now, it's limited to getting your own profile by ID.
    """
    # For security, we'll only allow users to get their own profile
    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's profile"
        )

    user = session.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserProfileResponse(
        user_id=user.user_id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at.isoformat() if user.created_at else None,
        updated_at=user.updated_at.isoformat() if user.updated_at else None,
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None
    )