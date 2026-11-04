
"""Employee schemas: request (create/update) and response (read)."""

from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)


class PrimarySkill(BaseModel):
    skill: str = Field(..., min_length=1, max_length=100)
    proficiency: Literal[
        "Beginner",
        "Intermediate",
        "Advanced",
        "Expert"
    ]


PlatformToolProficiency = Literal[
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert"
]


class EmployeeCreate(BaseModel):
    """Request schema for creating an employee."""

    employee_id: str = Field(..., min_length=1, max_length=64)
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    department: str = Field(..., min_length=1, max_length=128)

    # Mandatory fields
    current_role: str = Field(..., min_length=1, max_length=255)
    years_of_experience: float = Field(..., ge=0)
    location: str = Field(..., min_length=1, max_length=255)

    primary_skills: list[PrimarySkill] = Field(..., min_length=1)

    # At least one valid Platform Tool is mandatory
    platform_tools: list[str] = Field(..., min_length=1)

    platform_tools_proficiency: list[PlatformToolProficiency] = Field(
        default_factory=list
    )

    @field_validator("platform_tools")
    @classmethod
    def validate_platform_tools(cls, tools):
        cleaned_tools = [tool.strip() for tool in tools]

        if not cleaned_tools or any(not tool for tool in cleaned_tools):
            raise ValueError(
                "At least one valid Platform Tool is required."
            )

        return cleaned_tools


class EmployeeUpdate(BaseModel):
    """Request schema for partial employee updates."""

    full_name: str | None = Field(None, min_length=1, max_length=255)
    email: EmailStr | None = None
    department: str | None = Field(None, min_length=1, max_length=128)

    # Optional fields for partial updates
    current_role: str | None = Field(None, min_length=1, max_length=255)
    years_of_experience: float | None = Field(None, ge=0)
    location: str | None = Field(None, min_length=1, max_length=255)

    primary_skills: list[PrimarySkill] | None = None

    platform_tools: list[str] | None = Field(
        default=None,
        min_length=1
    )

    platform_tools_proficiency: list[PlatformToolProficiency] | None = None

    @field_validator("platform_tools")
    @classmethod
    def validate_platform_tools(cls, tools):
        if tools is None:
            return tools

        cleaned_tools = [tool.strip() for tool in tools]

        if not cleaned_tools or any(not tool for tool in cleaned_tools):
            raise ValueError(
                "At least one valid Platform Tool is required."
            )

        return cleaned_tools


class EmployeeRead(BaseModel):
    """Response schema for a single employee."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    current_role: str | None = None
    years_of_experience: float | None = None
    location: str | None = None
    created_at: datetime

    primary_skills: list[PrimarySkill] = Field(default_factory=list)
    platform_tools: list[str] = Field(default_factory=list)

    platform_tools_proficiency: list[PlatformToolProficiency] = Field(
        default_factory=list
    )
