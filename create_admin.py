
from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User


ADMIN_EMAIL = "admin@company.com"
ADMIN_PASSWORD = "Admin@123"


def create_admin():
    db = SessionLocal()

    try:
        existing_user = db.execute(
            select(User).where(User.email == ADMIN_EMAIL)
        ).scalar_one_or_none()

        if existing_user:
            print("Admin account already exists.")
            return

        admin = User(
            email=ADMIN_EMAIL,
            hashed_password=hash_password(ADMIN_PASSWORD),
            role="HR Admin",
            employee_record_id=None,
            is_active=True
        )

        db.add(admin)
        db.commit()

        print("Admin account created successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
