from datetime import datetime

from pydantic import Field

from app.schemas.common import ORMBaseSchema
from app.schemas.specialty import SpecialtyRead


class StudyGroupBase(ORMBaseSchema):
    name: str = Field(..., min_length=2, max_length=100)
    course: int | None = Field(default=None, ge=1, le=10)
    specialty_id: int | None = Field(default=None, gt=0)


class StudyGroupCreate(StudyGroupBase):
    pass


class StudyGroupUpdate(ORMBaseSchema):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    course: int | None = Field(default=None, ge=1, le=10)
    specialty_id: int | None = Field(default=None, gt=0)


class StudyGroupRead(StudyGroupBase):
    id: int
    created_at: datetime


class StudyGroupReadDetailed(ORMBaseSchema):
    id: int
    name: str
    course: int | None
    specialty_id: int | None
    created_at: datetime
    specialty: SpecialtyRead | None = None


class StudyGroupShort(ORMBaseSchema):
    id: int
    name: str
