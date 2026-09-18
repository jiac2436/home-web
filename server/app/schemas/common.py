from typing import Generic, Optional, TypeVar
from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


class ApiResponse(BaseModel, Generic[DataT]):
    """统一 API 响应格式包装类"""
    code: int = Field(default=200, description="业务状态码，200 为成功")
    message: str = Field(default="success", description="提示信息")
    data: Optional[DataT] = Field(default=None, description="业务数据载荷")

    @classmethod
    def success(cls, data: Optional[DataT] = None, message: str = "success") -> "ApiResponse[DataT]":
        return cls(code=200, message=message, data=data)

    @classmethod
    def fail(cls, code: int = 500, message: str = "error") -> "ApiResponse[None]":
        return cls(code=code, message=message, data=None)
