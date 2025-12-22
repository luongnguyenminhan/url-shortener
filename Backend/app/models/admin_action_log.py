from datetime import datetime
from typing import Optional

from sqlalchemy import String, TIMESTAMP, func, ForeignKey, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class AdminActionLog(Base):
    __tablename__ = "admin_action_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    admin_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    action: Mapped[str] = mapped_column(String(255))
    target_type: Mapped[str] = mapped_column(String(50))  # user, url, subscription
    target_id: Mapped[int] = mapped_column(Integer)
    metadata: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())

    # Relationship
    admin: Mapped["User"] = relationship("User", back_populates="admin_action_logs")  # type: ignore # noqa: F821
