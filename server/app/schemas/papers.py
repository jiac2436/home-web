from typing import List, Optional
from pydantic import BaseModel, Field


class PaperLocaleData(BaseModel):
    targetWord: str = Field(..., description="目标字符/大词")
    capsule: str = Field(..., description="胶囊副标")
    subtitle: str = Field(..., description="副标题")
    author: str = Field(..., description="学者/作者")
    year: str = Field(..., description="发表年份")
    paperTitle: str = Field(..., description="论文或经典著作标题")
    citation: str = Field(..., description="引用出处")
    text: str = Field(..., description="引用段落原文")
    charIndices: List[int] = Field(default_factory=list, description="字母抽取对应字符下标")


class PaperModuleItem(BaseModel):
    id: str = Field(..., description="模块唯一标识符")
    targetWord: str = Field(..., description="默认目标词")
    chineseTitle: str = Field(..., description="中文主标题")
    subtitle: str = Field(..., description="默认副标题")
    author: str = Field(..., description="默认作者")
    year: str = Field(..., description="默认年份")
    paperTitle: str = Field(..., description="默认论文标题")
    citation: str = Field(..., description="默认引用信息")
    text: str = Field(..., description="默认正文")
    charIndices: List[int] = Field(default_factory=list, description="字符索引序列")
    zh: Optional[PaperLocaleData] = Field(default=None, description="中文区域数据")
    en: Optional[PaperLocaleData] = Field(default=None, description="英文区域数据")
