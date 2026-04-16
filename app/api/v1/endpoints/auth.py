from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.database import get_db
from app.core.security import create_access_token
from app.crud.user import (
    authenticate_user,
    create_user,
    get_user,
    get_user_group_ids,
    list_users,
    update_user,
)
from app.models.user import User
from app.schemas.auth import TokenResponse
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter()


def _to_user_read(user: User) -> UserRead:
    return UserRead(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
        group_ids=get_user_group_ids(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return _to_user_read(current_user)


@router.get("/users", response_model=list[UserRead])
def get_users(
    role: str | None = Query(default=None),
    _: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    return [_to_user_read(user) for user in list_users(db, role=role)]


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user_endpoint(
    payload: UserCreate,
    _: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    try:
        user = create_user(db, payload)
        return _to_user_read(user)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.put("/users/{user_id}", response_model=UserRead)
def update_user_endpoint(
    user_id: int,
    payload: UserUpdate,
    _: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        updated = update_user(db, user, payload)
        return _to_user_read(updated)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
