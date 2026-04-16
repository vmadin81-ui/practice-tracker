from datetime import datetime

from sqlalchemy.orm import Session

from app.core.student_security import expires_after_hours, generate_raw_token, hash_token
from app.crud.student_checkin import (
    count_student_logs_for_date,
    create_student_checkin_session,
    get_active_assignment_for_student_on_date,
    get_active_student_access_link_by_hash,
    get_student_geolocation_history,
)
from app.schemas.geolocation import GeolocationCheckInRequest
from app.schemas.student_checkin import (
    StudentCheckinHistoryItem,
    StudentCheckinHistoryResponse,
    StudentCheckinMeResponse,
    StudentCheckinSessionStartResponse,
    StudentCheckinSubmitRequest,
    StudentCheckinSubmitResponse,
)
from app.services.geolocation_service import process_check_in


def start_student_session(
    db: Session,
    *,
    access_token: str,
    device_label: str | None = None,
) -> StudentCheckinSessionStartResponse:
    link = get_active_student_access_link_by_hash(db, hash_token(access_token))
    if not link:
        raise ValueError("Access link is invalid")

    expires_at = expires_after_hours(12).replace(tzinfo=None)
    raw_session_token = generate_raw_token(24)

    create_student_checkin_session(
        db,
        student_id=link.student_id,
        session_token_hash=hash_token(raw_session_token),
        expires_at=expires_at,
        device_label=device_label,
    )

    link.last_used_at = datetime.now()
    db.commit()

    return StudentCheckinSessionStartResponse(
        session_token=raw_session_token,
        expires_at=expires_at,
    )


def build_student_checkin_me(db: Session, *, student) -> StudentCheckinMeResponse:
    today = datetime.now().date()
    assignment = get_active_assignment_for_student_on_date(
        db,
        student_id=student.id,
        target_date=today,
    )
    today_count = count_student_logs_for_date(
        db,
        student_id=student.id,
        target_date=today,
    )

    if assignment:
        status_message = "Сегодня доступна отметка практики"
    else:
        status_message = "На сегодня активное назначение практики не найдено"

    return StudentCheckinMeResponse(
        student_id=student.id,
        full_name=student.full_name,
        group_name=student.group.name if student.group else None,
        specialty_name=student.specialty.name if student.specialty else None,
        assignment_id=assignment.id if assignment else None,
        enterprise_name=assignment.enterprise.name if assignment and assignment.enterprise else None,
        enterprise_address=assignment.enterprise.address if assignment and assignment.enterprise else None,
        start_date=assignment.start_date.isoformat() if assignment else None,
        end_date=assignment.end_date.isoformat() if assignment else None,
        today_checkins_count=today_count,
        required_checkins_per_day=assignment.required_checkins_per_day if assignment else None,
        status_message=status_message,
    )


def submit_student_checkin(
    db: Session,
    *,
    student,
    payload: StudentCheckinSubmitRequest,
) -> StudentCheckinSubmitResponse:
    result = process_check_in(
        db,
        payload=GeolocationCheckInRequest(
            student_id=student.id,
            latitude=payload.latitude,
            longitude=payload.longitude,
            accuracy_m=payload.accuracy_m,
            sent_at=payload.device_time or datetime.now(),
            source="student_web",
        ),
    )

    return StudentCheckinSubmitResponse(
        geolocation_log_id=result["geolocation_log_id"],
        status_color=result["status_color"],
        distance_m=result["distance_m"],
        comment=result["comment"],
    )


def build_student_checkin_history(
    db: Session,
    *,
    student_id: int,
    skip: int = 0,
    limit: int = 50,
) -> StudentCheckinHistoryResponse:
    total, items = get_student_geolocation_history(
        db,
        student_id=student_id,
        skip=skip,
        limit=limit,
    )

    return StudentCheckinHistoryResponse(
        total=total,
        items=[
            StudentCheckinHistoryItem(
                geolocation_log_id=item.id,
                sent_at=item.sent_at,
                latitude=item.latitude,
                longitude=item.longitude,
                accuracy_m=item.accuracy_m,
                status_color=item.check.check_result if item.check else None,
                distance_m=item.check.distance_m if item.check else None,
                comment=item.check.comment if item.check else None,
            )
            for item in items
        ],
    )
