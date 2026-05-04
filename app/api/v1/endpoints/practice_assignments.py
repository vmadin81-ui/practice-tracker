from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud.enterprise import get_enterprise
from app.crud.practice_assignment import (
    create_practice_assignment,
    delete_practice_assignment,
    get_practice_assignment,
    get_practice_assignments,
    has_assignment_overlap,
    update_practice_assignment,
)
from app.crud.student import get_student
from app.crud.user import get_user
from app.models.user import User
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.practice_assignment import (
    PracticeAssignmentCreate,
    PracticeAssignmentReadDetailed,
    PracticeAssignmentUpdate,
)

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[PracticeAssignmentReadDetailed])
def list_practice_assignments(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=500),
    student_id: int | None = None,
    enterprise_id: int | None = None,
    is_active: bool | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total, items = get_practice_assignments(
        db=db,
        skip=skip,
        limit=limit,
        student_id=student_id,
        enterprise_id=enterprise_id,
        is_active=is_active,
    )
    return {"total": total, "items": items}


@router.get("/{assignment_id}", response_model=PracticeAssignmentReadDetailed)
def retrieve_practice_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    obj = get_practice_assignment(db, assignment_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Practice assignment not found")
    return obj


@router.post(
    "/",
    response_model=PracticeAssignmentReadDetailed,
    status_code=status.HTTP_201_CREATED,
)
def create_practice_assignment_endpoint(
    payload: PracticeAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in {"admin", "practice_supervisor"}:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    if not get_student(db, payload.student_id):
        raise HTTPException(status_code=404, detail="Student not found")

    if not get_enterprise(db, payload.enterprise_id):
        raise HTTPException(status_code=404, detail="Enterprise not found")

    if payload.supervisor_user_id is not None:
        supervisor = get_user(db, payload.supervisor_user_id)
        if not supervisor:
            raise HTTPException(status_code=404, detail="Supervisor user not found")
        if supervisor.role != "practice_supervisor":
            raise HTTPException(status_code=400, detail="Selected user is not a practice supervisor")

    if has_assignment_overlap(
        db,
        student_id=payload.student_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
    ):
        raise HTTPException(
            status_code=409,
            detail="Student already has an overlapping active practice assignment",
        )

    return create_practice_assignment(db, payload)


@router.put("/{assignment_id}", response_model=PracticeAssignmentReadDetailed)
def update_practice_assignment_endpoint(
    assignment_id: int,
    payload: PracticeAssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in {"admin", "practice_supervisor"}:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    obj = get_practice_assignment(db, assignment_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Practice assignment not found")

    new_student_id = payload.student_id if payload.student_id is not None else obj.student_id
    new_enterprise_id = payload.enterprise_id if payload.enterprise_id is not None else obj.enterprise_id
    new_start_date = payload.start_date if payload.start_date is not None else obj.start_date
    new_end_date = payload.end_date if payload.end_date is not None else obj.end_date

    if new_end_date < new_start_date:
        raise HTTPException(status_code=422, detail="end_date cannot be earlier than start_date")

    if payload.allowed_start_time and payload.allowed_end_time:
        if payload.allowed_end_time <= payload.allowed_start_time:
            raise HTTPException(
                status_code=422,
                detail="allowed_end_time must be later than allowed_start_time",
            )

    if not get_student(db, new_student_id):
        raise HTTPException(status_code=404, detail="Student not found")

    if not get_enterprise(db, new_enterprise_id):
        raise HTTPException(status_code=404, detail="Enterprise not found")

    if payload.supervisor_user_id is not None:
        supervisor = get_user(db, payload.supervisor_user_id)
        if not supervisor:
            raise HTTPException(status_code=404, detail="Supervisor user not found")
        if supervisor.role != "practice_supervisor":
            raise HTTPException(status_code=400, detail="Selected user is not a practice supervisor")

    if has_assignment_overlap(
        db,
        student_id=new_student_id,
        start_date=new_start_date,
        end_date=new_end_date,
        exclude_assignment_id=assignment_id,
    ):
        raise HTTPException(
            status_code=409,
            detail="Student already has an overlapping active practice assignment",
        )

    return update_practice_assignment(db, obj, payload)


@router.delete("/{assignment_id}", response_model=MessageResponse)
def delete_practice_assignment_endpoint(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    obj = get_practice_assignment(db, assignment_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Practice assignment not found")

    delete_practice_assignment(db, obj)
    return {"message": "Practice assignment deleted successfully"}
