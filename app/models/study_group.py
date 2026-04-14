from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class StudyGroup(Base):
    __tablename__ = "study_groups"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    course: Mapped[int | None] = mapped_column(Integer, nullable=True)

    specialty_id: Mapped[int | None] = mapped_column(
        ForeignKey("specialties.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    specialty: Mapped["Specialty | None"] = relationship(back_populates="groups")
    students: Mapped[list["Student"]] = relationship(
        back_populates="group",
        cascade="save-update, merge",
    )

    def __repr__(self) -> str:
        return f"StudyGroup(id={self.id!r}, name={self.name!r})"
