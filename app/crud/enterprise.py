from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.enterprise import Enterprise
from app.schemas.enterprise import EnterpriseCreate, EnterpriseUpdate


def get_enterprise(db: Session, enterprise_id: int) -> Enterprise | None:
    return db.get(Enterprise, enterprise_id)


def get_enterprises(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: str | None = None,
    is_active: bool | None = None,
) -> tuple[int, list[Enterprise]]:
    stmt = select(Enterprise)

    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                Enterprise.name.ilike(pattern),
                Enterprise.address.ilike(pattern),
                Enterprise.contact_person.ilike(pattern),
            )
        )

    if is_active is not None:
        stmt = stmt.where(Enterprise.is_active == is_active)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.scalar(count_stmt) or 0

    items = db.scalars(
        stmt.order_by(Enterprise.id).offset(skip).limit(limit)
    ).all()

    return total, list(items)


def create_enterprise(db: Session, data: EnterpriseCreate) -> Enterprise:
    obj = Enterprise(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_enterprise(
    db: Session,
    obj: Enterprise,
    data: EnterpriseUpdate,
) -> Enterprise:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete_enterprise(db: Session, obj: Enterprise) -> None:
    db.delete(obj)
    db.commit()
