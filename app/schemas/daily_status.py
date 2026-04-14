from datetime import date, datetime

from pydantic import Field

from app.schemas.common import ORMBaseSchema
from app.schemas.enterprise import EnterpriseRead
from app.schemas.group import StudyGroupRead
from app.schemas.practice_assignment import PracticeAssignmentRead
from app.schemas.student import StudentRead


class DailyStatusRead(ORMBaseSchema):
    id: int
    student_id: int
    assignment_id: int | None
    status_date: date
    status_color: str
    last_geolocation_log_id: int | None
    last_check_id: int | None
    checkins_count: int
    required_checkins_count: int
    is_on_place: bool | None
    comment: str | None
    updated_at: datetime


class DailyStatusReadDetailed(ORMBaseSchema):
    id: int
    student_id: int
    assignment_id: int | None
    status_date: date
    status_color: str
    last_geolocation_log_id: int | None
    last_check_id: int | None
    checkins_count: int
    required_checkins_count: int
    is_on_place: bool | None
    comment: str | None
    updated_at: datetime

    student: StudentRead | None = None
    assignment: PracticeAssignmentRead | None = None


class DailyStatusSummaryItem(ORMBaseSchema):
    student_id: int
    full_name: str
    group: StudyGroupRead | None = None
    assignment: PracticeAssignmentRead | None = None
    enterprise: EnterpriseRead | None = None
    status_date: date
    status_color: str
    checkins_count: int
    required_checkins_count: int
    is_on_place: bool | None
    comment: str | None
    last_geolocation_log_id: int | None
    last_check_id: int | None
    last_sent_at: datetime | None = None
    distance_m: float | None = None
