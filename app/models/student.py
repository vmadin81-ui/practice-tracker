from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(primary_key=True)

    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    middle_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)

    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    telegram_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    group_id: Mapped[int | None] = mapped_column(
        ForeignKey("study_groups.id", ondelete="SET NULL"),
        nullable=True,
    )
    specialty_id: Mapped[int | None] = mapped_column(
        ForeignKey("specialties.id", ondelete="SET NULL"),
        nullable=True,
    )

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

    group: Mapped["StudyGroup | None"] = relationship(back_populates="students")
    specialty: Mapped["Specialty | None"] = relationship(back_populates="students")
    practice_assignments: Mapped[list["PracticeAssignment"]] = relationship(
        back_populates="student",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"Student(id={self.id!r}, full_name={self.full_name!r})"
