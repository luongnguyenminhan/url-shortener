from datetime import datetime
from typing import Optional

from sqlalchemy import String, Boolean, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    firebase_uid: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default="user")  # user, admin
    account_status: Mapped[str] = mapped_column(String(50), default="active")  # active, disabled
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    subscriptions: Mapped[list["Subscription"]] = relationship("Subscription", back_populates="user")
    urls: Mapped[list["Url"]] = relationship("Url", back_populates="user")
    admin_action_logs: Mapped[list["AdminActionLog"]] = relationship("AdminActionLog", back_populates="admin")
    user_action_logs: Mapped[list["UserActionLog"]] = relationship("UserActionLog", back_populates="user")