from backend.src.models.user import User
from datetime import datetime
import uuid


def test_user_model():
    """
    Test function to verify the User model structure and functionality.
    """
    # Create a user instance
    user = User(
        email="test@example.com",
        password_hash="hashed_password_here",
        first_name="John",
        last_name="Doe",
        role="user"
    )

    print("User created successfully:")
    print(f"User ID: {user.user_id}")
    print(f"Email: {user.email}")
    print(f"Email Verified: {user.email_verified}")
    print(f"First Name: {user.first_name}")
    print(f"Last Name: {user.last_name}")
    print(f"Role: {user.role}")
    print(f"Is Active: {user.is_active}")
    print(f"Created At: {user.created_at}")
    print(f"Updated At: {user.updated_at}")

    # Verify that UUID was generated
    assert user.user_id is not None
    assert isinstance(user.user_id, str)
    assert len(user.user_id) > 0

    # Verify defaults
    assert user.email_verified is False
    assert user.role == "user"
    assert user.is_active is True

    print("\nAll tests passed!")


if __name__ == "__main__":
    test_user_model()