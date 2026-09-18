from sqlalchemy import BigInteger, Column, DateTime, String, func
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base


class ResumeProfile(Base):
    """个人简历与档案结构化数据表"""
    __tablename__ = "resume_profiles"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    profile_key = Column(String(50), unique=True, nullable=False, default="default", comment="简历配置主键标识")
    data = Column(JSONB, nullable=False, comment="结构化简历数据(包含个人资料、经历、作品、联络及多语言)")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
