from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class BasicInfo(BaseModel):
    name: str = Field(..., description="姓名")
    role: str = Field(..., description="求职岗位/定位")
    location: str = Field(..., description="坐标/期望城市")
    phone: str = Field(..., description="联系电话")
    email: str = Field(..., description="联系邮箱")
    education: str = Field(..., description="教育背景")
    point1Title: str = Field(..., description="优势要点1标题")
    point1Desc: str = Field(..., description="优势要点1描述")
    point2Title: str = Field(..., description="优势要点2标题")
    point2Desc: str = Field(..., description="优势要点2描述")
    point3Title: str = Field(..., description="优势要点3标题")
    point3Desc: str = Field(..., description="优势要点3描述")


class ExperienceItem(BaseModel):
    company: str = Field(..., description="公司名称")
    role: str = Field(..., description="职位角色")
    timeRange: str = Field(..., description="在职起止时间")
    description: str = Field(..., description="核心业绩职责摘要")
    highlights: List[str] = Field(default_factory=list, description="详细量化亮点列表")


class WorkProjectItem(BaseModel):
    tag: str = Field(..., description="项目标签编号")
    title: str = Field(..., description="项目名称")
    role: str = Field(..., description="项目角色")
    timeRange: str = Field(..., description="项目周期")
    desc: str = Field(..., description="项目简述")
    techStack: List[str] = Field(default_factory=list, description="技术栈列表")
    metrics: List[str] = Field(default_factory=list, description="核心量化成果")


class ContactInfo(BaseModel):
    title: str
    subtitle: str
    channel: str
    email: str
    phone: str
    desc: str


class ResumeLocaleData(BaseModel):
    information: BasicInfo
    experience: Dict[str, Any]
    works: Dict[str, Any]
    contact: ContactInfo


class ResumeProfileResponse(BaseModel):
    profile_key: str = Field(default="default")
    zh: ResumeLocaleData
    en: ResumeLocaleData
