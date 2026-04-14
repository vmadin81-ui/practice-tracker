from datetime import datetime
from decimal import Decimal

from app.schemas.common import ORMBaseSchema


class MapStudentPoint(ORMBaseSchema):
    student_id: int
    full_name: str
    group_name: str | None
    enterprise_name: str | None
    status_color: str
    last_sent_at: datetime | None
    latitude: Decimal | None
    longitude: Decimal | None
    distance_m: float | None
    comment: str | None


class MapEnterprisePoint(ORMBaseSchema):
    enterprise_id: int
    name: str
    latitude: Decimal
    longitude: Decimal
    allowed_radius_m: int


class DashboardMapResponse(ORMBaseSchema):
    date: str
    students: list[MapStudentPoint]
    enterprises: list[MapEnterprisePoint]


class StatusCounters(ORMBaseSchema):
    total: int
    checked_in: int
    green: int
    yellow: int
    red: int
    gray: int


class GroupSummaryItem(ORMBaseSchema):
    group_id: int | None
    group_name: str
    counters: StatusCounters


class EnterpriseSummaryItem(ORMBaseSchema):
    enterprise_id: int | None
    enterprise_name: str
    counters: StatusCounters


class DashboardSummaryResponse(ORMBaseSchema):
    date: str
    totals: StatusCounters
    by_groups: list[GroupSummaryItem]
    by_enterprises: list[EnterpriseSummaryItem]
