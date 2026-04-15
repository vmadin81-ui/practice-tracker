from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session, selectinload

from app.models.practice_assignment import PracticeAssignment
from app.models.user import User
from app.schemas.practice_assignment import (
    PracticeAssignmentCreate,
    PracticeAssignmentUpdate,
)


def get_practice_assignment(
    db: Session,
    assignment_id: int,
) -> PracticeAssignment | None:
    stmt = (
        select(PracticeAssignment)
        .options(
            selectinload(PracticeAssignment.student),
            selectinload(PracticeAssignment.enterprise),
            selectinload(PracticeAssignment.supervisor_user),
        )
        .where(PracticeAssignment.id == assignment_id)
    )
    return db.scalar(stmt)


def get_practice_assignments(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    student_id: int | None = None,
    enterprise_id: int | None = None,
    is_active: bool | None = None,
) -> tuple[int, list[PracticeAssignment]]:
    stmt = select(PracticeAssignment).options(
        selectinload(PracticeAssignment.student),
        selectinload(PracticeAssignment.enterprise),
        selectinload(PracticeAssignment.supervisor_user),
    )

    if student_id is not None:
        stmt = stmt.where(PracticeAssignment.student_id == student_id)

    if enterprise_id is not None:
        stmt = stmt.where(PracticeAssignment.enterprise_id == enterprise_id)

    if is_active is not None:
        stmt = stmt.where(PracticeAssignment.is_active == is_active)

    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = db.scalar(count_stmt) or 0

    items = db.scalars(
        stmt.order_by(PracticeAssignment.id).offset(skip).limit(limit)
    ).all()

    return total, list(items)


def has_assignment_overlap(
    db: Session,
    *,
    student_id: int,
    start_date,
    end_date,
    exclude_assignment_id: int | None = None,
) -> bool:
    stmt = select(PracticeAssignment).where(
        PracticeAssignment.student_id == student_id,
        PracticeAssignment.is_active.is_(True),
        and_(
            PracticeAssignment.start_date <= end_date,
            PracticeAssignment.end_date >= start_date,
        ),
    )

    if exclude_assignment_id is not None:
        stmt = stmt.where(PracticeAssignment.id != exclude_assignment_id)

    return db.scalar(stmt.limit(1)) is not None


def create_practice_assignment(
    db: Session,
    data: PracticeAssignmentCreate,
) -> PracticeAssignment:
    obj = PracticeAssignment(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return get_practice_assignment(db, obj.id)


def update_practice_assignment(
    db: Session,
    obj: PracticeAssignment,
    data: PracticeAssignmentUpdate,
) -> PracticeAssignment:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)

    db.commit()
    db.refresh(obj)
    return get_practice_assignment(db, obj.id)


def delete_practice_assignment(db: Session, obj: PracticeAssignment) -> None:
    db.delete(obj)
    db.commit()
