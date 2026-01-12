"""Database connection and session management with SQLModel."""
from sqlmodel import SQLModel, create_engine, Session
from config import settings

# Create database engine with connection pooling
engine = create_engine(
    settings.database_url,
    echo=True,  # Log SQL queries (disable in production)
    pool_pre_ping=True,  # Verify connections before using
    pool_size=10,  # Connection pool size
    max_overflow=20,  # Maximum overflow connections
)


def create_db_and_tables():
    """Create all database tables from SQLModel metadata."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """
    Dependency for FastAPI routes to get database session.

    Yields:
        Session: Database session that auto-closes after use
    """
    with Session(engine) as session:
        yield session
