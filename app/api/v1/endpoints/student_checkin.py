from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps_student import get_current_student
from app.core.database import get_db
from app.models.student import Student
from app.schemas.student_checkin import (
    StudentCheckinHistoryResponse,
    StudentCheckinMeResponse,
    StudentCheckinSessionStartRequest,
    StudentCheckinSessionStartResponse,
    StudentCheckinSubmitRequest,
    StudentCheckinSubmitResponse,
)
from app.services.student_checkin_service import (
    build_student_checkin_history,
    build_student_checkin_me,
    start_student_session,
    submit_student_checkin,
)

router = APIRouter()


@router.post("/session/start", response_model=StudentCheckinSessionStartResponse)
def start_session(
    payload: StudentCheckinSessionStartRequest,
    db: Session = Depends(get_db),
):
    try:
        return start_student_session(
            db,
            access_token=payload.access_token,
            device_id=payload.device_id,
            device_label=payload.device_label,
            user_agent=payload.user_agent,
        )
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.get("/me", response_model=StudentCheckinMeResponse)
def me(
    db: Session = Depends(get_db),
    student: Student = Depends(get_current_student),
):
    return build_student_checkin_me(db, student=student)


@router.post("/submit", response_model=StudentCheckinSubmitResponse, status_code=status.HTTP_201_CREATED)
def submit(
    payload: StudentCheckinSubmitRequest,
    db: Session = Depends(get_db),
    student: Student = Depends(get_current_student),
):
    return submit_student_checkin(db, student=student, payload=payload)


@router.get("/history", response_model=StudentCheckinHistoryResponse)
def history(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    student: Student = Depends(get_current_student),
):
    return build_student_checkin_history(
        db,
        student_id=student.id,
        skip=skip,
        limit=limit,
    )
