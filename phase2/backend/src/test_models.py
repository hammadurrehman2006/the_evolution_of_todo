"""
Test script to verify database models and relationships work properly with Neon PostgreSQL
"""
from datetime import datetime, timedelta
from .database import engine, get_session
from .models import User, UserRole, Todo, Session, JWTToken, TokenType
from sqlmodel import SQLModel, select
import uuid


def test_model_creation():
    """Test creating and querying models with relationships"""
    print("Testing model creation and relationships...")

    # Create tables first
    SQLModel.metadata.create_all(bind=engine)

    with get_session() as session:
        # Create a test user
        user = User(
            email="test@example.com",
            password_hash="hashed_password_here",
            first_name="Test",
            last_name="User",
            role=UserRole.USER.value
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        print(f"Created user: {user}")

        # Create a todo for the user
        todo = Todo(
            user_id=user.user_id,
            title="Test Todo",
            description="This is a test todo item"
        )
        session.add(todo)
        session.commit()
        session.refresh(todo)
        print(f"Created todo: {todo}")

        # Create a session for the user
        session_obj = Session(
            user_id=user.user_id,
            token_id="test_token_id",
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        session.add(session_obj)
        session.commit()
        session.refresh(session_obj)
        print(f"Created session: {session_obj}")

        # Create a JWT token for the user
        jwt_token = JWTToken(
            user_id=user.user_id,
            type=TokenType.ACCESS.value,
            expires_at=datetime.utcnow() + timedelta(minutes=30)
        )
        session.add(jwt_token)
        session.commit()
        session.refresh(jwt_token)
        print(f"Created JWT token: {jwt_token}")

        # Test relationships by querying
        # Get user with their todos
        user_with_todos = session.get(User, user.user_id)
        print(f"User's todos count: {len(user_with_todos.todos)}")

        # Get user with their sessions
        user_with_sessions = session.get(User, user.user_id)
        print(f"User's sessions count: {len(user_with_sessions.sessions)}")

        # Get user with their JWT tokens
        user_with_tokens = session.get(User, user.user_id)
        print(f"User's JWT tokens count: {len(user_with_tokens.jwt_tokens)}")

        # Test querying todos by user_id (multi-user isolation)
        user_todos = session.exec(select(Todo).where(Todo.user_id == user.user_id)).all()
        print(f"Todos for user: {len(user_todos)}")

        # Test updating a todo
        todo.description = "Updated description"
        session.add(todo)
        session.commit()
        print(f"Updated todo: {todo}")

        # Test marking todo as completed
        todo.completed = True
        todo.completed_at = datetime.utcnow()
        session.add(todo)
        session.commit()
        print(f"Completed todo: {todo}")

    print("All tests passed successfully!")


if __name__ == "__main__":
    test_model_creation()