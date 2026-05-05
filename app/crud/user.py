from sqlalchemy import or_, select, func
from sqlalchemy.orm import Session, selectinload

from app.core.security import get_password_hash, verify_password
from app.models.study_group import StudyGroup
from app.models.user import User
from app.models.user_group_access import UserGroupAccess
from app.schemas.user import UserCreate, UserUpdate

from sqlalchemy.orm import joinedload

def get_user_by_username(db: Session, username: str) -> User | None:
    stmt = (
        select(User)
        .options(selectinload(User.group_accesses))
        .where(User.username == username)
    )
    return db.scalar(stmt)


def get_user(db: Session, user_id: int) -> User | None:
    stmt = (
        select(User)
        .options(
            selectinload(User.group_accesses).selectinload(UserGroupAccess.group)
        )
        .where(User.id == user_id)
    )
    return db.scalar(stmt)


def list_users(
    db: Session,
    *,
    skip: int = 0,
    limit: int = 20,
    search: str | None = None,
    role: str | None = None,
    is_active: bool | None = None,
) -> tuple[int, list[User]]:
    stmt = (
        select(User)
        .options(
            selectinload(User.group_accesses).selectinload(UserGroupAccess.group)
        )
        .order_by(User.id)
    )

    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                User.username.ilike(pattern),
                User.full_name.ilike(pattern),
            )
        )

    if role:
        stmt = stmt.where(User.role == role)

    if is_active is not None:
        stmt = stmt.where(User.is_active == is_active)

    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = db.scalar(count_stmt) or 0

    items = db.scalars(stmt.offset(skip).limit(limit)).all()
    return total, list(items)


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not user.is_active:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_user(db: Session, payload: UserCreate) -> User:
    existing = get_user_by_username(db, payload.username)
    if existing:
        raise ValueError("Username already exists")

    if payload.role == "practice_supervisor" and not payload.group_ids:
        raise ValueError("Practice supervisor must have at least one assigned group")

    valid_group_ids: list[int] = []
    if payload.group_ids:
        groups = list(
            db.scalars(
                select(StudyGroup).where(StudyGroup.id.in_(payload.group_ids))
            ).all()
        )
        valid_group_ids = [group.id for group in groups]
        missing = set(payload.group_ids) - set(valid_group_ids)
        if missing:
            raise ValueError(f"Groups not found: {sorted(missing)}")

    user = User(
        username=payload.username.strip(),
        password_hash=get_password_hash(payload.password),
        full_name=payload.full_name.strip() if payload.full_name else None,
        role=payload.role,
        is_active=payload.is_active,
    )
    db.add(user)
    db.flush()

    for group_id in valid_group_ids:
        db.add(UserGroupAccess(user_id=user.id, group_id=group_id))

    db.commit()
    db.refresh(user)
    return get_user(db, user.id)


def update_user(db: Session, user: User, payload: UserUpdate) -> User:
    data = payload.model_dump(exclude_unset=True)

    if "role" in data and data["role"] == "practice_supervisor":
        group_ids = data.get("group_ids", [item.group_id for item in user.group_accesses])
        if not group_ids:
            raise ValueError("Practice supervisor must have at least one assigned group")

    if "full_name" in data:
        user.full_name = data["full_name"].strip() if data["full_name"] else None

    if "role" in data and data["role"] is not None:
        user.role = data["role"]

    if "is_active" in data and data["is_active"] is not None:
        user.is_active = data["is_active"]

    if "password" in data and data["password"]:
        user.password_hash = get_password_hash(data["password"])

    if "group_ids" in data and data["group_ids"] is not None:
        requested_group_ids = data["group_ids"]

        valid_groups = list(
            db.scalars(
                select(StudyGroup).where(StudyGroup.id.in_(requested_group_ids))
            ).all()
        )
        valid_group_ids = [group.id for group in valid_groups]
        missing = set(requested_group_ids) - set(valid_group_ids)
        if missing:
            raise ValueError(f"Groups not found: {sorted(missing)}")

        db.query(UserGroupAccess).filter(UserGroupAccess.user_id == user.id).delete()
        db.flush()

        for group_id in valid_group_ids:
            db.add(UserGroupAccess(user_id=user.id, group_id=group_id))

    db.commit()
    db.refresh(user)
    return get_user(db, user.id)


def get_user_group_ids(user: User) -> list[int]:
    return [item.group_id for item in user.group_accesses]
