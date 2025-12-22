from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, TIMESTAMP, func, ForeignKey, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class DailyUrlStats(Base):
    __tablename__ = "daily_url_stats"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    url_id: Mapped[int] = mapped_column(Integer, ForeignKey("urls.id"), index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    total_clicks: Mapped[int] = mapped_column(Integer, default=0)
    bot_clicks: Mapped[int] = mapped_column(Integer, default=0)
    country_breakdown: Mapped[Optional[dict]] = mapped_column(JSON)
    device_breakdown: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())

    # Relationship
    url: Mapped["Url"] = relationship("Url", back_populates="daily_stats")