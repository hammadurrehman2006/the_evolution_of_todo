"""
Database initialization script for Neon PostgreSQL with all models
"""
from .database import engine
from .models import User, Todo, Session, JWTToken
from sqlmodel import SQLModel


def create_db_and_tables():
    """
    Create all database tables for the application models.
    This ensures all models are properly registered with SQLModel metadata.
    """
    print("Creating database tables...")

    # Create all tables defined in the models
    SQLModel.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


def drop_db_and_tables():
    """
    Drop all database tables (use with caution!).
    """
    print("Dropping database tables...")

    # Drop all tables defined in the models
    SQLModel.metadata.drop_all(bind=engine)
    print("Database tables dropped successfully!")


if __name__ == "__main__":
    create_db_and_tables()