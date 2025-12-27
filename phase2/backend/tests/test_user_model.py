"""
Test file for User model validation
"""
import pytest
from datetime import datetime
from backend.src.models.user import User, UserRole


def test_user_creation():
    """Test basic user creation with valid data"""
    user = User(
        email="test@example.com",
        password_hash="hashed_password_here",
        username="testuser",
        first_name="Test",
        last_name="User",
        role="user",
        is_active=True
    )

    assert user.email == "test@example.com"
    assert user.username == "testuser"
    assert user.role == "user"
    assert user.is_active is True
    assert isinstance(user.user_id, str)
    assert len(user.user_id) > 0  # UUID should be generated
    assert isinstance(user.created_at, datetime)
    assert isinstance(user.updated_at, datetime)


def test_user_email_validation():
    """Test email validation"""
    # Valid email should pass
    user = User(
        email="valid@example.com",
        password_hash="hashed_password_here"
    )
    assert user.email == "valid@example.com"

    # Invalid email should raise an error when we implement validation at runtime
    try:
        invalid_user = User(
            email="invalid-email",
            password_hash="hashed_password_here"
        )
        # This should not be reached if validation is working
        assert False, "Expected ValueError for invalid email"
    except ValueError:
        pass  # Expected


def test_username_validation():
    """Test username validation"""
    # Valid username should pass
    user = User(
        email="test@example.com",
        password_hash="hashed_password_here",
        username="valid_user123"
    )
    assert user.username == "valid_user123"

    # Username too short should raise error
    try:
        invalid_user = User(
            email="test@example.com",
            password_hash="hashed_password_here",
            username="ab"  # Too short
        )
        assert False, "Expected ValueError for short username"
    except ValueError:
        pass  # Expected


def test_role_validation():
    """Test role validation"""
    # Valid roles should pass
    for role in ["user", "admin", "moderator"]:
        user = User(
            email="test@example.com",
            password_hash="hashed_password_here",
            role=role
        )
        assert user.role == role

    # Invalid role should raise error
    try:
        invalid_user = User(
            email="test@example.com",
            password_hash="hashed_password_here",
            role="invalid_role"
        )
        assert False, "Expected ValueError for invalid role"
    except ValueError:
        pass  # Expected


def test_password_hash_validation():
    """Test password hash validation"""
    # Valid password hash should pass
    user = User(
        email="test@example.com",
        password_hash="hashed_password_here"
    )
    assert user.password_hash == "hashed_password_here"

    # Empty password hash should raise error
    try:
        invalid_user = User(
            email="test@example.com",
            password_hash=""  # Empty
        )
        assert False, "Expected ValueError for empty password hash"
    except ValueError:
        pass  # Expected


if __name__ == "__main__":
    test_user_creation()
    test_user_email_validation()
    test_username_validation()
    test_role_validation()
    test_password_hash_validation()
    print("All tests passed!")