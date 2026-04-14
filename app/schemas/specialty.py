from datetime import datetime

from pydantic import Field

from app.schemas.common import ORMBaseSchema


class SpecialtyBase(ORMBaseSchema):
    code: str | None = Field(default=None, max_length=50)
    name: str = Field(..., min_length=2, max_length=255)


class SpecialtyCreate(SpecialtyBase):
    pass


class SpecialtyUpdate(ORMBaseSchema):
    code: str | None = Field(default=None, max_length=50)
    name: str | None = Field(default=None, min_length=2, max_length=255)


class SpecialtyRead(SpecialtyBase):
    id: int
    created_at: datetime
