from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.daily_status import (
    get_daily_status,
    get_daily_status_history,
    get_daily_statuses,
)
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.daily_status import DailyStatusReadDetailed
from app.services.daily_status_service import (
    recalculate_daily_statuses_for_date,
    recalculate_student_daily_status,
)

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[DailyStatusReadDetailed])
def list_daily_statuses(
    status_date: date | None = Query(default=None),
    group_id: int | None = Query(default=None),
    enterprise_id: int | None = Query(default=None),
    status_color: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    total, items = get_daily_statuses(
        db=db,
        status_date=status_date,
        group_id=group_id,
        enterprise_id=enterprise_id,
        status_color=status_color,
        skip=skip,
        limit=limit,
    )
    return {"total": total, "items": items}


@router.get("/history/{student_id}", response_model=PaginatedResponse[DailyStatusReadDetailed])
def get_student_daily_status_history(
    student_id: int,
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=200, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    total, items = get_daily_status_history(
        db,
        student_id=student_id,
        date_from=date_from,
        date_to=date_to,
        skip=skip,
        limit=limit,
    )
    return {"total": total, "items": items}


@router.get("/{student_id}", response_model=DailyStatusReadDetailed)
def get_student_daily_status(
    student_id: int,
    status_date: date = Query(...),
    db: Session = Depends(get_db),
):
    obj = get_daily_status(
        db,
        student_id=student_id,
        status_date=status_date,
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Daily status not found")
    return obj


@router.post("/recalculate/{student_id}", response_model=DailyStatusReadDetailed)
def recalculate_one_student_status(
    student_id: int,
    status_date: date = Query(...),
    db: Session = Depends(get_db),
):
    try:
        return recalculate_student_daily_status(
            db,
            student_id=student_id,
            target_date=status_date,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/recalculate", response_model=MessageResponse, status_code=status.HTTP_200_OK)
def recalculate_all_statuses(
    status_date: date = Query(...),
    db: Session = Depends(get_db),
):
    recalculate_daily_statuses_for_date(
        db,
        target_date=status_date,
    )
    return {"message": "Daily statuses recalculated successfully"}
