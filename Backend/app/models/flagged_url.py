from datetime import datetime
from typing import Optional

from sqlalchemy import String, TIMESTAMP, func, ForeignKey, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class FlaggedUrl(Base):
    __tablename__ = "flagged_urls"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    url_id: Mapped[int] = mapped_column(Integer, ForeignKey("urls.id"), index=True)
    reason: Mapped[str] = mapped_column(String(255))
    flag_type: Mapped[str] = mapped_column(String(50))  # spam, abuse, traffic_anomaly
    is_auto_flagged: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())

    # Relationship
    url: Mapped["Url"] = relationship("Url", back_populates="flagged_urls")