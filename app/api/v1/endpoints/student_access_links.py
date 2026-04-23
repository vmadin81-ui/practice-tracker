from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.database import get_db
from app.core.student_security import generate_raw_token, hash_token
from app.crud.student import get_student
from app.crud.student_access_link import (
    create_student_access_link_obj,
    get_student_access_link,
    list_student_access_links,
    revoke_student_access_link,
)
from app.models.user import User
from app.schemas.student_access_link import (
    StudentAccessLinkCreate,
    StudentAccessLinkCreateResponse,
    StudentAccessLinkRead,
)

router = APIRouter()


@router.get("/", response_model=list[StudentAccessLinkRead])
def get_links(
    student_id: int | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    _: User = Depends(require_roles("admin", "practice_supervisor", "viewer")),
    db: Session = Depends(get_db),
):
    return list_student_access_links(
        db,
        student_id=student_id,
        is_active=is_active,
    )


@router.post("/", response_model=StudentAccessLinkCreateResponse, status_code=status.HTTP_201_CREATED)
def create_link(
    payload: StudentAccessLinkCreate,
    current_user: User = Depends(require_roles("admin", "practice_supervisor")),
    db: Session = Depends(get_db),
):
    student = get_student(db, payload.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    raw_token = generate_raw_token(24)
    token_hash = hash_token(raw_token)

    item = create_student_access_link_obj(
        db,
        student_id=payload.student_id,
        token_hash=token_hash,
        label=payload.label,
        expires_at=payload.expires_at,
        channel=payload.channel,
        issued_by_user_id=current_user.id,
    )

    return StudentAccessLinkCreateResponse(
        item=item,
        raw_access_token=raw_token,
    )


@router.post("/{link_id}/revoke", response_model=StudentAccessLinkRead)
def revoke_link(
    link_id: int,
    _: User = Depends(require_roles("admin", "practice_supervisor")),
    db: Session = Depends(get_db),
):
    obj = get_student_access_link(db, link_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Access link not found")

    return revoke_student_access_link(db, obj)


@router.post("/{link_id}/reissue", response_model=StudentAccessLinkCreateResponse)
def reissue_link(
    link_id: int,
    current_user: User = Depends(require_roles("admin", "practice_supervisor")),
    db: Session = Depends(get_db),
):
    old_obj = get_student_access_link(db, link_id)
    if not old_obj:
        raise HTTPException(status_code=404, detail="Access link not found")

    revoke_student_access_link(db, old_obj)

    raw_token = generate_raw_token(24)
    token_hash = hash_token(raw_token)

    item = create_student_access_link_obj(
        db,
        student_id=old_obj.student_id,
        token_hash=token_hash,
        label=old_obj.label,
        expires_at=old_obj.expires_at,
        channel=old_obj.channel,
        issued_by_user_id=current_user.id,
    )

    return StudentAccessLinkCreateResponse(
        item=item,
        raw_access_token=raw_token,
    )
