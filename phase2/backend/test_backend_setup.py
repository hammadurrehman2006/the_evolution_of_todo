"""
Test script to verify that all backend components are properly set up
"""
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__)))

def test_imports():
    """Test that all modules can be imported without errors"""
    print("Testing imports...")

    try:
        from src.main import app
        print("✓ Main app imported successfully")
    except Exception as e:
        print(f"✗ Error importing main app: {e}")
        return False

    try:
        from src.models.user import User
        from src.models.todo import Todo
        from src.models.jwt_token import JWTToken
        from src.models.session import Session
        print("✓ All models imported successfully")
    except Exception as e:
        print(f"✗ Error importing models: {e}")
        return False

    try:
        from src.auth.jwt_utils import jwt_manager, create_access_token, verify_access_token
        from src.auth.password import verify_password, get_password_hash
        print("✓ Auth modules imported successfully")
    except Exception as e:
        print(f"✗ Error importing auth modules: {e}")
        return False

    try:
        from src.api import auth, todos, users
        print("✓ API modules imported successfully")
    except Exception as e:
        print(f"✗ Error importing API modules: {e}")
        return False

    try:
        from src.database import engine, get_session
        print("✓ Database modules imported successfully")
    except Exception as e:
        print(f"✗ Error importing database modules: {e}")
        return False

    return True


def test_basic_functionality():
    """Test basic functionality of JWT utilities"""
    print("\nTesting basic functionality...")

    try:
        # Set environment variables for testing
        os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-testing"
        os.environ["JWT_REFRESH_SECRET_KEY"] = "test-refresh-secret-key-for-testing"

        from src.auth.jwt_utils import create_access_token, verify_access_token
        import uuid

        # Test token creation and verification
        test_user_id = str(uuid.uuid4())
        token = create_access_token(test_user_id)

        if not token:
            print("✗ Failed to create access token")
            return False

        print("✓ Access token created successfully")

        # Test token verification
        verified_user_id = verify_access_token(token)

        if verified_user_id != test_user_id:
            print("✗ Token verification failed")
            return False

        print("✓ Token verification successful")
        return True

    except Exception as e:
        print(f"✗ Error in basic functionality test: {e}")
        return False


def test_database_connection():
    """Test database connection"""
    print("\nTesting database connection...")

    try:
        from src.database import engine
        from sqlmodel import text

        # Test the database connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchall()

        print("✓ Database connection test passed")
        return True

    except Exception as e:
        print(f"✗ Database connection test failed: {e}")
        return False


def main():
    """Run all tests"""
    print("="*50)
    print("Testing Backend Setup")
    print("="*50)

    tests = [
        ("Import Tests", test_imports),
        ("Basic Functionality Tests", test_basic_functionality),
        ("Database Connection Tests", test_database_connection),
    ]

    results = []
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        result = test_func()
        results.append((test_name, result))

    print("\n" + "="*50)
    print("Test Summary:")
    all_passed = True
    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"  {test_name}: {status}")
        if not result:
            all_passed = False

    print(f"\nOverall Result: {'ALL TESTS PASSED' if all_passed else 'SOME TESTS FAILED'}")
    print("="*50)

    return all_passed


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)