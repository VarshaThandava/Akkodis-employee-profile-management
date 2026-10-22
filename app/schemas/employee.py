"""Employee schemas: request (create/update) and response (read)."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ----- Request schemas -----

class EmployeeCreate(BaseModel):
    """Request schema for creating an employee. All fields required."""

    employee_id: str = Field(
        ...,
        min_length=1,
        max_length=64,
        description="Unique employee identifier.",
    )
    full_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Full name of the employee.",
    )
    email: EmailStr = Field(
        ...,
        description="Unique email address (valid format required).",
    )
    department: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Department name.",
    )


class EmployeeUpdate(BaseModel):
    """Request schema for partial update. All fields optional."""

    full_name: str | None = Field(None, min_length=1, max_length=255)
    email: EmailStr | None = None
    department: str | None = Field(None, min_length=1, max_length=128)


# ----- Response schema -----

class EmployeeRead(BaseModel):
    """Response schema for a single employee."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime
