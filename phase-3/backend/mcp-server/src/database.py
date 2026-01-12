from sqlmodel import SQLModel, create_engine, Session
from .config import settings

# Optimized engine for Neon with connection pooling
connect_args = {}
if settings.database_url.startswith("postgresql"):
    connect_args["sslmode"] = "require"

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args=connect_args
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
