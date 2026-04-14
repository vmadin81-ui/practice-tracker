from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.specialty import get_specialty
from app.crud.study_group import (
    create_group,
    delete_group,
    get_group,
    get_groups,
    update_group,
)
from app.models.student import Student
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.group import StudyGroupCreate, StudyGroupReadDetailed, StudyGroupUpdate

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[StudyGroupReadDetailed])
def list_groups(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    total, items = get_groups(db=db, skip=skip, limit=limit)
    return {"total": total, "items": items}


@router.get("/{group_id}", response_model=StudyGroupReadDetailed)
def retrieve_group(
    group_id: int,
    db: Session = Depends(get_db),
):
    obj = get_group(db, group_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Group not found")
    return obj


@router.post("/", response_model=StudyGroupReadDetailed, status_code=status.HTTP_201_CREATED)
def create_group_endpoint(
    payload: StudyGroupCreate,
    db: Session = Depends(get_db),
):
    if payload.specialty_id is not None and not get_specialty(db, payload.specialty_id):
        raise HTTPException(status_code=404, detail="Specialty not found")

    return create_group(db, payload)


@router.put("/{group_id}", response_model=StudyGroupReadDetailed)
def update_group_endpoint(
    group_id: int,
    payload: StudyGroupUpdate,
    db: Session = Depends(get_db),
):
    obj = get_group(db, group_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Group not found")

    if payload.specialty_id is not None and not get_specialty(db, payload.specialty_id):
        raise HTTPException(status_code=404, detail="Specialty not found")

    return update_group(db, obj, payload)


@router.delete("/{group_id}", response_model=MessageResponse)
def delete_group_endpoint(
    group_id: int,
    db: Session = Depends(get_db),
):
    obj = get_group(db, group_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Group not found")

    has_students = db.query(Student.id).filter(Student.group_id == group_id).first()
    if has_students:
        raise HTTPException(
            status_code=409,
            detail="Group cannot be deleted because students are linked to it",
        )

    delete_group(db, obj)
    return {"message": "Group deleted successfully"}
