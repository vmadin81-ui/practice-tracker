from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    daily_statuses,
    dashboard,
    enterprises,
    geolocation,
    groups,
    health,
    practice_assignments,
    specialties,
    students,
)

from app.api.v1.endpoints import (
    auth,
    daily_statuses,
    dashboard,
    enterprises,
    geolocation,
    groups,
    health,
    practice_assignments,
    specialties,
    student_checkin,
    students,
)

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(specialties.router, prefix="/specialties", tags=["Specialties"])
api_router.include_router(groups.router, prefix="/groups", tags=["Groups"])
api_router.include_router(students.router, prefix="/students", tags=["Students"])
api_router.include_router(enterprises.router, prefix="/enterprises", tags=["Enterprises"])
api_router.include_router(
    practice_assignments.router,
    prefix="/practice-assignments",
    tags=["Practice Assignments"],
)
api_router.include_router(
    geolocation.router,
    prefix="/geolocation",
    tags=["Geolocation"],
)
api_router.include_router(
    daily_statuses.router,
    prefix="/daily-statuses",
    tags=["Daily Statuses"],
)
api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["Dashboard"],
)
api_router.include_router(
    student_checkin.router,
    prefix="/student-checkin",
    tags=["Student Check-in"],
)
