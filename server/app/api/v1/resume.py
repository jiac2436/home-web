from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.common import ApiResponse
from app.schemas.resume import ResumeProfileResponse
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/resume")


@router.get("/profile", response_model=ApiResponse[ResumeProfileResponse], summary="获取数据库存储的完整简历数据")
async def get_resume_profile(
    db: AsyncSession = Depends(get_db),
):
    """获取贾晨的真实个人简历数据（包含基本信息、工作履历、精选项目、联系方式及中英文对照）"""
    data = await ResumeService.get_profile(db=db)
    return ApiResponse.success(data=data, message="Resume profile retrieved successfully")
