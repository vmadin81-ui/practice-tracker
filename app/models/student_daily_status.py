from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class StudentDailyStatus(Base):
    __tablename__ = "student_daily_statuses"
    __table_args__ = (
        UniqueConstraint("student_id", "status_date", name="uq_student_daily_status_student_date"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    assignment_id: Mapped[int | None] = mapped_column(
        ForeignKey("practice_assignments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    status_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    status_color: Mapped[str] = mapped_column(String(20), nullable=False, index=True)

    last_geolocation_log_id: Mapped[int | None] = mapped_column(
        ForeignKey("geolocation_logs.id", ondelete="SET NULL"),
        nullable=True,
    )
    last_check_id: Mapped[int | None] = mapped_column(
        ForeignKey("geolocation_checks.id", ondelete="SET NULL"),
        nullable=True,
    )

    checkins_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    required_checkins_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    is_on_place: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    student: Mapped["Student"] = relationship()
    assignment: Mapped["PracticeAssignment | None"] = relationship()
    last_geolocation_log: Mapped["GeolocationLog | None"] = relationship(
        foreign_keys=[last_geolocation_log_id]
    )
    last_check: Mapped["GeolocationCheck | None"] = relationship(
        foreign_keys=[last_check_id]
    )

    def __repr__(self) -> str:
        return f"StudentDailyStatus(id={self.id!r}, student_id={self.student_id!r}, date={self.status_date!r})"
