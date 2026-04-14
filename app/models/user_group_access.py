from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class UserGroupAccess(Base):
    __tablename__ = "user_group_access"
    __table_args__ = (
        UniqueConstraint("user_id", "group_id", name="uq_user_group_access_user_group"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    group_id: Mapped[int] = mapped_column(
        ForeignKey("study_groups.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(back_populates="group_accesses")
    group: Mapped["StudyGroup"] = relationship()

    def __repr__(self) -> str:
        return f"UserGroupAccess(user_id={self.user_id!r}, group_id={self.group_id!r})"
