from datetime import time
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enterprise import Enterprise
from app.models.geolocation_check import GeolocationCheck
from app.models.geolocation_log import GeolocationLog
from app.models.practice_assignment import PracticeAssignment
from app.models.student import Student
from app.schemas.geolocation import GeolocationCheckInRequest
from app.utils.geo import haversine_distance_m


DEFAULT_ACCURACY_THRESHOLD_M = Decimal("200")


def _find_active_assignment(
    db: Session,
    *,
    student_id: int,
    target_date,
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


def _evaluate_time_window(
    assignment: PracticeAssignment | None,
    sent_time: time,
) -> bool | None:
    if not assignment:
        return None
    if not assignment.allowed_start_time or not assignment.allowed_end_time:
        return None
    return assignment.allowed_start_time <= sent_time <= assignment.allowed_end_time


def process_check_in(
    db: Session,
    *,
    payload: GeolocationCheckInRequest,
) -> dict:
    student = db.get(Student, payload.student_id)
    if not student:
        raise ValueError("Student not found")

    if not student.is_active:
        raise PermissionError("Student is inactive and cannot send check-in")

    sent_dt = payload.sent_at
    assignment = _find_active_assignment(
        db,
        student_id=payload.student_id,
        target_date=sent_dt.date(),
    )

    log = GeolocationLog(
        student_id=payload.student_id,
        assignment_id=assignment.id if assignment else None,
        source=payload.source,
        latitude=payload.latitude,
        longitude=payload.longitude,
        accuracy_m=payload.accuracy_m,
        sent_at=payload.sent_at,
        processing_status="processed",
    )
    db.add(log)
    db.flush()

    if not assignment:
        check = GeolocationCheck(
            geolocation_log_id=log.id,
            assignment_id=None,
            enterprise_id=None,
            distance_m=None,
            within_radius=None,
            accuracy_ok=None,
            time_window_ok=None,
            check_result="gray",
            comment="Для студента не найдено активное назначение практики на указанную дату",
        )
        db.add(check)
        db.commit()
        db.refresh(log)
        return {
            "geolocation_log_id": log.id,
            "student_id": log.student_id,
            "assignment_id": None,
            "enterprise_id": None,
            "distance_m": None,
            "within_radius": None,
            "accuracy_ok": None,
            "time_window_ok": None,
            "status_color": "gray",
            "comment": check.comment,
        }

    enterprise = db.get(Enterprise, assignment.enterprise_id)
    if not enterprise:
        check = GeolocationCheck(
            geolocation_log_id=log.id,
            assignment_id=assignment.id,
            enterprise_id=None,
            distance_m=None,
            within_radius=None,
            accuracy_ok=None,
            time_window_ok=None,
            check_result="gray",
            comment="Для назначения практики не найдено предприятие",
        )
        db.add(check)
        db.commit()
        db.refresh(log)
        return {
            "geolocation_log_id": log.id,
            "student_id": log.student_id,
            "assignment_id": assignment.id,
            "enterprise_id": None,
            "distance_m": None,
            "within_radius": None,
            "accuracy_ok": None,
            "time_window_ok": None,
            "status_color": "gray",
            "comment": check.comment,
        }

    distance = Decimal(
        str(
            round(
                haversine_distance_m(
                    float(payload.latitude),
                    float(payload.longitude),
                    float(enterprise.latitude),
                    float(enterprise.longitude),
                ),
                2,
            )
        )
    )

    within_radius = distance <= Decimal(str(enterprise.allowed_radius_m))
    accuracy_ok = (
        None
        if payload.accuracy_m is None
        else payload.accuracy_m <= DEFAULT_ACCURACY_THRESHOLD_M
    )
    time_window_ok = _evaluate_time_window(assignment, sent_dt.time())

    if not within_radius:
        result = "red"
        comment = "Координаты не соответствуют месту практики"
    elif accuracy_ok is False:
        result = "yellow"
        comment = "Геолокация получена, но точность координат недостаточна"
    elif time_window_ok is False:
        result = "yellow"
        comment = "Геолокация получена вне допустимого временного окна"
    else:
        result = "green"
        comment = "Студент находится в допустимой зоне предприятия"

    check = GeolocationCheck(
        geolocation_log_id=log.id,
        assignment_id=assignment.id,
        enterprise_id=enterprise.id,
        distance_m=distance,
        within_radius=within_radius,
        accuracy_ok=accuracy_ok,
        time_window_ok=time_window_ok,
        check_result=result,
        comment=comment,
    )

    db.add(check)
    db.commit()
    db.refresh(log)

    return {
        "geolocation_log_id": log.id,
        "student_id": log.student_id,
        "assignment_id": assignment.id,
        "enterprise_id": enterprise.id,
        "distance_m": distance,
        "within_radius": within_radius,
        "accuracy_ok": accuracy_ok,
        "time_window_ok": time_window_ok,
        "status_color": result,
        "comment": comment,
    }
