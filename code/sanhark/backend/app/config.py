from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:5173"
    MAX_FILE_SIZE: int = 10485760
    UPLOAD_DIR: str = "uploads"
    ALLOWED_EXTENSIONS: str = "sch,brd,pdf,png,jpg,jpeg,svg"
    
    @property
    def allowed_extensions_list(self) -> List[str]:
        return self.ALLOWED_EXTENSIONS.split(",")
    
    class Config:
        env_file = ".env"

settings = Settings()
