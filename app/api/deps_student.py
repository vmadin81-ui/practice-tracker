from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.student_security import hash_token, utc_now
from app.crud.student_checkin import get_student_checkin_session_by_hash
from app.models.student import Student


def get_current_student(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> Student:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Student session token is required",
        )

    raw_token = authorization.replace("Bearer ", "", 1).strip()
    token_hash = hash_token(raw_token)

    session = get_student_checkin_session_by_hash(db, token_hash)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid student session",
        )

    if session.expires_at <= utc_now().replace(tzinfo=None):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Student session expired",
        )

    return session.student
