from datetime import date, datetime, time

from sqlalchemy import and_, select
from sqlalchemy.orm import Session, selectinload

from app.models.geolocation_log import GeolocationLog
from app.models.practice_assignment import PracticeAssignment
from app.models.student import Student
from app.models.student_daily_status import StudentDailyStatus


def _find_assignment_for_student_on_date(
    db: Session,
    *,
    student_id: int,
    target_date: date,
) -> PracticeAssignment | None:
    stmt = (
        select(PracticeAssignment)
        .where(
            PracticeAssignment.student_id == student_id,
            PracticeAssignment.is_active.is_(True),
            PracticeAssignment.start_date <= target_date,
            PracticeAssignment.end_date >= target_date,
        )
        .order_by(PracticeAssignment.id.desc())
    )
    return db.scalar(stmt)


def _get_logs_for_student_on_date(
    db: Session,
    *,
    student_id: int,
    target_date: date,
) -> list[GeolocationLog]:
    start_dt = datetime.combine(target_date, time.min)
    end_dt = datetime.combine(target_date, time.max)

    stmt = (
        select(GeolocationLog)
        .options(selectinload(GeolocationLog.check))
        .where(
            GeolocationLog.student_id == student_id,
            and_(
                GeolocationLog.sent_at >= start_dt,
                GeolocationLog.sent_at <= end_dt,
            ),
        )
        .order_by(GeolocationLog.sent_at.desc())
    )
    return list(db.scalars(stmt).all())


def _determine_status_color(
    *,
    student: Student,
    assignment: PracticeAssignment | None,
    logs: list[GeolocationLog],
) -> tuple[str, bool | None, str]:
    if not student.is_active:
        return "gray", None, "Студент неактивен"

    if not assignment:
        return "gray", None, "На дату отсутствует активное назначение практики"

    if not logs:
        return "red", False, "За текущую дату отсутствуют отметки геолокации"

    check_results = [log.check.check_result for log in logs if log.check]

    if "green" in check_results:
        return "green", True, "Есть хотя бы одна корректная отметка в зоне предприятия"

    if "yellow" in check_results:
        return "yellow", None, "Есть отметки, требующие дополнительной проверки"

    return "red", False, "Отметки есть, но ни одна не подтверждает нахождение на месте практики"


def recalculate_student_daily_status(
    db: Session,
    *,
    student_id: int,
    target_date: date,
) -> StudentDailyStatus:
    student = db.get(Student, student_id)
    if not student:
        raise ValueError("Student not found")

    assignment = _find_assignment_for_student_on_date(
        db,
        student_id=student_id,
        target_date=target_date,
    )
    logs = _get_logs_for_student_on_date(
        db,
        student_id=student_id,
        target_date=target_date,
    )

    status_color, is_on_place, comment = _determine_status_color(
        student=student,
        assignment=assignment,
        logs=logs,
    )

    last_log = logs[0] if logs else None
    last_check = last_log.check if last_log and last_log.check else None

    existing_stmt = select(StudentDailyStatus).where(
        StudentDailyStatus.student_id == student_id,
        StudentDailyStatus.status_date == target_date,
    )
    existing = db.scalar(existing_stmt)

    if existing:
        existing.assignment_id = assignment.id if assignment else None
        existing.status_color = status_color
        existing.last_geolocation_log_id = last_log.id if last_log else None
        existing.last_check_id = last_check.id if last_check else None
        existing.checkins_count = len(logs)
        existing.required_checkins_count = assignment.required_checkins_per_day if assignment else 1
        existing.is_on_place = is_on_place
        existing.comment = comment
        db.commit()
        db.refresh(existing)
        return existing

    obj = StudentDailyStatus(
        student_id=student_id,
        assignment_id=assignment.id if assignment else None,
        status_date=target_date,
        status_color=status_color,
        last_geolocation_log_id=last_log.id if last_log else None,
        last_check_id=last_check.id if last_check else None,
        checkins_count=len(logs),
        required_checkins_count=assignment.required_checkins_per_day if assignment else 1,
        is_on_place=is_on_place,
        comment=comment,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def recalculate_daily_statuses_for_date(
    db: Session,
    *,
    target_date: date,
) -> list[StudentDailyStatus]:
    student_ids = list(db.scalars(select(Student.id).order_by(Student.id)).all())
    result = []
    for student_id in student_ids:
        result.append(
            recalculate_student_daily_status(
                db,
                student_id=student_id,
                target_date=target_date,
            )
        )
    return result
