"""Tests for visitor tracking, deduplication, and message generation."""
import uuid
import pytest
from datetime import date, timedelta
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select, delete
from app.main import app
from app.core.database import AsyncSessionLocal, init_db
from app.models.visitor import Visitor, DailyVisit


@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_visitor_flow():
    """综合测试首次访问、当日重复访问去重与隔日重访"""
    await init_db()
    # 随机生成独立 IP 避免历史数据干扰
    random_suffix = uuid.uuid4().hex[:6]
    test_ip = f"198.51.{hash(random_suffix) % 250 + 1}.{hash(random_suffix * 2) % 250 + 1}"
    headers = {"X-Forwarded-For": test_ip, "User-Agent": "pytest-client/1.0"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. 首次访问
        resp1 = await ac.post("/api/v1/visitor/track", headers=headers)
        assert resp1.status_code == 200
        data1 = resp1.json()["data"]
        assert data1["visit_type"] == "first_visit"
        assert "🎉 欢迎来访！你是今天的第" in data1["message"]
        assert "很高兴认识你～" in data1["message"]
        assert data1["bubble_tag"] == "首次来访"
        initial_today_uv = data1["today_uv"]
        initial_total_uv = data1["total_uv"]

        # 2. 当日重复访问（去重验证）
        resp2 = await ac.post("/api/v1/visitor/track", headers=headers)
        assert resp2.status_code == 200
        data2 = resp2.json()["data"]
        assert data2["visit_type"] == "today_repeat"
        assert "欢迎回来！你是第" in data2["message"]
        assert "祝你今天过得愉快～" in data2["message"]
        assert data2["bubble_tag"] == "今日已打卡"
        # 当日重复访问：UV 必须去重不增长！
        assert data2["today_uv"] == initial_today_uv
        assert data2["total_uv"] == initial_total_uv

        # 3. 统计接口验证
        stats_resp = await ac.get("/api/v1/visitor/stats")
        assert stats_resp.status_code == 200
        stats_data = stats_resp.json()["data"]
        assert stats_data["today_uv"] >= 1
        assert stats_data["total_uv"] >= 1


@pytest.mark.anyio
async def test_returning_visitor_scenario():
    """模拟隔日老友重访场景测试"""
    random_suffix = uuid.uuid4().hex[:6]
    returning_ip = f"203.0.113.{hash(random_suffix) % 250 + 1}"
    yesterday = date.today() - timedelta(days=1)

    # 人工在数据库中注入昨日访问记录（今天尚未来访的老访客）
    async with AsyncSessionLocal() as session:
        hist_v = Visitor(ip=returning_ip, total_visit_count=5)
        hist_dv = DailyVisit(ip=returning_ip, visit_date=yesterday, visit_count_today=5)
        session.add_all([hist_v, hist_dv])
        await session.commit()

    # 该 IP 在今天发起访问
    headers = {"X-Forwarded-For": returning_ip}
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post("/api/v1/visitor/track", headers=headers)
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["visit_type"] == "returning_visit"
        assert "✨ 好久不见老朋友！欢迎再次回来" in data["message"]
        assert data["bubble_tag"] == "老友重访"
