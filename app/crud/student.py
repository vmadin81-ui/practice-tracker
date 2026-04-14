from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate


def get_student(db: Session, student_id: int) -> Student | None:
    stmt = (
        select(Student)
        .options(
            selectinload(Student.group),
            selectinload(Student.specialty),
        )
        .where(Student.id == student_id)
    )
    return db.scalar(stmt)


def get_students(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: str | None = None,
    group_id: int | None = None,
    specialty_id: int | None = None,
    is_active: bool | None = None,
) -> tuple[int, list[Student]]:
    stmt = select(Student).options(
        selectinload(Student.group),
        selectinload(Student.specialty),
    )

    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                Student.full_name.ilike(pattern),
                Student.phone.ilike(pattern),
                Student.telegram_id.ilike(pattern),
            )
        )

    if group_id is not None:
        stmt = stmt.where(Student.group_id == group_id)

    if specialty_id is not None:
        stmt = stmt.where(Student.specialty_id == specialty_id)

    if is_active is not None:
        stmt = stmt.where(Student.is_active == is_active)

    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = db.scalar(count_stmt) or 0

    items = db.scalars(
        stmt.order_by(Student.id).offset(skip).limit(limit)
    ).all()

    return total, list(items)


def create_student(db: Session, data: StudentCreate) -> Student:
    obj = Student(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return get_student(db, obj.id)


def update_student(
    db: Session,
    obj: Student,
    data: StudentUpdate,
) -> Student:
    update_data = data.model_dump(exclude_unset=True)

    if any(key in update_data for key in ("last_name", "first_name", "middle_name")) and "full_name" not in update_data:
        last_name = update_data.get("last_name", obj.last_name)
        first_name = update_data.get("first_name", obj.first_name)
        middle_name = update_data.get("middle_name", obj.middle_name)
        update_data["full_name"] = " ".join(
            part for part in [last_name, first_name, middle_name] if part
        )

    for field, value in update_data.items():
        setattr(obj, field, value)

    db.commit()
    db.refresh(obj)
    return get_student(db, obj.id)


def delete_student(db: Session, obj: Student) -> None:
    db.delete(obj)
    db.commit()
