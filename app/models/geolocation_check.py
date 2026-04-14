from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class GeolocationCheck(Base):
    __tablename__ = "geolocation_checks"

    id: Mapped[int] = mapped_column(primary_key=True)

    geolocation_log_id: Mapped[int] = mapped_column(
        ForeignKey("geolocation_logs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    assignment_id: Mapped[int | None] = mapped_column(
        ForeignKey("practice_assignments.id", ondelete="SET NULL"),
        nullable=True,
    )
    enterprise_id: Mapped[int | None] = mapped_column(
        ForeignKey("enterprises.id", ondelete="SET NULL"),
        nullable=True,
    )

    distance_m: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    within_radius: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    accuracy_ok: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    time_window_ok: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    check_result: Mapped[str] = mapped_column(String(20), nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    checked_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    geolocation_log: Mapped["GeolocationLog"] = relationship(back_populates="check")
    assignment: Mapped["PracticeAssignment | None"] = relationship()
    enterprise: Mapped["Enterprise | None"] = relationship()

    def __repr__(self) -> str:
        return f"GeolocationCheck(id={self.id!r}, result={self.check_result!r})"
