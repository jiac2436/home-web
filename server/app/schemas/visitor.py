from typing import Literal
from pydantic import BaseModel, Field


class VisitorTrackResponse(BaseModel):
    """访客打卡返回数据模型"""
    visit_type: Literal["first_visit", "today_repeat", "returning_visit"] = Field(
        ...,
        description="访问类型：首次访问、当日重复访问、隔日老友重访",
    )
    today_uv: int = Field(..., description="今日去重访客量 (Today UV)")
    total_uv: int = Field(..., description="历史累计独立访客量 (Total UV)")
    message: str = Field(..., description="中文个性化提示语")
    message_en: str = Field(..., description="英文个性化提示语")
    bubble_tag: str = Field(..., description="小男孩气泡框状态徽章 (中文)")
    bubble_tag_en: str = Field(..., description="小男孩气泡框状态徽章 (英文)")
    client_ip: str = Field(..., description="客户端脱敏识别 IP")


class VisitorStatsResponse(BaseModel):
    """访客统计只读概览"""
    today_uv: int = Field(..., description="今日去重访客量")
    total_uv: int = Field(..., description="历史累计独立访客量")
    today_total_hits: int = Field(..., description="今日总请求点击量")
