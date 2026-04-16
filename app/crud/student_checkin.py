from datetime import date, datetime, time

from sqlalchemy import and_, select
from sqlalchemy.orm import Session, selectinload

from app.models.geolocation_log import GeolocationLog
from app.models.practice_assignment import PracticeAssignment
from app.models.student import Student
from app.models.student_access_link import StudentAccessLink
from app.models.student_checkin_session import StudentCheckinSession


def get_active_student_access_link_by_hash(
    db: Session,
    token_hash: str,
) -> StudentAccessLink | None:
    stmt = (
        select(StudentAccessLink)
        .options(selectinload(StudentAccessLink.student).selectinload(Student.group))
        .where(
            StudentAccessLink.access_token_hash == token_hash,
            StudentAccessLink.is_active.is_(True),
        )
    )
    return db.scalar(stmt)


def get_student_checkin_session_by_hash(
    db: Session,
    token_hash: str,
) -> StudentCheckinSession | None:
    stmt = (
        select(StudentCheckinSession)
        .options(selectinload(StudentCheckinSession.student).selectinload(Student.group))
        .where(StudentCheckinSession.session_token_hash == token_hash)
    )
    return db.scalar(stmt)


def create_student_checkin_session(
    db: Session,
    *,
    student_id: int,
    session_token_hash: str,
    expires_at: datetime,
    device_label: str | None = None,
) -> StudentCheckinSession:
    obj = StudentCheckinSession(
        student_id=student_id,
        session_token_hash=session_token_hash,
        expires_at=expires_at,
        device_label=device_label,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_active_assignment_for_student_on_date(
    db: Session,
    *,
    student_id: int,
    target_date: date,
) -> PracticeAssignment | None:
    stmt = (
        select(PracticeAssignment)
        .options(
            selectinload(PracticeAssignment.enterprise),
            selectinload(PracticeAssignment.supervisor_user),
        )
        .where(
            PracticeAssignment.student_id == student_id,
            PracticeAssignment.is_active.is_(True),
            PracticeAssignment.start_date <= target_date,
            PracticeAssignment.end_date >= target_date,
        )
        .order_by(PracticeAssignment.id.desc())
    )
    return db.scalar(stmt)


def count_student_logs_for_date(
    db: Session,
    *,
    student_id: int,
    target_date: date,
) -> int:
    start_dt = datetime.combine(target_date, time.min)
    end_dt = datetime.combine(target_date, time.max)

    stmt = select(GeolocationLog).where(
        GeolocationLog.student_id == student_id,
        and_(
            GeolocationLog.sent_at >= start_dt,
            GeolocationLog.sent_at <= end_dt,
        ),
    )
    return len(list(db.scalars(stmt).all()))


def get_student_geolocation_history(
    db: Session,
    *,
    student_id: int,
    skip: int = 0,
    limit: int = 50,
) -> tuple[int, list[GeolocationLog]]:
    stmt = (
        select(GeolocationLog)
        .options(selectinload(GeolocationLog.check))
        .where(GeolocationLog.student_id == student_id)
        .order_by(GeolocationLog.sent_at.desc())
    )
    items = list(db.scalars(stmt.offset(skip).limit(limit)).all())
    total = len(list(db.scalars(select(GeolocationLog).where(GeolocationLog.student_id == student_id)).all()))
    return total, items
