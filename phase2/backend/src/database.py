from sqlmodel import create_engine, Session
from contextlib import contextmanager
from typing import Generator
from .config.database_config import DatabaseConfig
from .models import *  # Import all models to register them

# Create the database engine with Neon-optimized settings from configuration
engine = create_engine(
    DatabaseConfig.DATABASE_URL,
    **DatabaseConfig.get_engine_kwargs()
)


def create_db_and_tables():
    """Create database tables for all models"""
    SQLModel.metadata.create_all(bind=engine)


@contextmanager
def get_session() -> Generator[Session, None, None]:
    """Provide a transactional scope around a series of operations."""
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_session_override():
    """Session dependency for FastAPI to override in tests"""
    yield get_session()