
"""User model for authentication and role-based access."""

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
    )

    # Links an employee login account to its employee profile.
    # Admin accounts do not need an employee record.
    employee_record_id: Mapped[int | None] = mapped_column(
        ForeignKey("employees.id"),
        unique=True,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    employee = relationship("Employee")

    def __repr__(self) -> str:
        return (
            f"<User(id={self.id}, "
            f"email={self.email!r}, "
            f"role={self.role!r})>"
        )
