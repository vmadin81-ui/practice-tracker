from datetime import datetime

from pydantic import Field, model_validator

from app.schemas.common import ORMBaseSchema
from app.schemas.group import StudyGroupRead
from app.schemas.specialty import SpecialtyRead


class StudentBase(ORMBaseSchema):
    last_name: str = Field(..., min_length=2, max_length=100)
    first_name: str = Field(..., min_length=2, max_length=100)
    middle_name: str | None = Field(default=None, max_length=100)
    full_name: str | None = Field(default=None, max_length=255)

    phone: str | None = Field(default=None, max_length=30)
    telegram_id: str | None = Field(default=None, max_length=100)

    group_id: int | None = Field(default=None, gt=0)
    specialty_id: int | None = Field(default=None, gt=0)
    is_active: bool = True

    @model_validator(mode="before")
    @classmethod
    def build_full_name(cls, data):
        if not isinstance(data, dict):
            return data

        for key in ("last_name", "first_name", "middle_name", "full_name", "phone", "telegram_id"):
            value = data.get(key)
            if isinstance(value, str):
                value = value.strip()
                data[key] = value or None

        if not data.get("full_name"):
            parts = [
                data.get("last_name"),
                data.get("first_name"),
                data.get("middle_name"),
            ]
            data["full_name"] = " ".join(part for part in parts if part)

        return data


class StudentCreate(StudentBase):
    pass


class StudentUpdate(ORMBaseSchema):
    last_name: str | None = Field(default=None, min_length=2, max_length=100)
    first_name: str | None = Field(default=None, min_length=2, max_length=100)
    middle_name: str | None = Field(default=None, max_length=100)
    full_name: str | None = Field(default=None, max_length=255)

    phone: str | None = Field(default=None, max_length=30)
    telegram_id: str | None = Field(default=None, max_length=100)

    group_id: int | None = Field(default=None, gt=0)
    specialty_id: int | None = Field(default=None, gt=0)
    is_active: bool | None = None

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, data):
        if not isinstance(data, dict):
            return data

        for key in ("last_name", "first_name", "middle_name", "full_name", "phone", "telegram_id"):
            value = data.get(key)
            if isinstance(value, str):
                value = value.strip()
                data[key] = value or None

        return data


class StudentRead(StudentBase):
    id: int
    full_name: str
    created_at: datetime
    updated_at: datetime


class StudentReadDetailed(ORMBaseSchema):
    id: int
    last_name: str
    first_name: str
    middle_name: str | None
    full_name: str
    phone: str | None
    telegram_id: str | None
    group_id: int | None
    specialty_id: int | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    group: StudyGroupRead | None = None
    specialty: SpecialtyRead | None = None
