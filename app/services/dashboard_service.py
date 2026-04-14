from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.practice_assignment import PracticeAssignment
from app.models.student import Student
from app.models.student_daily_status import StudentDailyStatus
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    EnterpriseSummaryItem,
    GroupSummaryItem,
    StatusCounters,
)


def _empty_counters() -> dict[str, int]:
    return {
        "total": 0,
        "checked_in": 0,
        "green": 0,
        "yellow": 0,
        "red": 0,
        "gray": 0,
    }


def _increment_total(counters: dict[str, int]) -> None:
    counters["total"] += 1


def _increment_status(counters: dict[str, int], status_color: str, checkins_count: int) -> None:
    if checkins_count > 0:
        counters["checked_in"] += 1

    if status_color in ("green", "yellow", "red", "gray"):
        counters[status_color] += 1


def build_dashboard_summary(
    db: Session,
    *,
    status_date: date,
    group_id: int | None = None,
    enterprise_id: int | None = None,
) -> DashboardSummaryResponse:
    assignment_stmt = (
        select(PracticeAssignment)
        .options(
            selectinload(PracticeAssignment.student).selectinload(Student.group),
            selectinload(PracticeAssignment.enterprise),
        )
        .where(
            PracticeAssignment.is_active.is_(True),
            PracticeAssignment.start_date <= status_date,
            PracticeAssignment.end_date >= status_date,
        )
    )

    assignments = list(db.scalars(assignment_stmt).all())

    if group_id is not None:
        assignments = [
            item
            for item in assignments
            if item.student and item.student.group_id == group_id
        ]

    if enterprise_id is not None:
        assignments = [
            item
            for item in assignments
            if item.enterprise_id == enterprise_id
        ]

    status_stmt = (
        select(StudentDailyStatus)
        .options(
            selectinload(StudentDailyStatus.student).selectinload(Student.group),
            selectinload(StudentDailyStatus.assignment).selectinload(PracticeAssignment.enterprise),
        )
        .where(StudentDailyStatus.status_date == status_date)
    )
    statuses = list(db.scalars(status_stmt).all())

    status_map: dict[tuple[int, int | None], StudentDailyStatus] = {
        (item.student_id, item.assignment_id): item for item in statuses
    }

    total_counters = _empty_counters()
    groups_map: dict[tuple[int | None, str], dict[str, int]] = {}
    enterprises_map: dict[tuple[int | None, str], dict[str, int]] = {}

    for assignment in assignments:
        student = assignment.student
        enterprise = assignment.enterprise

        group_key = (
            student.group.id if student and student.group else None,
            student.group.name if student and student.group else "Без группы",
        )
        enterprise_key = (
            enterprise.id if enterprise else None,
            enterprise.name if enterprise else "Без предприятия",
        )

        if group_key not in groups_map:
            groups_map[group_key] = _empty_counters()
        if enterprise_key not in enterprises_map:
            enterprises_map[enterprise_key] = _empty_counters()

        _increment_total(total_counters)
        _increment_total(groups_map[group_key])
        _increment_total(enterprises_map[enterprise_key])

        status_item = status_map.get((assignment.student_id, assignment.id))
        if status_item:
            _increment_status(
                total_counters,
                status_item.status_color,
                status_item.checkins_count,
            )
            _increment_status(
                groups_map[group_key],
                status_item.status_color,
                status_item.checkins_count,
            )
            _increment_status(
                enterprises_map[enterprise_key],
                status_item.status_color,
                status_item.checkins_count,
            )

    by_groups = [
        GroupSummaryItem(
            group_id=group_id_value,
            group_name=group_name,
            counters=StatusCounters(**counters),
        )
        for (group_id_value, group_name), counters in sorted(
            groups_map.items(),
            key=lambda x: (x[0][1].lower(), x[0][0] is None),
        )
    ]

    by_enterprises = [
        EnterpriseSummaryItem(
            enterprise_id=enterprise_id_value,
            enterprise_name=enterprise_name,
            counters=StatusCounters(**counters),
        )
        for (enterprise_id_value, enterprise_name), counters in sorted(
            enterprises_map.items(),
            key=lambda x: (x[0][1].lower(), x[0][0] is None),
        )
    ]

    return DashboardSummaryResponse(
        date=status_date.isoformat(),
        totals=StatusCounters(**total_counters),
        by_groups=by_groups,
        by_enterprises=by_enterprises,
    )
