"""Generate a test JWT token for API testing."""
import jwt
from datetime import datetime, timedelta
from config import settings

def generate_test_token(user_id: str = "test-user-123") -> str:
    """
    Generate a test JWT token for development.

    Args:
        user_id: User identifier to include in token

    Returns:
        JWT token string
    """
    payload = {
        'sub': user_id,  # Standard JWT claim for user ID
        'user_id': user_id,  # Alternative claim
        'exp': datetime.utcnow() + timedelta(hours=24),  # Expires in 24 hours
        'iat': datetime.utcnow()  # Issued at
    }

    token = jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm
    )

    return token


if __name__ == "__main__":
    print("=" * 80)
    print("JWT TOKEN GENERATOR FOR TESTING")
    print("=" * 80)
    print()

    # Generate token for default user
    token = generate_test_token()
    print(f"User ID: test-user-123")
    print(f"Valid for: 24 hours")
    print()
    print("Token:")
    print(token)
    print()
    print("=" * 80)
    print("HOW TO USE IN SWAGGER UI:")
    print("=" * 80)
    print("1. Go to http://localhost:8000/docs")
    print("2. Click the 'Authorize' button (lock icon)")
    print("3. Enter: Bearer " + token)
    print("4. Click 'Authorize' then 'Close'")
    print("5. Now you can test all endpoints!")
    print()
    print("=" * 80)
    print("HOW TO USE WITH CURL:")
    print("=" * 80)
    print(f'curl -H "Authorization: Bearer {token}" http://localhost:8000/tasks')
    print()
