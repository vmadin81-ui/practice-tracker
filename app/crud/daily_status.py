from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.student_daily_status import StudentDailyStatus


def get_daily_status(
    db: Session,
    *,
    student_id: int,
    status_date: date,
) -> StudentDailyStatus | None:
    stmt = (
        select(StudentDailyStatus)
        .options(
            selectinload(StudentDailyStatus.student),
            selectinload(StudentDailyStatus.assignment),
        )
        .where(
            StudentDailyStatus.student_id == student_id,
            StudentDailyStatus.status_date == status_date,
        )
    )
    return db.scalar(stmt)


def get_daily_statuses(
    db: Session,
    *,
    status_date: date | None = None,
    group_id: int | None = None,
    enterprise_id: int | None = None,
    status_color: str | None = None,
    skip: int = 0,
    limit: int = 100,
) -> tuple[int, list[StudentDailyStatus]]:
    from app.models.practice_assignment import PracticeAssignment
    from app.models.student import Student

    stmt = (
        select(StudentDailyStatus)
        .join(Student, Student.id == StudentDailyStatus.student_id)
        .outerjoin(PracticeAssignment, PracticeAssignment.id == StudentDailyStatus.assignment_id)
        .options(
            selectinload(StudentDailyStatus.student).selectinload(Student.group),
            selectinload(StudentDailyStatus.assignment),
        )
    )

    if status_date is not None:
        stmt = stmt.where(StudentDailyStatus.status_date == status_date)

    if group_id is not None:
        stmt = stmt.where(Student.group_id == group_id)

    if enterprise_id is not None:
        stmt = stmt.where(PracticeAssignment.enterprise_id == enterprise_id)

    if status_color is not None:
        stmt = stmt.where(StudentDailyStatus.status_color == status_color)

    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = db.scalar(count_stmt) or 0

    items = db.scalars(
        stmt.order_by(StudentDailyStatus.status_date.desc(), StudentDailyStatus.student_id.asc())
        .offset(skip)
        .limit(limit)
    ).all()

    return total, list(items)


def get_daily_status_history(
    db: Session,
    *,
    student_id: int,
    date_from: date | None = None,
    date_to: date | None = None,
    skip: int = 0,
    limit: int = 200,
) -> tuple[int, list[StudentDailyStatus]]:
    stmt = (
        select(StudentDailyStatus)
        .options(
            selectinload(StudentDailyStatus.student),
            selectinload(StudentDailyStatus.assignment),
            selectinload(StudentDailyStatus.last_check),
            selectinload(StudentDailyStatus.last_geolocation_log),
        )
        .where(StudentDailyStatus.student_id == student_id)
    )

    if date_from is not None:
        stmt = stmt.where(StudentDailyStatus.status_date >= date_from)

    if date_to is not None:
        stmt = stmt.where(StudentDailyStatus.status_date <= date_to)

    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = db.scalar(count_stmt) or 0

    items = db.scalars(
        stmt.order_by(StudentDailyStatus.status_date.desc())
        .offset(skip)
        .limit(limit)
    ).all()

    return total, list(items)
