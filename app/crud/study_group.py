from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.study_group import StudyGroup
from app.schemas.group import StudyGroupCreate, StudyGroupUpdate


def get_group(db: Session, group_id: int) -> StudyGroup | None:
    stmt = (
        select(StudyGroup)
        .options(selectinload(StudyGroup.specialty))
        .where(StudyGroup.id == group_id)
    )
    return db.scalar(stmt)


def get_groups(
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> tuple[int, list[StudyGroup]]:
    total = db.scalar(select(func.count()).select_from(StudyGroup)) or 0
    stmt = (
        select(StudyGroup)
        .options(selectinload(StudyGroup.specialty))
        .order_by(StudyGroup.id)
        .offset(skip)
        .limit(limit)
    )
    items = db.scalars(stmt).all()
    return total, list(items)


def create_group(db: Session, data: StudyGroupCreate) -> StudyGroup:
    obj = StudyGroup(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return get_group(db, obj.id)


def update_group(
    db: Session,
    obj: StudyGroup,
    data: StudyGroupUpdate,
) -> StudyGroup:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return get_group(db, obj.id)


def delete_group(db: Session, obj: StudyGroup) -> None:
    db.delete(obj)
    db.commit()
