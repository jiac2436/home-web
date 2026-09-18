"""Tests for resume data persistence and API retrieval."""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db, AsyncSessionLocal
from app.services.resume_service import ResumeService


@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_resume_profile_api():
    """测试获取数据库存储的贾晨真实个人简历数据"""
    await init_db()
    async with AsyncSessionLocal() as session:
        await ResumeService.init_seed(session)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/resume/profile")
        assert response.status_code == 200
        res_json = response.json()
        assert res_json["code"] == 200
        data = res_json["data"]
        assert data["profile_key"] == "default"

        # 校验中文真实资料
        zh_info = data["zh"]["information"]
        assert "贾晨" in zh_info["name"]
        assert "18310761375" in zh_info["phone"]
        assert "jichi0711@163.com" in zh_info["email"]
        assert "全栈" in zh_info["role"]
        assert "AI Agent" in zh_info["role"]

        # 校验经历
        zh_exp = data["zh"]["experience"]
        assert "奇梦岛" in zh_exp["exp1Role"]
        assert "美菜网" in zh_exp["exp3Role"]

        # 校验项目作品
        zh_works = data["zh"]["works"]
        assert "AI AGENT" in zh_works["w1Tag"]
        assert "潮玩电商" in zh_works["w2Title"]

        # 校验英文资料
        en_info = data["en"]["information"]
        assert "Jia Chen" in en_info["name"]
        assert "jichi0711@163.com" in en_info["email"]
