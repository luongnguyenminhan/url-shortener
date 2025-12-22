from datetime import datetime
from typing import Optional

from sqlalchemy import String, TIMESTAMP, func, ForeignKey, Integer, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class UrlMetadata(Base):
    __tablename__ = "url_metadata"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    url_id: Mapped[int] = mapped_column(Integer, ForeignKey("urls.id"), unique=True, index=True)
    title: Mapped[Optional[str]] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text)
    tags: Mapped[Optional[dict]] = mapped_column(JSON)
    utm_params: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationship
    url: Mapped["Url"] = relationship("Url", back_populates="metadata") # type: ignore  # noqa: F821
