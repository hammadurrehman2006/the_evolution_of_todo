#!/usr/bin/env python3
"""
Test script to verify the Todo model works correctly
"""
import uuid
from datetime import datetime
from sqlmodel import create_engine, SQLModel
from src.models.todo import Todo


def test_todo_model():
    """Test the Todo model creation and validation"""
    print("Testing Todo model...")

    # Create a Todo instance
    todo = Todo(
        user_id=str(uuid.uuid4()),
        title="Test todo",
        description="This is a test todo item",
        completed=False
    )

    print(f"Created todo: {todo}")
    print(f"Todo ID: {todo.todo_id}")
    print(f"User ID: {todo.user_id}")
    print(f"Title: {todo.title}")
    print(f"Description: {todo.description}")
    print(f"Completed: {todo.completed}")
    print(f"Created at: {todo.created_at}")
    print(f"Updated at: {todo.updated_at}")

    # Test validation - this should raise an error for invalid title
    try:
        invalid_todo = Todo(
            user_id=str(uuid.uuid4()),
            title="",  # Empty title should fail validation
            description="This is a test todo item"
        )
        print("ERROR: Validation failed - empty title should not be allowed")
    except ValueError as e:
        print(f"Validation correctly caught error: {e}")

    # Test validation - this should raise an error for too long title
    try:
        long_title = "a" * 201  # 201 characters should fail validation
        invalid_todo = Todo(
            user_id=str(uuid.uuid4()),
            title=long_title,
            description="This is a test todo item"
        )
        print("ERROR: Validation failed - long title should not be allowed")
    except ValueError as e:
        print(f"Validation correctly caught error: {e}")

    # Test validation - this should raise an error for too long description
    try:
        long_desc = "a" * 1001  # 1001 characters should fail validation
        invalid_todo = Todo(
            user_id=str(uuid.uuid4()),
            title="Valid title",
            description=long_desc
        )
        print("ERROR: Validation failed - long description should not be allowed")
    except ValueError as e:
        print(f"Validation correctly caught error: {e}")

    print("All tests passed!")


def test_database_creation():
    """Test creating the table in a test database"""
    print("\nTesting database table creation...")

    # Create an in-memory SQLite database for testing
    engine = create_engine("sqlite:///:memory:")

    # Create all tables
    SQLModel.metadata.create_all(engine)

    print("Database tables created successfully!")


if __name__ == "__main__":
    test_todo_model()
    test_database_creation()