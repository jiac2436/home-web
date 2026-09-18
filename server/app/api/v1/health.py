import time
from fastapi import APIRouter
from app.core.config import settings
from app.schemas.common import ApiResponse

router = APIRouter()


@router.get("/health", response_model=ApiResponse[dict], summary="服务健康检查")
async def health_check():
    """获取后端服务的当前健康状态与元信息"""
    data = {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": int(time.time()),
    }
    return ApiResponse.success(data=data, message="Service is up and running")
