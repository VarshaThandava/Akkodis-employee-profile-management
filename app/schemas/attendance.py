"""Attendance schemas: request and response models."""
from datetime import date as date_type
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.attendance import AttendanceStatus


# ----- Request schemas -----

class AttendanceCreate(BaseModel):
    """Request schema for creating an attendance record."""

    employee_id: int = Field(..., description="ID of the employee")
    date: date_type = Field(..., description="Attendance date")
    status: AttendanceStatus = Field(
        ...,
        description="Status: Present or Absent",
    )


class AttendanceUpdate(BaseModel):
    """Request schema for partial update (status only)."""

    status: AttendanceStatus | None = None


# ----- Response schemas -----

class AttendanceRead(BaseModel):
    """Response schema for a single attendance record."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    date: date_type
    status: AttendanceStatus
    created_at: datetime


class AttendanceListByEmployeeResponse(BaseModel):
    """Response for GET /api/attendance/{employee_id}: records + total_present_days."""

    records: list[AttendanceRead] = Field(..., description="Attendance records, newest first")
    total_present_days: int = Field(..., ge=0, description="Count of days with status Present in the result set")
