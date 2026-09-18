import os
from typing import List
from dotenv import load_dotenv

# 加载 .env 环境变量（如果存在）
load_dotenv()


class Settings:
    PROJECT_NAME: str = "HomeWeb Backend"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

    # 数据库配置（默认 PostgreSQL，支持自定义配置）
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://chen:123456@127.0.0.1:5432/homeweb",
    )

    # 跨域配置：允许本地开发前端访问
    _cors_origins_env: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
    )

    @property
    def CORS_ORIGINS(self) -> List[str]:
        return [origin.strip() for origin in self._cors_origins_env.split(",") if origin.strip()]


settings = Settings()
