"""Backend test suite."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """测试根路径索引返回"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert data["docs"] == "/docs"


def test_health_check():
    """测试 /api/v1/health 健康探针"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["code"] == 200
    assert res_json["data"]["status"] == "healthy"
    assert "timestamp" in res_json["data"]


def test_get_papers_list():
    """测试 /api/v1/papers 列表接口"""
    response = client.get("/api/v1/papers")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["code"] == 200
    assert isinstance(res_json["data"], list)
    assert len(res_json["data"]) > 0
    paper = res_json["data"][0]
    assert paper["id"] == "information"
    assert "charIndices" in paper
    assert "zh" in paper
    assert "en" in paper


def test_get_paper_by_id():
    """测试 /api/v1/papers/{id} 查询"""
    # 成功查询
    response = client.get("/api/v1/papers/information")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["code"] == 200
    assert res_json["data"]["id"] == "information"

    # 不存在的 ID 测试 404
    err_resp = client.get("/api/v1/papers/non_existent_id")
    assert err_resp.status_code == 404


def test_cors_headers():
    """测试 CORS 允许来自前端 Vite 端口跨域请求"""
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "GET",
    }
    response = client.options("/api/v1/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
