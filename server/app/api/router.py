from fastapi import APIRouter
from app.api.v1 import health, papers, visitor, resume

api_router = APIRouter()

# 注册 v1 路由模块
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(papers.router, tags=["Papers"])
api_router.include_router(visitor.router, tags=["Visitor"])
api_router.include_router(resume.router, tags=["Resume"])
