from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class StudentAccessLink(Base):
    __tablename__ = "student_access_links"

    id: Mapped[int] = mapped_column(primary_key=True)

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    access_token_hash: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    channel: Mapped[str] = mapped_column(String(30), nullable=False, default="web")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    student: Mapped["Student"] = relationship()

    def __repr__(self) -> str:
        return f"StudentAccessLink(id={self.id!r}, student_id={self.student_id!r})"
