from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class StudentDataConsent(Base):
    __tablename__ = "student_data_consents"

    id: Mapped[int] = mapped_column(primary_key=True)

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    consent_type: Mapped[str] = mapped_column(String(100), nullable=False, default="geolocation")
    consent_text_version: Mapped[str] = mapped_column(String(50), nullable=False, default="v1")
    is_accepted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    device_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    device_label: Mapped[str | None] = mapped_column(String(255), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    accepted_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    student: Mapped["Student"] = relationship()
