from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db, AsyncSessionLocal
from app.services.resume_service import ResumeService
from app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理：启动时初始化数据库表结构与预置简历数据"""
    try:
        await init_db()
        print("Database tables initialized successfully.")
        async with AsyncSessionLocal() as session:
            await ResumeService.init_seed(session)
    except Exception as e:
        print(f"Warning: Database initialization failed: {e}")
    yield


def create_app() -> FastAPI:
    """初始化并配置 FastAPI 应用"""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        description="HomeWeb 后端 API 服务，为前端展示与互动提供数据支撑",
        lifespan=lifespan,
    )

    # 配置 CORS 跨域支持
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 注册 API 路由
    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get("/", tags=["Root"])
    async def root():
        return {
            "name": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "docs": "/docs",
            "health": f"{settings.API_V1_STR}/health",
        }

    return app


app = create_app()
