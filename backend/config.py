import os
from typing import Optional

class Settings:
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://denis@localhost/ibuyer_db"
    )
    
    # Security
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "dev-secret-key-change-in-production"
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    # Application
    APP_NAME: str = "IBuyer Thailand"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    SERVE_FRONTEND: bool = os.getenv("SERVE_FRONTEND", "false").lower() == "true"
    
    # CORS
    FRONTEND_URL: str = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    )
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Email (for future implementation)
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST")
    SMTP_PORT: Optional[int] = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@ibuyer-thailand.com")
    
    @property
    def is_production(self) -> bool:
        return not self.DEBUG
    
    @property
    def database_url_with_pool(self) -> str:
        """Add connection pooling settings for production"""
        if self.is_production and "?" not in self.DATABASE_URL:
            return f"{self.DATABASE_URL}?pool_size=10&max_overflow=20"
        return self.DATABASE_URL

settings = Settings()