from datetime import datetime, date
from sqlalchemy import (
    BigInteger,
    Column,
    Date,
    DateTime,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from app.core.database import Base


class Visitor(Base):
    """全局独立访客档案表"""
    __tablename__ = "visitors"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    ip = Column(String(45), unique=True, nullable=False, index=True, comment="客户端IP地址(IPv4/IPv6)")
    first_visited_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="首次访问时间",
    )
    last_visited_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="最后活跃时间",
    )
    total_visit_count = Column(Integer, default=1, nullable=False, comment="历史累计总访问点击次数")
    user_agent = Column(Text, nullable=True, comment="首次访问的 User-Agent")


class DailyVisit(Base):
    """每日独立访客打卡表 (按天去重)"""
    __tablename__ = "daily_visits"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    ip = Column(String(45), nullable=False, index=True, comment="客户端IP地址")
    visit_date = Column(Date, nullable=False, index=True, comment="打卡日期(YYYY-MM-DD)")
    visit_count_today = Column(Integer, default=1, nullable=False, comment="当日累计点击次数")
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="当日首次打卡时间",
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="当日最后活跃时间",
    )

    __table_args__ = (
        UniqueConstraint("ip", "visit_date", name="uq_ip_visit_date"),
    )
