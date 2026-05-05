from datetime import date, datetime, time

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session, selectinload

from app.models.geolocation_check import GeolocationCheck
from app.models.geolocation_log import GeolocationLog


def get_geolocation_log(db: Session, log_id: int) -> GeolocationLog | None:
    stmt = (
        select(GeolocationLog)
        .options(
            selectinload(GeolocationLog.student),
            selectinload(GeolocationLog.assignment),
            selectinload(GeolocationLog.check),
        )
        .where(GeolocationLog.id == log_id)
    )
    return db.scalar(stmt)


def get_geolocation_logs(
    db: Session,
    *,
    skip: int = 0,
    limit: int = 100,
    student_id: int | None = None,
    assignment_id: int | None = None,
    source: str | None = None,
    check_result: str | None = None,
    date_value: date | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> tuple[int, list[GeolocationLog]]:
    stmt = select(GeolocationLog).options(
        selectinload(GeolocationLog.student),
        selectinload(GeolocationLog.assignment),
        selectinload(GeolocationLog.check),
    )

    if student_id is not None:
        stmt = stmt.where(GeolocationLog.student_id == student_id)

    if assignment_id is not None:
        stmt = stmt.where(GeolocationLog.assignment_id == assignment_id)

    if source:
        stmt = stmt.where(GeolocationLog.source == source)

    if check_result:
        stmt = stmt.join(
            GeolocationCheck,
            GeolocationCheck.geolocation_log_id == GeolocationLog.id,
        )
        stmt = stmt.where(GeolocationCheck.check_result == check_result)

    if date_value is not None:
        start_dt = datetime.combine(date_value, time.min)
        end_dt = datetime.combine(date_value, time.max)
        stmt = stmt.where(
            and_(
                GeolocationLog.sent_at >= start_dt,
                GeolocationLog.sent_at <= end_dt,
            )
        )
    else:
        if date_from is not None:
            start_dt = datetime.combine(date_from, time.min)
            stmt = stmt.where(GeolocationLog.sent_at >= start_dt)

        if date_to is not None:
            end_dt = datetime.combine(date_to, time.max)
            stmt = stmt.where(GeolocationLog.sent_at <= end_dt)

    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = db.scalar(count_stmt) or 0

    items = db.scalars(
        stmt.order_by(GeolocationLog.sent_at.desc()).offset(skip).limit(limit)
    ).all()

    return total, list(items)
