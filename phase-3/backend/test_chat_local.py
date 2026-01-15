import sys
import os
import pytest
from fastapi.testclient import TestClient
import jwt
from datetime import datetime, timedelta

# Add current directory to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app
from config import settings

client = TestClient(app)

def create_test_token():
    payload = {
        "sub": "test_user_123",
        "user_id": "test_user_123",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

def test_chat_haiku():
    token = create_test_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Testing /chat endpoint with message: 'Write a haiku about coding.'")
    response = client.post(
        "/chat",
        headers=headers,
        json={"message": "Write a haiku about coding."}
    )
    
    if response.status_code == 200:
        data = response.json()
        print("\nSuccess!")
        print(f"Response: {data.get('response')}")
        print(f"Session ID: {data.get('sessionId')}")
    else:
        print(f"\nFailed with status {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_chat_haiku()
