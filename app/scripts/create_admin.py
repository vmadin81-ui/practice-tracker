from app.core.database import SessionLocal
from app.crud.user import get_user_by_username
from app.models.user import User
from app.core.security import get_password_hash


def main() -> None:
    db = SessionLocal()
    try:
        username = input("Admin username: ").strip()
        password = input("Admin password: ").strip()
        full_name = input("Full name (optional): ").strip() or None

        existing = get_user_by_username(db, username)
        if existing:
            print("User already exists")
            return

        user = User(
            username=username,
            password_hash=get_password_hash(password),
            full_name=full_name,
            role="admin",
            is_active=True,
        )
        db.add(user)
        db.commit()
        print("Admin created successfully")
    finally:
        db.close()


if __name__ == "__main__":
    main()
