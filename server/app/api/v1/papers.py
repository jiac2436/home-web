from typing import List, Optional
from fastapi import APIRouter, HTTPException
from app.schemas.common import ApiResponse
from app.schemas.papers import PaperModuleItem

router = APIRouter()

# 示例数据（对齐前端前端展示的经典论文与板块）
INITIAL_PAPERS: List[dict] = [
    {
        "id": "information",
        "targetWord": "Information",
        "chineseTitle": "个人信息 · 关于晨",
        "subtitle": "全栈架构师 · 创意工程探索者",
        "author": "Claude E. Shannon",
        "year": "1948",
        "paperTitle": "A Mathematical Theory of Communication",
        "citation": "Bell System Technical Journal, 27(3), 379–423.",
        "text": "In mathematical communication theory, information can be reproduced across distance. Finite messages transfer structure and meaning through physical signals, enabling computational architecture to process high entropy input with precision.",
        "charIndices": [0, 21, 40, 61, 70, 92, 103, 111, 128, 135, 152],
        "en": {
            "targetWord": "Information",
            "capsule": "Personal Profile · About Chen",
            "subtitle": "Full-Stack Architect & Creative Computing Specialist",
            "author": "Claude E. Shannon",
            "year": "1948",
            "paperTitle": "A Mathematical Theory of Communication",
            "citation": "Bell System Technical Journal, 27(3), 379–423.",
            "text": "In mathematical communication theory, information can be reproduced across distance. Finite messages transfer structure and meaning through physical signals, enabling computational architecture to process high entropy input with precision.",
            "charIndices": [0, 21, 40, 61, 70, 92, 103, 111, 128, 135, 152],
        },
        "zh": {
            "targetWord": "个人信息",
            "capsule": "关于晨 · 全栈架构师",
            "subtitle": "系统工程底座 · 创意工程探索者",
            "author": "钱学森",
            "year": "1954",
            "paperTitle": "《工程控制论》（Engineering Cybernetics）",
            "citation": "麦格劳-希尔出版社 / 科学出版社系统工程经典",
            "text": "每一位工程师在技术体系中，个人通过系统架构传递信息。深邃的科学思考跨越时空，将信息转化为高可靠性的工程基石。",
            "charIndices": [0, 7, 24, 30],
        },
    }
]


@router.get("/papers", response_model=ApiResponse[List[PaperModuleItem]], summary="获取论文展示模块列表")
async def get_papers():
    """获取所有论文展示与字母拼词模块数据"""
    return ApiResponse.success(data=INITIAL_PAPERS)


@router.get("/papers/{paper_id}", response_model=ApiResponse[PaperModuleItem], summary="根据 ID 获取论文展示模块")
async def get_paper_by_id(paper_id: str):
    """根据 paper_id 获取指定论文展示模块数据"""
    for item in INITIAL_PAPERS:
        if item["id"] == paper_id:
            return ApiResponse.success(data=item)
    raise HTTPException(status_code=404, detail=f"Paper module with id '{paper_id}' not found")
