from datetime import datetime, timezone
from typing import Optional, Tuple
from fastapi import Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.visitor import DailyVisit, Visitor
from app.schemas.visitor import VisitorStatsResponse, VisitorTrackResponse


def extract_client_ip(request: Request) -> str:
    """精准提取客户端真实 IP（支持反向代理透传头）"""
    # 1. 优先从 X-Forwarded-For 获取（多个代理时最左侧为源客户端真实 IP）
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
        if client_ip:
            return client_ip

    # 2. 从 X-Real-IP 获取
    real_ip = request.headers.get("x-real-ip")
    if real_ip and real_ip.strip():
        return real_ip.strip()

    # 3. 降级使用底层套接字 host
    if request.client and request.client.host:
        return request.client.host.strip()

    return "127.0.0.1"


class VisitorService:
    """访客统计与 IP 当日去重核心业务服务"""

    @staticmethod
    async def record_visit(
        db: AsyncSession,
        ip: str,
        user_agent: Optional[str] = None,
    ) -> VisitorTrackResponse:
        today = datetime.now(timezone.utc).date()

        # 1. 查询全局访客档案及当日打卡记录
        visitor_stmt = select(Visitor).where(Visitor.ip == ip)
        visitor_res = await db.execute(visitor_stmt)
        visitor = visitor_res.scalar_one_or_none()

        daily_stmt = select(DailyVisit).where(
            DailyVisit.ip == ip,
            DailyVisit.visit_date == today,
        )
        daily_res = await db.execute(daily_stmt)
        daily_visit = daily_res.scalar_one_or_none()

        # 2. 三种场景状态判定与数据原子写入
        if visitor is None:
            # 场景 A：首次访问 (first_visit)
            visit_type = "first_visit"
            visitor = Visitor(
                ip=ip,
                total_visit_count=1,
                user_agent=user_agent[:500] if user_agent else None,
            )
            db.add(visitor)

            daily_visit = DailyVisit(
                ip=ip,
                visit_date=today,
                visit_count_today=1,
            )
            db.add(daily_visit)

        elif daily_visit is not None:
            # 场景 B：当日重复访问 (today_repeat)
            visit_type = "today_repeat"
            visitor.total_visit_count += 1
            visitor.last_visited_at = func.now()

            daily_visit.visit_count_today += 1
            daily_visit.updated_at = func.now()

        else:
            # 场景 C：隔日老友重访 (returning_visit)
            visit_type = "returning_visit"
            visitor.total_visit_count += 1
            visitor.last_visited_at = func.now()

            daily_visit = DailyVisit(
                ip=ip,
                visit_date=today,
                visit_count_today=1,
            )
            db.add(daily_visit)

        await db.commit()

        # 3. 统计指标聚合计算
        # 今日去重访客量 (Today UV)
        today_uv_stmt = select(func.count(DailyVisit.id)).where(DailyVisit.visit_date == today)
        today_uv_res = await db.execute(today_uv_stmt)
        today_uv = today_uv_res.scalar_one() or 1

        # 历史总独立访客量 (Total UV)
        total_uv_stmt = select(func.count(Visitor.id))
        total_uv_res = await db.execute(total_uv_stmt)
        total_uv = total_uv_res.scalar_one() or 1

        # 4. 根据场景严格格式化提示文案与徽章
        if visit_type == "first_visit":
            msg = f"🎉 欢迎来访！你是今天的第 {today_uv} 位访客，很高兴认识你～"
            msg_en = f"🎉 Welcome! You are today's visitor #{today_uv}. Nice to meet you!"
            tag = "首次来访"
            tag_en = "First Visit"
        elif visit_type == "today_repeat":
            msg = f"欢迎回来！你是第 {total_uv} 位访客，祝你今天过得愉快～"
            msg_en = f"Welcome back! You are visitor #{total_uv}. Have a wonderful day!"
            tag = "今日已打卡"
            tag_en = "Checked In"
        else:
            msg = f"✨ 好久不见老朋友！欢迎再次回来，你是今天的第 {today_uv} 位访客～"
            msg_en = f"✨ Long time no see, friend! Welcome back, you're today's visitor #{today_uv}~"
            tag = "老友重访"
            tag_en = "Welcome Back"

        return VisitorTrackResponse(
            visit_type=visit_type,
            today_uv=today_uv,
            total_uv=total_uv,
            message=msg,
            message_en=msg_en,
            bubble_tag=tag,
            bubble_tag_en=tag_en,
            client_ip=ip,
        )

    @staticmethod
    async def get_stats(db: AsyncSession) -> VisitorStatsResponse:
        """只读获取当前访客概览"""
        today = datetime.now(timezone.utc).date()

        today_uv_stmt = select(func.count(DailyVisit.id)).where(DailyVisit.visit_date == today)
        today_uv = (await db.execute(today_uv_stmt)).scalar_one() or 0

        total_uv_stmt = select(func.count(Visitor.id))
        total_uv = (await db.execute(total_uv_stmt)).scalar_one() or 0

        today_hits_stmt = select(func.coalesce(func.sum(DailyVisit.visit_count_today), 0)).where(
            DailyVisit.visit_date == today
        )
        today_hits = (await db.execute(today_hits_stmt)).scalar_one() or 0

        return VisitorStatsResponse(
            today_uv=today_uv,
            total_uv=total_uv,
            today_total_hits=today_hits,
        )
