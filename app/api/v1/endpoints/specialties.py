from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.specialty import (
    create_specialty,
    delete_specialty,
    get_specialties,
    get_specialty,
    update_specialty,
)
from app.models.student import Student
from app.models.study_group import StudyGroup
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.specialty import SpecialtyCreate, SpecialtyRead, SpecialtyUpdate

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[SpecialtyRead])
def list_specialties(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=500),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    total, items = get_specialties(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
    )
    return {"total": total, "items": items}


@router.get("/{specialty_id}", response_model=SpecialtyRead)
def retrieve_specialty(
    specialty_id: int,
    db: Session = Depends(get_db),
):
    obj = get_specialty(db, specialty_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Specialty not found")
    return obj


@router.post("/", response_model=SpecialtyRead, status_code=status.HTTP_201_CREATED)
def create_specialty_endpoint(
    payload: SpecialtyCreate,
    db: Session = Depends(get_db),
):
    return create_specialty(db, payload)


@router.put("/{specialty_id}", response_model=SpecialtyRead)
def update_specialty_endpoint(
    specialty_id: int,
    payload: SpecialtyUpdate,
    db: Session = Depends(get_db),
):
    obj = get_specialty(db, specialty_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Specialty not found")
    return update_specialty(db, obj, payload)


@router.delete("/{specialty_id}", response_model=MessageResponse)
def delete_specialty_endpoint(
    specialty_id: int,
    db: Session = Depends(get_db),
):
    obj = get_specialty(db, specialty_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Specialty not found")

    has_groups = db.query(StudyGroup.id).filter(StudyGroup.specialty_id == specialty_id).first()
    has_students = db.query(Student.id).filter(Student.specialty_id == specialty_id).first()

    if has_groups or has_students:
        raise HTTPException(
            status_code=409,
            detail="Specialty cannot be deleted because related groups or students exist",
        )

    delete_specialty(db, obj)
    return {"message": "Specialty deleted successfully"}
