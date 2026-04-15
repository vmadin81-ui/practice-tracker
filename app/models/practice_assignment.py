from datetime import date, datetime, time

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, JSON, String, Time, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class PracticeAssignment(Base):
    __tablename__ = "practice_assignments"

    id: Mapped[int] = mapped_column(primary_key=True)

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    enterprise_id: Mapped[int] = mapped_column(
        ForeignKey("enterprises.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    supervisor_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)

    supervisor_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    supervisor_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)

    schedule_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    monitoring_mode: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="daily_once",
    )
    required_checkins_per_day: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    allowed_start_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    allowed_end_time: Mapped[time | None] = mapped_column(Time, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    student: Mapped["Student"] = relationship(back_populates="practice_assignments")
    enterprise: Mapped["Enterprise"] = relationship(back_populates="practice_assignments")
    supervisor_user: Mapped["User | None"] = relationship()
