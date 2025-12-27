import os
from typing import Optional

class Config:
    """Application configuration class."""

    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    NEON_PROJECT_ID: str = os.getenv("NEON_PROJECT_ID", "")
    NEON_API_KEY: str = os.getenv("NEON_API_KEY", "")

    # JWT Configuration
    JWT_ACCESS_TOKEN_SECRET: str = os.getenv("JWT_ACCESS_TOKEN_SECRET", "dev-super-secret-access-token-key-here-make-it-long-and-random")
    JWT_REFRESH_TOKEN_SECRET: str = os.getenv("JWT_REFRESH_TOKEN_SECRET", "dev-super-secret-refresh-token-key-here-make-it-long-and-random")
    JWT_ACCESS_TOKEN_EXPIRY: str = os.getenv("JWT_ACCESS_TOKEN_EXPIRY", "15m")
    JWT_REFRESH_TOKEN_EXPIRY: str = os.getenv("JWT_REFRESH_TOKEN_EXPIRY", "7d")

    # Backend Configuration
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "localhost")
    BACKEND_CORS_ORIGINS: list = [origin.strip() for origin in os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")]

    # Authentication Configuration
    ACCESS_TOKEN_COOKIE_NAME: str = os.getenv("ACCESS_TOKEN_COOKIE_NAME", "access_token")
    REFRESH_TOKEN_COOKIE_NAME: str = os.getenv("REFRESH_TOKEN_COOKIE_NAME", "refresh_token")
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "false").lower() == "true"
    COOKIE_HTTP_ONLY: bool = os.getenv("COOKIE_HTTP_ONLY", "true").lower() == "true"
    COOKIE_SAME_SITE: str = os.getenv("COOKIE_SAME_SITE", "strict")

    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "json")

    # Environment
    NODE_ENV: str = os.getenv("NODE_ENV", "development")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = NODE_ENV == "development"

    @classmethod
    def validate(cls) -> None:
        """Validate that required configuration values are present."""
        required_vars = ["DATABASE_URL"]

        for var in required_vars:
            value = getattr(cls, var)
            if not value or (isinstance(value, str) and value.strip() == ""):
                raise ValueError(f"Required environment variable {var} is not set")

        # Validate JWT secrets are not default values in production
        if cls.APP_ENV == "production":
            dev_secret = "dev-super-secret"
            if dev_secret in cls.JWT_ACCESS_TOKEN_SECRET or dev_secret in cls.JWT_REFRESH_TOKEN_SECRET:
                raise ValueError("Default JWT secrets cannot be used in production")

# Initialize config
config = Config()
config.validate()