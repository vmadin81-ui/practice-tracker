from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import ensure_group_access, get_current_user, require_roles
from app.core.database import get_db
from app.crud.specialty import get_specialty
from app.crud.student import (
    create_student,
    delete_student,
    get_student,
    get_students,
    update_student,
)
from app.crud.study_group import get_group
from app.models.practice_assignment import PracticeAssignment
from app.models.user import User
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.student import StudentCreate, StudentReadDetailed, StudentUpdate

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[StudentReadDetailed])
def list_students(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    search: str | None = None,
    group_id: int | None = None,
    specialty_id: int | None = None,
    is_active: bool | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_group_access(group_id, current_user)

    if current_user.role == "admin":
        effective_group_id = group_id
        total, items = get_students(
            db=db,
            skip=skip,
            limit=limit,
            search=search,
            group_id=effective_group_id,
            specialty_id=specialty_id,
            is_active=is_active,
        )
        return {"total": total, "items": items}

    allowed_group_ids = {item.group_id for item in current_user.group_accesses}
    total, items = get_students(
        db=db,
        skip=0,
        limit=10000,
        search=search,
        group_id=None,
        specialty_id=specialty_id,
        is_active=is_active,
    )
    items = [item for item in items if item.group_id in allowed_group_ids]
    if group_id is not None:
        items = [item for item in items if item.group_id == group_id]

    paged_items = items[skip: skip + limit]
    return {"total": len(items), "items": paged_items}


@router.get("/{student_id}", response_model=StudentReadDetailed)
def retrieve_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    obj = get_student(db, student_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Student not found")

    if current_user.role != "admin":
        allowed_group_ids = {item.group_id for item in current_user.group_accesses}
        if obj.group_id not in allowed_group_ids:
            raise HTTPException(status_code=403, detail="No access to student")

    return obj


@router.post("/", response_model=StudentReadDetailed, status_code=status.HTTP_201_CREATED)
def create_student_endpoint(
    payload: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "practice_supervisor")),
):
    ensure_group_access(payload.group_id, current_user)

    if payload.group_id is not None and not get_group(db, payload.group_id):
        raise HTTPException(status_code=404, detail="Group not found")

    if payload.specialty_id is not None and not get_specialty(db, payload.specialty_id):
        raise HTTPException(status_code=404, detail="Specialty not found")

    return create_student(db, payload)


@router.put("/{student_id}", response_model=StudentReadDetailed)
def update_student_endpoint(
    student_id: int,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "practice_supervisor")),
):
    obj = get_student(db, student_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Student not found")

    if current_user.role != "admin":
        allowed_group_ids = {item.group_id for item in current_user.group_accesses}
        if obj.group_id not in allowed_group_ids:
            raise HTTPException(status_code=403, detail="No access to student")

    if payload.group_id is not None:
        ensure_group_access(payload.group_id, current_user)
        if not get_group(db, payload.group_id):
            raise HTTPException(status_code=404, detail="Group not found")

    if payload.specialty_id is not None and not get_specialty(db, payload.specialty_id):
        raise HTTPException(status_code=404, detail="Specialty not found")

    return update_student(db, obj, payload)


@router.delete("/{student_id}", response_model=MessageResponse)
def delete_student_endpoint(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    obj = get_student(db, student_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Student not found")

    has_assignments = (
        db.query(PracticeAssignment.id)
        .filter(PracticeAssignment.student_id == student_id)
        .first()
    )
    if has_assignments:
        raise HTTPException(
            status_code=409,
            detail="Student cannot be deleted because practice assignments are linked to it",
        )

    delete_student(db, obj)
    return {"message": "Student deleted successfully"}
