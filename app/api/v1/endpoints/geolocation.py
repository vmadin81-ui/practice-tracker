from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.geolocation import get_geolocation_log, get_geolocation_logs
from app.schemas.common import PaginatedResponse
from app.schemas.geolocation import (
    GeolocationCheckInRequest,
    GeolocationCheckInResponse,
    GeolocationLogReadDetailed,
)
from app.services.geolocation_service import process_check_in

router = APIRouter()


@router.post(
    "/check-in",
    response_model=GeolocationCheckInResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_check_in(
    payload: GeolocationCheckInRequest,
    db: Session = Depends(get_db),
):
    if payload.student_id is None:
        raise HTTPException(status_code=422, detail="student_id is required")

    try:
        return process_check_in(db, payload=payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc


@router.get("/logs", response_model=PaginatedResponse[GeolocationLogReadDetailed])
def list_geolocation_logs(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    student_id: int | None = None,
    assignment_id: int | None = None,
    source: str | None = None,
    date: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    db: Session = Depends(get_db),
):
    date_value = None
    from_value = None
    to_value = None

    if date:
        from datetime import date as dt_date
        date_value = dt_date.fromisoformat(date)

    if date_from:
        from datetime import date as dt_date
        from_value = dt_date.fromisoformat(date_from)

    if date_to:
        from datetime import date as dt_date
        to_value = dt_date.fromisoformat(date_to)

    total, items = get_geolocation_logs(
        db=db,
        skip=skip,
        limit=limit,
        student_id=student_id,
        assignment_id=assignment_id,
        source=source,
        date_value=date_value,
        date_from=from_value,
        date_to=to_value,
    )
    return {"total": total, "items": items}


@router.get("/logs/{log_id}", response_model=GeolocationLogReadDetailed)
def retrieve_geolocation_log(
    log_id: int,
    db: Session = Depends(get_db),
):
    obj = get_geolocation_log(db, log_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Geolocation log not found")
    return obj
