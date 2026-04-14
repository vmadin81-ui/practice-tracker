from datetime import date, datetime, time

from pydantic import Field, model_validator

from app.schemas.common import ORMBaseSchema
from app.schemas.enterprise import EnterpriseRead
from app.schemas.student import StudentRead


class PracticeAssignmentBase(ORMBaseSchema):
    student_id: int = Field(..., gt=0)
    enterprise_id: int = Field(..., gt=0)

    start_date: date
    end_date: date

    supervisor_name: str | None = Field(default=None, max_length=255)
    supervisor_phone: str | None = Field(default=None, max_length=50)

    schedule_json: dict | None = None

    monitoring_mode: str = Field(default="daily_once", max_length=50)
    required_checkins_per_day: int = Field(default=1, ge=1, le=10)

    allowed_start_time: time | None = None
    allowed_end_time: time | None = None

    is_active: bool = True

    @model_validator(mode="before")
    @classmethod
    def normalize_strings(cls, data):
        if not isinstance(data, dict):
            return data

        for key in ("supervisor_name", "supervisor_phone", "monitoring_mode"):
            value = data.get(key)
            if isinstance(value, str):
                value = value.strip()
                data[key] = value or None

        return data

    @model_validator(mode="after")
    def validate_dates_and_time(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date cannot be earlier than start_date")

        if self.allowed_start_time and self.allowed_end_time:
            if self.allowed_end_time <= self.allowed_start_time:
                raise ValueError("allowed_end_time must be later than allowed_start_time")

        return self


class PracticeAssignmentCreate(PracticeAssignmentBase):
    pass


class PracticeAssignmentUpdate(ORMBaseSchema):
    student_id: int | None = Field(default=None, gt=0)
    enterprise_id: int | None = Field(default=None, gt=0)

    start_date: date | None = None
    end_date: date | None = None

    supervisor_name: str | None = Field(default=None, max_length=255)
    supervisor_phone: str | None = Field(default=None, max_length=50)

    schedule_json: dict | None = None

    monitoring_mode: str | None = Field(default=None, max_length=50)
    required_checkins_per_day: int | None = Field(default=None, ge=1, le=10)

    allowed_start_time: time | None = None
    allowed_end_time: time | None = None

    is_active: bool | None = None

    @model_validator(mode="before")
    @classmethod
    def normalize_strings(cls, data):
        if not isinstance(data, dict):
            return data

        for key in ("supervisor_name", "supervisor_phone", "monitoring_mode"):
            value = data.get(key)
            if isinstance(value, str):
                value = value.strip()
                data[key] = value or None

        return data


class PracticeAssignmentRead(PracticeAssignmentBase):
    id: int
    created_at: datetime
    updated_at: datetime


class PracticeAssignmentReadDetailed(ORMBaseSchema):
    id: int
    student_id: int
    enterprise_id: int
    start_date: date
    end_date: date
    supervisor_name: str | None
    supervisor_phone: str | None
    schedule_json: dict | None
    monitoring_mode: str
    required_checkins_per_day: int
    allowed_start_time: time | None
    allowed_end_time: time | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    student: StudentRead | None = None
    enterprise: EnterpriseRead | None = None
