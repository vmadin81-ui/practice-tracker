from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Specialty(Base):
    __tablename__ = "specialties"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    groups: Mapped[list["StudyGroup"]] = relationship(
        back_populates="specialty",
        cascade="save-update, merge",
    )
    students: Mapped[list["Student"]] = relationship(
        back_populates="specialty",
        cascade="save-update, merge",
    )

    def __repr__(self) -> str:
        return f"Specialty(id={self.id!r}, name={self.name!r})"
