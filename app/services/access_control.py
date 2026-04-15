from app.models.user import User


def is_admin(user: User) -> bool:
    return user.role == "admin"


def is_supervisor(user: User) -> bool:
    return user.role == "practice_supervisor"


def is_viewer(user: User) -> bool:
    return user.role == "viewer"


def user_can_edit(user: User) -> bool:
    return user.role in {"admin", "practice_supervisor"}


def user_can_view(user: User) -> bool:
    return user.role in {"admin", "practice_supervisor", "viewer"}


def filter_group_ids_for_user(user: User, group_ids: list[int]) -> list[int]:
    if is_admin(user):
        return group_ids
    allowed = {item.group_id for item in user.group_accesses}
    return [group_id for group_id in group_ids if group_id in allowed]
