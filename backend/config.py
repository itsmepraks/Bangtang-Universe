"""
Configuration management for the BTS Universe application.
Loads environment variables and provides centralized configuration.
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class DatabaseConfig(BaseSettings):
    """Database configuration settings."""
    host: str = Field(default="localhost", env="DB_HOST")
    port: int = Field(default=5432, env="DB_PORT")
    name: str = Field(default="bts_universe", env="DB_NAME")
    user: str = Field(default="user", env="DB_USER")
    password: str = Field(default="password", env="DB_PASSWORD")
    
    @property
    def url(self) -> str:
        """Construct PostgreSQL connection URL."""
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


class AWSConfig(BaseSettings):
    """AWS configuration settings."""
    access_key_id: Optional[str] = Field(default=None, env="AWS_ACCESS_KEY_ID")
    secret_access_key: Optional[str] = Field(default=None, env="AWS_SECRET_ACCESS_KEY")
    region: str = Field(default="us-east-1", env="AWS_REGION")
    s3_bucket_name: str = Field(default="bts-universe-models", env="AWS_S3_BUCKET_NAME")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


class GeniusConfig(BaseSettings):
    """Genius API configuration settings."""
    api_key: Optional[str] = Field(default=None, env="GENIUS_API_KEY")
    access_token: Optional[str] = Field(default=None, env="GENIUS_ACCESS_TOKEN")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


class SpotifyConfig(BaseSettings):
    """Spotify API configuration settings."""
    client_id: Optional[str] = Field(default=None, env="SPOTIFY_CLIENT_ID")
    client_secret: Optional[str] = Field(default=None, env="SPOTIFY_CLIENT_SECRET")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


class Config(BaseSettings):
    """Main application configuration."""
    database: DatabaseConfig = DatabaseConfig()
    aws: AWSConfig = AWSConfig()
    genius: GeniusConfig = GeniusConfig()
    spotify: SpotifyConfig = SpotifyConfig()
    
    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global configuration instance
config = Config()


