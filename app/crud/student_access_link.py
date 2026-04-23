from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.specialty import Specialty
from app.models.student import Student
from app.models.student_access_link import StudentAccessLink
from app.models.study_group import StudyGroup


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
    student_id: int | None = None,
    is_active: bool | None = None,
) -> list[StudentAccessLink]:
    stmt = (
        select(StudentAccessLink)
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

    return list(db.scalars(stmt).all())


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
