from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.specialty import Specialty
from app.schemas.specialty import SpecialtyCreate, SpecialtyUpdate


def get_specialty(db: Session, specialty_id: int) -> Specialty | None:
    return db.get(Specialty, specialty_id)


def get_specialties(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: str | None = None,
) -> tuple[int, list[Specialty]]:
    stmt = select(Specialty).order_by(Specialty.id)

    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                Specialty.code.ilike(pattern),
                Specialty.name.ilike(pattern),
            )
        )

    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = db.scalar(count_stmt) or 0

    items = db.scalars(stmt.offset(skip).limit(limit)).all()
    return total, list(items)


def create_specialty(db: Session, data: SpecialtyCreate) -> Specialty:
    obj = Specialty(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_specialty(
    db: Session,
    obj: Specialty,
    data: SpecialtyUpdate,
) -> Specialty:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete_specialty(db: Session, obj: Specialty) -> None:
    db.delete(obj)
    db.commit()
