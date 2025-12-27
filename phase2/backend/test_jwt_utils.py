"""
Test file for JWT utilities to verify functionality
"""
import os
import sys
sys.path.append('/home/hammadurrehman2006/Desktop/the_evolution_of_todo/phase2/backend')

from src.auth.jwt_utils import jwt_manager, create_access_token, create_refresh_token, verify_access_token, verify_refresh_token, refresh_access_token, revoke_token, TokenType
from src.models.user import User
from src.models.jwt_token import JWTToken
from src.database import engine, create_db_and_tables
from sqlmodel import Session, select
from datetime import datetime, timedelta
import uuid


def test_jwt_functionality():
    """Test all JWT functionality"""
    print("Testing JWT functionality...")

    # Create test user in database
    test_user_id = str(uuid.uuid4())

    with Session(engine) as session:
        # Check if user already exists
        existing_user = session.get(User, test_user_id)
        if existing_user:
            session.delete(existing_user)
            session.commit()

        # Create new test user
        test_user = User(
            user_id=test_user_id,
            email=f"test_{uuid.uuid4()}@example.com",
            password_hash="test_hash",
            is_active=True
        )
        session.add(test_user)
        session.commit()
        session.refresh(test_user)

    print(f"Created test user with ID: {test_user_id}")

    # Test 1: Create tokens
    print("\n1. Testing token creation...")
    access_token = create_access_token(test_user_id)
    refresh_token = create_refresh_token(test_user_id)

    print(f"Access token created: {access_token is not None}")
    print(f"Refresh token created: {refresh_token is not None}")

    # Test 2: Verify tokens
    print("\n2. Testing token verification...")
    verified_user_id = verify_access_token(access_token)
    print(f"Access token verification: {verified_user_id == test_user_id}")

    verified_user_id_refresh = verify_refresh_token(refresh_token)
    print(f"Refresh token verification: {verified_user_id_refresh == test_user_id}")

    # Test 3: Token refresh
    print("\n3. Testing token refresh...")
    refresh_result = refresh_access_token(refresh_token)
    if refresh_result:
        new_access_token = refresh_result["access_token"]
        print(f"New access token after refresh: {new_access_token is not None}")

        # Verify the new token
        new_verified = verify_access_token(new_access_token)
        print(f"New access token verification: {new_verified == test_user_id}")
    else:
        print("Token refresh failed")

    # Test 4: Token revocation
    print("\n4. Testing token revocation...")
    revoke_result = revoke_token(access_token, TokenType.ACCESS)
    print(f"Access token revocation result: {revoke_result}")

    # Verify revoked token
    revoked_verification = verify_access_token(access_token)
    print(f"Verification of revoked token: {revoked_verification is None}")

    # Test 5: Check database integration
    print("\n5. Testing database integration...")
    user_tokens = jwt_manager.get_user_tokens(test_user_id)
    print(f"Number of tokens in database for user: {len(user_tokens)}")

    for token in user_tokens:
        print(f"  - Token ID: {token.token_id}, Type: {token.type}, Expired: {token.expires_at < datetime.utcnow()}, Revoked: {token.revoked}")

    # Test 6: Test cleanup of expired tokens
    print("\n6. Testing expired token cleanup...")
    cleanup_count = jwt_manager.cleanup_expired_tokens()
    print(f"Number of expired tokens cleaned up: {cleanup_count}")

    # Clean up test user
    with Session(engine) as session:
        user_to_delete = session.get(User, test_user_id)
        if user_to_delete:
            session.delete(user_to_delete)
            session.commit()

    print("\nTest completed successfully!")


if __name__ == "__main__":
    # Initialize database
    create_db_and_tables()

    # Set required environment variables for testing
    os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-testing"
    os.environ["JWT_REFRESH_SECRET_KEY"] = "test-refresh-secret-key-for-testing"

    test_jwt_functionality()