from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.specialty import Specialty
from app.schemas.specialty import SpecialtyCreate, SpecialtyUpdate


def get_specialty(db: Session, specialty_id: int) -> Specialty | None:
    return db.get(Specialty, specialty_id)


def get_specialties(
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> tuple[int, list[Specialty]]:
    total = db.scalar(select(func.count()).select_from(Specialty)) or 0
    items = db.scalars(
        select(Specialty).order_by(Specialty.id).offset(skip).limit(limit)
    ).all()
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
