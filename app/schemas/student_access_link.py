from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.student import StudentReadDetailed
from app.schemas.user import UserShort


class StudentAccessLinkCreate(BaseModel):
    student_id: int = Field(..., gt=0)
    label: str | None = Field(default=None, max_length=255)
    expires_at: datetime | None = None
    channel: str = Field(default="web", max_length=30)


class StudentAccessLinkRead(BaseModel):
    id: int
    student_id: int
    channel: str
    label: str | None
    issued_by_user_id: int | None
    is_active: bool
    expires_at: datetime | None
    last_used_at: datetime | None
    revoked_at: datetime | None
    usage_count: int
    last_device_id: str | None
    last_device_label: str | None
    created_at: datetime
    student: StudentReadDetailed | None = None
    issued_by_user: UserShort | None = None

    class Config:
        from_attributes = True


class StudentAccessLinkCreateResponse(BaseModel):
    item: StudentAccessLinkRead
    raw_access_token: str
