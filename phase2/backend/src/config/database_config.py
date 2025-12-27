"""
Database configuration for Neon PostgreSQL
"""
import os
from typing import Optional


class DatabaseConfig:
    """Configuration class for database settings"""

    # Neon PostgreSQL connection settings
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")

    # Fallback to Neon connection if DATABASE_URL not set
    if not DATABASE_URL:
        NEON_HOST = os.getenv("NEON_HOST", "ep-aged-snowflake-12345678.us-east-1.aws.neon.tech")
        NEON_PORT = os.getenv("NEON_PORT", "5432")
        NEON_DATABASE = os.getenv("NEON_DATABASE", "todo_db")
        NEON_USER = os.getenv("NEON_USER", "default")
        NEON_PASSWORD = os.getenv("NEON_PASSWORD", "password")  # Should be set securely

        DATABASE_URL = f"postgresql://{NEON_USER}:{NEON_PASSWORD}@{NEON_HOST}:{NEON_PORT}/{NEON_DATABASE}?sslmode=require"

    # Engine configuration
    POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "5"))
    MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "300"))  # 5 minutes
    POOL_PRE_PING = os.getenv("DB_POOL_PRE_PING", "True").lower() == "true"
    ECHO = os.getenv("DB_ECHO", "False").lower() == "true"

    # Connection settings
    SSL_MODE = os.getenv("DB_SSL_MODE", "require")
    CONNECT_TIMEOUT = int(os.getenv("DB_CONNECT_TIMEOUT", "10"))

    @classmethod
    def get_engine_kwargs(cls):
        """Get engine configuration as kwargs for create_engine"""
        return {
            "echo": cls.ECHO,
            "pool_pre_ping": cls.POOL_PRE_PING,
            "pool_recycle": cls.POOL_RECYCLE,
            "pool_size": cls.POOL_SIZE,
            "max_overflow": cls.MAX_OVERFLOW,
            "pool_timeout": cls.POOL_TIMEOUT,
            "connect_args": {
                "sslmode": cls.SSL_MODE,
                "connect_timeout": cls.CONNECT_TIMEOUT,
            }
        }