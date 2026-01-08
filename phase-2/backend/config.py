"""Configuration settings using Pydantic Settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import json


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    cors_origins: str = '["http://localhost:3000", "https://the-evolution-of-todo-ten.vercel.app", "https://the-evolution-of-todo.vercel.app", "https://teot-phase2.vercel.app", "https://the-evolution-of-todo-git-main-muhammad-hammadurrehmans-projects.vercel.app"]'

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from JSON string."""
        try:
            return json.loads(self.cors_origins)
        except json.JSONDecodeError:
            return ["http://localhost:3000"]


# Global settings instance
settings = Settings()
