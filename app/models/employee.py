
"""Employee model."""
from datetime import datetime

from sqlalchemy import DateTime, Float, String, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    employee_id: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    department: Mapped[str] = mapped_column(String(128), nullable=False)

    # New employee profile fields
    current_role: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    years_of_experience: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    location: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    primary_skills: Mapped[list[dict] | None] = mapped_column(
    JSON, nullable=True, default=list
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
