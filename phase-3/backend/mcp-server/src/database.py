from sqlmodel import SQLModel, Session
from sqlalchemy import create_engine
from .config import settings

# Engine will be initialized lazily
_engine = None

def get_engine():
    """Get or create the database engine (lazy initialization)."""
    global _engine
    if _engine is None:
        connect_args = {}
        if settings.database_url.startswith("postgresql"):
            connect_args["sslmode"] = "require"

        _engine = create_engine(
            settings.database_url,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            connect_args=connect_args
        )
    return _engine

# Property-style access for backward compatibility
class _EngineProxy:
    def __getattr__(self, name):
        return getattr(get_engine(), name)
    
    def __setattr__(self, name, value):
        if name.startswith('_'):
            object.__setattr__(self, name, value)
        else:
            setattr(get_engine(), name, value)

engine = _EngineProxy()

def create_db_and_tables():
    SQLModel.metadata.create_all(get_engine())

def get_session():
    with Session(get_engine()) as session:
        yield session
