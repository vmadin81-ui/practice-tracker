from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import ensure_group_access, get_current_user
from app.core.database import get_db
from app.models.enterprise import Enterprise
from app.models.geolocation_log import GeolocationLog
from app.models.practice_assignment import PracticeAssignment
from app.models.student import Student
from app.models.student_daily_status import StudentDailyStatus
from app.models.user import User
from app.schemas.dashboard import (
    DashboardMapResponse,
    DashboardSummaryResponse,
    MapEnterprisePoint,
    MapStudentPoint,
)
from app.services.dashboard_service import build_dashboard_summary

router = APIRouter()


@router.get("/map", response_model=DashboardMapResponse)
def get_dashboard_map(
    status_date: date = Query(...),
    group_id: int | None = Query(default=None),
    enterprise_id: int | None = Query(default=None),
    status_color: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_group_access(group_id, current_user)

    stmt = (
        select(StudentDailyStatus)
        .options(
            selectinload(StudentDailyStatus.student).selectinload(Student.group),
            selectinload(StudentDailyStatus.assignment).selectinload(PracticeAssignment.enterprise),
            selectinload(StudentDailyStatus.last_check),
        )
        .where(StudentDailyStatus.status_date == status_date)
    )

    if status_color is not None:
        stmt = stmt.where(StudentDailyStatus.status_color == status_color)

    items = list(db.scalars(stmt).all())

    if current_user.role != "admin":
        allowed_group_ids = {item.group_id for item in current_user.group_accesses}
        items = [
            item
            for item in items
            if item.student and item.student.group_id in allowed_group_ids
        ]

    if group_id is not None:
        items = [
            item
            for item in items
            if item.student and item.student.group_id == group_id
        ]

    if enterprise_id is not None:
        items = [
            item
            for item in items
            if item.assignment and item.assignment.enterprise_id == enterprise_id
        ]

    student_points: list[MapStudentPoint] = []

    for item in items:
        last_log = None
        distance_m = None

        if item.last_geolocation_log_id is not None:
            last_log = db.get(GeolocationLog, item.last_geolocation_log_id)

        if item.last_check is not None and item.last_check.distance_m is not None:
            distance_m = float(item.last_check.distance_m)

        student_points.append(
            MapStudentPoint(
                student_id=item.student_id,
                full_name=item.student.full_name if item.student else "",
                group_name=item.student.group.name if item.student and item.student.group else None,
                enterprise_name=item.assignment.enterprise.name if item.assignment and item.assignment.enterprise else None,
                status_color=item.status_color,
                last_sent_at=last_log.sent_at if last_log else None,
                latitude=last_log.latitude if last_log else None,
                longitude=last_log.longitude if last_log else None,
                distance_m=distance_m,
                comment=item.comment,
            )
        )

    enterprise_stmt = select(Enterprise).where(Enterprise.is_active.is_(True))
    if enterprise_id is not None:
        enterprise_stmt = enterprise_stmt.where(Enterprise.id == enterprise_id)

    enterprises = list(db.scalars(enterprise_stmt).all())
    enterprise_points = [
        MapEnterprisePoint(
            enterprise_id=e.id,
            name=e.name,
            latitude=e.latitude,
            longitude=e.longitude,
            allowed_radius_m=e.allowed_radius_m,
        )
        for e in enterprises
    ]

    return DashboardMapResponse(
        date=status_date.isoformat(),
        students=student_points,
        enterprises=enterprise_points,
    )


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    status_date: date = Query(...),
    group_id: int | None = Query(default=None),
    enterprise_id: int | None = Query(default=None),
    status_color: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_group_access(group_id, current_user)

    return build_dashboard_summary(
        db,
        status_date=status_date,
        group_id=group_id,
        enterprise_id=enterprise_id,
        status_color=status_color,
        current_user=current_user,
    )
