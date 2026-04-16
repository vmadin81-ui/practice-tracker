from app.core.database import SessionLocal
from app.core.student_security import expires_after_hours, generate_raw_token, hash_token
from app.models.student import Student
from app.models.student_access_link import StudentAccessLink


def main() -> None:
    db = SessionLocal()
    try:
        student_id = int(input("Student ID: ").strip())
        student = db.get(Student, student_id)
        if not student:
            print("Student not found")
            return

        raw_token = generate_raw_token(24)
        token_hash = hash_token(raw_token)

        link = StudentAccessLink(
            student_id=student_id,
            access_token_hash=token_hash,
            channel="web",
            is_active=True,
            expires_at=expires_after_hours(24 * 30).replace(tzinfo=None),
        )
        db.add(link)
        db.commit()

        print("Access token created successfully")
        print(f"RAW TOKEN: {raw_token}")
        print(f"CHECK-IN URL: /student-checkin/start?token={raw_token}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
