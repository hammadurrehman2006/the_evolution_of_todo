"""
Simple test to verify JWT utilities work correctly
"""
import os
import sys
import uuid
from datetime import datetime, timedelta

# Add the backend directory to the path
sys.path.append('/home/hammadurrehman2006/Desktop/the_evolution_of_todo/phase2/backend')

# Set environment variables for testing
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-testing"
os.environ["JWT_REFRESH_SECRET_KEY"] = "test-refresh-secret-key-for-testing"

def test_jwt_imports():
    """Test that JWT utilities can be imported without errors"""
    try:
        from src.auth.jwt_utils import (
            jwt_manager,
            create_access_token,
            create_refresh_token,
            verify_access_token,
            verify_refresh_token,
            refresh_access_token,
            revoke_token,
            TokenType,
            TokenValidationError,
            TokenRevokedError
        )
        print("✓ All JWT utilities imported successfully")
        return True
    except Exception as e:
        print(f"✗ Import error: {e}")
        return False

def test_token_creation():
    """Test token creation functionality"""
    try:
        from src.auth.jwt_utils import create_access_token, create_refresh_token, TokenType

        # Create a test user ID
        test_user_id = str(uuid.uuid4())

        # Create tokens
        access_token = create_access_token(test_user_id)
        refresh_token = create_refresh_token(test_user_id)

        print(f"✓ Access token created: {access_token is not None}")
        print(f"✓ Refresh token created: {refresh_token is not None}")

        return access_token is not None and refresh_token is not None
    except Exception as e:
        print(f"✗ Token creation error: {e}")
        return False

def test_token_verification():
    """Test token verification functionality"""
    try:
        from src.auth.jwt_utils import create_access_token, verify_access_token, create_refresh_token, verify_refresh_token

        # Create a test user ID
        test_user_id = str(uuid.uuid4())

        # Create tokens
        access_token = create_access_token(test_user_id)
        refresh_token = create_refresh_token(test_user_id)

        # Verify tokens
        verified_access = verify_access_token(access_token)
        verified_refresh = verify_refresh_token(refresh_token)

        print(f"✓ Access token verification: {verified_access == test_user_id}")
        print(f"✓ Refresh token verification: {verified_refresh == test_user_id}")

        return verified_access == test_user_id and verified_refresh == test_user_id
    except Exception as e:
        print(f"✗ Token verification error: {e}")
        return False

def test_jwt_manager():
    """Test JWT Manager class functionality"""
    try:
        from src.auth.jwt_utils import jwt_manager

        # Test that the manager has required methods
        required_methods = [
            'create_access_token', 'create_refresh_token', 'decode_token',
            'verify_access_token', 'verify_refresh_token', 'is_token_revoked',
            'create_and_store_tokens', 'refresh_access_token', 'revoke_token',
            'revoke_all_user_tokens', 'get_user_tokens', 'cleanup_expired_tokens'
        ]

        all_methods_exist = all(hasattr(jwt_manager, method) for method in required_methods)

        print(f"✓ JWT Manager has all required methods: {all_methods_exist}")

        return all_methods_exist
    except Exception as e:
        print(f"✗ JWT Manager error: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing JWT Utilities...")
    print("=" * 50)

    tests = [
        ("Import Test", test_jwt_imports),
        ("Token Creation Test", test_token_creation),
        ("Token Verification Test", test_token_verification),
        ("JWT Manager Test", test_jwt_manager),
    ]

    results = []
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        result = test_func()
        results.append((test_name, result))

    print("\n" + "=" * 50)
    print("Test Summary:")
    all_passed = True
    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"  {test_name}: {status}")
        if not result:
            all_passed = False

    print(f"\nOverall Result: {'ALL TESTS PASSED' if all_passed else 'SOME TESTS FAILED'}")
    return all_passed

if __name__ == "__main__":
    main()