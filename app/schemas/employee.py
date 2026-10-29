"""Employee schemas: request (create/update) and response (read)."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EmployeeCreate(BaseModel):
    """Request schema for creating an employee."""

    employee_id: str = Field(..., min_length=1, max_length=64)
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    department: str = Field(..., min_length=1, max_length=128)

    current_role: str | None = Field(None, max_length=255)

     # Changed by dileepkolekar: technical skills selected in the UI.
    technical_skill: list[str] = Field(default_factory=list)


    years_of_experience: float | None = Field(None, ge=0)
    location: str | None = Field(None, max_length=255)

    # Industry / Domain
    industry: str | None = Field(None, max_length=100)
    other_industry: str | None = Field(None, max_length=255)


class EmployeeUpdate(BaseModel):
    """Request schema for partial employee updates."""

    full_name: str | None = Field(
        None,
        min_length=1,
        max_length=255
    )

    email: EmailStr | None = None

    department: str | None = Field(
        None,
        min_length=1,
        max_length=128
    )

    current_role: str | None = Field(None, max_length=255)

     # Changed by dileepkolekar: allow technical skills to be updated.
    technical_skill: list[str] | None = None

    years_of_experience: float | None = Field(None, ge=0)
    location: str | None = Field(None, max_length=255)

    # Industry / Domain
    industry: str | None = Field(None, max_length=100)
    other_industry: str | None = Field(None, max_length=255)


class EmployeeRead(BaseModel):
    """Response schema for a single employee."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: str
    full_name: str
    email: str
    department: str

    current_role: str | None = None

      # Changed by dileepkolekar: return technical skills to frontend.
    technical_skill: list[str] = Field(default_factory=list)
    
    years_of_experience: float | None = None
    location: str | None = None

    # Industry / Domain
    industry: str | None = None
    other_industry: str | None = None

    created_at: datetime