from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.enterprise import (
    create_enterprise,
    delete_enterprise,
    get_enterprise,
    get_enterprises,
    update_enterprise,
)
from app.models.practice_assignment import PracticeAssignment
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.enterprise import EnterpriseCreate, EnterpriseRead, EnterpriseUpdate

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[EnterpriseRead])
def list_enterprises(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    search: str | None = None,
    is_active: bool | None = None,
    db: Session = Depends(get_db),
):
    total, items = get_enterprises(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        is_active=is_active,
    )
    return {"total": total, "items": items}


@router.get("/{enterprise_id}", response_model=EnterpriseRead)
def retrieve_enterprise(
    enterprise_id: int,
    db: Session = Depends(get_db),
):
    obj = get_enterprise(db, enterprise_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Enterprise not found")
    return obj


@router.post("/", response_model=EnterpriseRead, status_code=status.HTTP_201_CREATED)
def create_enterprise_endpoint(
    payload: EnterpriseCreate,
    db: Session = Depends(get_db),
):
    return create_enterprise(db, payload)


@router.put("/{enterprise_id}", response_model=EnterpriseRead)
def update_enterprise_endpoint(
    enterprise_id: int,
    payload: EnterpriseUpdate,
    db: Session = Depends(get_db),
):
    obj = get_enterprise(db, enterprise_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Enterprise not found")
    return update_enterprise(db, obj, payload)


@router.delete("/{enterprise_id}", response_model=MessageResponse)
def delete_enterprise_endpoint(
    enterprise_id: int,
    db: Session = Depends(get_db),
):
    obj = get_enterprise(db, enterprise_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Enterprise not found")

    has_assignments = (
        db.query(PracticeAssignment.id)
        .filter(PracticeAssignment.enterprise_id == enterprise_id)
        .first()
    )
    if has_assignments:
        raise HTTPException(
            status_code=409,
            detail="Enterprise cannot be deleted because practice assignments are linked to it",
        )

    delete_enterprise(db, obj)
    return {"message": "Enterprise deleted successfully"}
