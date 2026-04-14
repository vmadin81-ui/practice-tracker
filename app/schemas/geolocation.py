from datetime import date as dt_date, datetime
from decimal import Decimal

from pydantic import Field, model_validator

from app.schemas.common import ORMBaseSchema
from app.schemas.practice_assignment import PracticeAssignmentRead
from app.schemas.student import StudentRead


class GeolocationCheckInRequest(ORMBaseSchema):
    student_id: int | None = Field(default=None, gt=0)
    latitude: Decimal = Field(..., ge=-90, le=90)
    longitude: Decimal = Field(..., ge=-180, le=180)
    accuracy_m: Decimal | None = Field(default=None, ge=0, le=10000)
    sent_at: datetime
    source: str = Field(default="web", min_length=2, max_length=50)

    @model_validator(mode="before")
    @classmethod
    def normalize_source(cls, data):
        if not isinstance(data, dict):
            return data
        source = data.get("source")
        if isinstance(source, str):
            data["source"] = source.strip().lower() or "web"
        return data


class GeolocationCheckResult(ORMBaseSchema):
    id: int
    geolocation_log_id: int
    assignment_id: int | None
    enterprise_id: int | None
    distance_m: Decimal | None
    within_radius: bool | None
    accuracy_ok: bool | None
    time_window_ok: bool | None
    check_result: str
    comment: str | None
    checked_at: datetime


class GeolocationCheckInResponse(ORMBaseSchema):
    geolocation_log_id: int
    student_id: int
    assignment_id: int | None
    enterprise_id: int | None
    distance_m: Decimal | None
    within_radius: bool | None
    accuracy_ok: bool | None
    time_window_ok: bool | None
    status_color: str
    comment: str | None


class GeolocationLogRead(ORMBaseSchema):
    id: int
    student_id: int
    assignment_id: int | None
    source: str
    latitude: Decimal
    longitude: Decimal
    accuracy_m: Decimal | None
    sent_at: datetime
    received_at: datetime
    processing_status: str
    created_at: datetime


class GeolocationLogReadDetailed(ORMBaseSchema):
    id: int
    student_id: int
    assignment_id: int | None
    source: str
    latitude: Decimal
    longitude: Decimal
    accuracy_m: Decimal | None
    sent_at: datetime
    received_at: datetime
    processing_status: str
    created_at: datetime

    student: StudentRead | None = None
    assignment: PracticeAssignmentRead | None = None
    check: GeolocationCheckResult | None = None


class GeolocationLogFilter(ORMBaseSchema):
    date: dt_date | None = None
    date_from: dt_date | None = None
    date_to: dt_date | None = None
