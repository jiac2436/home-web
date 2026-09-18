from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.common import ApiResponse
from app.schemas.visitor import VisitorStatsResponse, VisitorTrackResponse
from app.services.visitor_service import VisitorService, extract_client_ip

router = APIRouter(prefix="/visitor")


@router.post("/track", response_model=ApiResponse[VisitorTrackResponse], summary="记录访客打卡并获取欢迎文案")
async def track_visitor(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """根据客户端 IP 进行当日去重打卡，并生成小男孩个性化欢迎台词"""
    ip = extract_client_ip(request)
    ua = request.headers.get("user-agent")
    result = await VisitorService.record_visit(db=db, ip=ip, user_agent=ua)
    return ApiResponse.success(data=result, message="Visitor visit recorded successfully")


@router.get("/stats", response_model=ApiResponse[VisitorStatsResponse], summary="只读获取访客统计概览")
async def get_visitor_stats(
    db: AsyncSession = Depends(get_db),
):
    """获取今日访客量与历史独立访客量"""
    stats = await VisitorService.get_stats(db=db)
    return ApiResponse.success(data=stats)
