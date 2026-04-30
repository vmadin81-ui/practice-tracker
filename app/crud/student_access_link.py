from sqlalchemy import select, or_, func
from sqlalchemy.orm import Session, selectinload

from app.models.student import Student
from app.models.student_access_link import StudentAccessLink


def get_student_access_link(db: Session, link_id: int) -> StudentAccessLink | None:
    stmt = (
        select(StudentAccessLink)
        .options(
            selectinload(StudentAccessLink.student).selectinload(Student.group),
            selectinload(StudentAccessLink.student).selectinload(Student.specialty),
            selectinload(StudentAccessLink.issued_by_user),
        )
        .where(StudentAccessLink.id == link_id)
    )
    return db.scalar(stmt)


def list_student_access_links(
    db: Session,
    *,
    skip: int = 0,
    limit: int = 20,
    search: str | None = None,
    student_id: int | None = None,
    is_active: bool | None = None,
) -> tuple[int, list[StudentAccessLink]]:
    stmt = (
        select(StudentAccessLink)
        .join(Student, Student.id == StudentAccessLink.student_id)
        .options(
            selectinload(StudentAccessLink.student).selectinload(Student.group),
            selectinload(StudentAccessLink.student).selectinload(Student.specialty),
            selectinload(StudentAccessLink.issued_by_user),
        )
        .order_by(StudentAccessLink.id.desc())
    )

    if student_id is not None:
        stmt = stmt.where(StudentAccessLink.student_id == student_id)

    if is_active is not None:
        stmt = stmt.where(StudentAccessLink.is_active == is_active)

    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                Student.full_name.ilike(pattern),
                StudentAccessLink.label.ilike(pattern),
                StudentAccessLink.last_device_label.ilike(pattern),
            )
        )

    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = db.scalar(count_stmt) or 0

    items = db.scalars(stmt.offset(skip).limit(limit)).all()
    return total, list(items)

def create_student_access_link_obj(
    db: Session,
    *,
    student_id: int,
    token_hash: str,
    label: str | None,
    expires_at,
    channel: str,
    issued_by_user_id: int | None,
) -> StudentAccessLink:
    obj = StudentAccessLink(
        student_id=student_id,
        access_token_hash=token_hash,
        label=label,
        expires_at=expires_at,
        channel=channel,
        issued_by_user_id=issued_by_user_id,
        is_active=True,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return get_student_access_link(db, obj.id)


def revoke_student_access_link(db: Session, obj: StudentAccessLink):
    from datetime import datetime

    obj.is_active = False
    obj.revoked_at = datetime.now()
    db.commit()
    db.refresh(obj)
    return get_student_access_link(db, obj.id)
