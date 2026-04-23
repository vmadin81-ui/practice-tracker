from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class StudentCheckinSessionStartRequest(BaseModel):
    access_token: str = Field(..., min_length=16)
    device_id: str | None = Field(default=None, max_length=255)
    device_label: str | None = Field(default=None, max_length=255)
    user_agent: str | None = Field(default=None, max_length=1000)


class StudentCheckinSessionStartResponse(BaseModel):
    session_token: str
    expires_at: datetime


class StudentCheckinMeResponse(BaseModel):
    student_id: int
    full_name: str
    group_name: str | None
    specialty_name: str | None
    assignment_id: int | None
    enterprise_name: str | None
    enterprise_address: str | None
    start_date: str | None
    end_date: str | None
    today_checkins_count: int
    required_checkins_per_day: int | None
    status_message: str


class StudentCheckinSubmitRequest(BaseModel):
    latitude: Decimal = Field(..., ge=-90, le=90)
    longitude: Decimal = Field(..., ge=-180, le=180)
    accuracy_m: Decimal | None = Field(default=None, ge=0, le=10000)
    device_time: datetime | None = None
    device_id: str | None = Field(default=None, max_length=255)
    device_label: str | None = Field(default=None, max_length=255)
    user_agent: str | None = Field(default=None, max_length=1000)


class StudentCheckinSubmitResponse(BaseModel):
    geolocation_log_id: int
    status_color: str
    distance_m: Decimal | None
    comment: str | None


class StudentCheckinHistoryItem(BaseModel):
    geolocation_log_id: int
    sent_at: datetime
    latitude: Decimal
    longitude: Decimal
    accuracy_m: Decimal | None
    status_color: str | None
    distance_m: Decimal | None
    comment: str | None


class StudentCheckinHistoryResponse(BaseModel):
    total: int
    items: list[StudentCheckinHistoryItem]
