from datetime import datetime
from typing import Optional

from sqlalchemy import String, TIMESTAMP, func, ForeignKey, Integer, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class ClickEvent(Base):
    __tablename__ = "click_events"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    url_id: Mapped[int] = mapped_column(Integer, ForeignKey("urls.id"), index=True)
    clicked_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now(), index=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(64))
    user_agent: Mapped[Optional[str]] = mapped_column(Text)
    referrer: Mapped[Optional[str]] = mapped_column(Text)
    country_code: Mapped[Optional[str]] = mapped_column(String(2))
    device_type: Mapped[Optional[str]] = mapped_column(String(64))
    os: Mapped[Optional[str]] = mapped_column(String(64))
    browser: Mapped[Optional[str]] = mapped_column(String(64))
    is_bot: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationship
    url: Mapped["Url"] = relationship("Url", back_populates="click_events")