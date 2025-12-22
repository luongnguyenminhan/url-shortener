from datetime import datetime
from typing import Optional

from sqlalchemy import String, TIMESTAMP, func, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Url(Base):
    __tablename__ = "urls"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    short_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    destination_url: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default="active")  # active, expired, deleted, disabled
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="urls")
    metadata: Mapped[Optional["UrlMetadata"]] = relationship("UrlMetadata", back_populates="url", uselist=False)
    click_events: Mapped[list["ClickEvent"]] = relationship("ClickEvent", back_populates="url")
    daily_stats: Mapped[list["DailyUrlStats"]] = relationship("DailyUrlStats", back_populates="url")
    flagged_urls: Mapped[list["FlaggedUrl"]] = relationship("FlaggedUrl", back_populates="url")