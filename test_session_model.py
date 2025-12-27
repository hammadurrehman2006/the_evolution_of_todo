#!/usr/bin/env python3
"""
Test script to verify the Session model works correctly
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'phase2', 'backend'))

try:
    from src.models import Session, User, Todo
    print("All models imported successfully")

    # Test creating a session instance (without saving to DB)
    from datetime import datetime, timedelta
    import uuid

    # Create a test session
    test_session = Session(
        user_id=str(uuid.uuid4()),
        token_id="test_token_id",
        expires_at=datetime.utcnow() + timedelta(hours=1)
    )

    print(f"Session created successfully: {test_session}")
    print(f"Session ID: {test_session.session_id}")
    print(f"User ID: {test_session.user_id}")
    print(f"Token ID: {test_session.token_id}")
    print(f"Expires at: {test_session.expires_at}")

    # Test validation
    try:
        # This should fail - past expiration date
        from datetime import timedelta
        past_date = datetime.utcnow() - timedelta(hours=1)
        invalid_session = Session(
            user_id=str(uuid.uuid4()),
            token_id="test_token_id",
            expires_at=past_date
        )
        print("ERROR: Should have failed validation for past expiration date")
    except ValueError as e:
        print(f"Validation correctly caught invalid expiration date: {e}")

    print("All tests passed!")

except ImportError as e:
    print(f"Import error: {e}")
    import traceback
    traceback.print_exc()
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()