"""Employee model."""
from datetime import datetime

from sqlalchemy import DateTime, Float, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    employee_id: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
        index=True
    )

    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    department: Mapped[str] = mapped_column(
        String(128),
        nullable=False
    )

    # Employee profile fields
    current_role: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    years_of_experience: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    location: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    # Industry / Domain
    industry: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    other_industry: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    attendances: Mapped[list["Attendance"]] = relationship(
        "Attendance",
        back_populates="employee",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Employee(id={self.id}, employee_id={self.employee_id!r})>"