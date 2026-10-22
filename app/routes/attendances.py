"""Attendance API routes."""
from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.attendance import attendance_crud
from app.crud.employee import employee_crud
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceListByEmployeeResponse,
    AttendanceRead,
    AttendanceUpdate,
)
from app.utils.exceptions import NotFoundError

router = APIRouter()


@router.post(
    "",
    response_model=AttendanceRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create attendance record",
    responses={
        201: {"description": "Attendance created"},
        404: {"description": "Employee not found"},
        409: {"description": "Duplicate attendance for same employee and date"},
        422: {"description": "Validation error (invalid status or fields)"},
    },
)
def create_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    """Create an attendance record. Validates employee exists, prevents duplicate employee+date, status must be Present or Absent."""
    return attendance_crud.create(db, payload)


@router.get(
    "/record/{id}",
    response_model=AttendanceRead,
    summary="Get single attendance record",
    responses={404: {"description": "Attendance record not found"}},
)
def get_attendance(id: int, db: Session = Depends(get_db)):
    """Get one attendance record by id."""
    obj = attendance_crud.get_by_id(db, id)
    if not obj:
        raise NotFoundError("Attendance", id)
    return obj


@router.get(
    "",
    response_model=list[AttendanceRead],
    summary="List all attendance (with filters)",
)
def list_attendances(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    employee_id: int | None = Query(None),
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    db: Session = Depends(get_db),
):
    """List attendance records with optional filters. Ordered by date descending."""
    return attendance_crud.get_many(
        db,
        skip=skip,
        limit=limit,
        employee_id=employee_id,
        from_date=from_date,
        to_date=to_date,
    )


@router.patch(
    "/record/{id}",
    response_model=AttendanceRead,
    summary="Update attendance record",
    responses={404: {"description": "Attendance record not found"}},
)
def update_attendance(id: int, payload: AttendanceUpdate, db: Session = Depends(get_db)):
    """Update an attendance record (status only)."""
    return attendance_crud.update(db, id, payload)


@router.delete(
    "/record/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete attendance record",
    responses={404: {"description": "Attendance record not found"}},
)
def delete_attendance(id: int, db: Session = Depends(get_db)):
    """Delete an attendance record by id."""
    attendance_crud.delete(db, id)


@router.get(
    "/{employee_id}",
    response_model=AttendanceListByEmployeeResponse,
    summary="Get attendance for employee",
    responses={404: {"description": "Employee not found"}},
)
def get_attendance_by_employee(
    employee_id: int,
    from_date: date | None = Query(None, description="Filter: attendance on or after this date"),
    to_date: date | None = Query(None, description="Filter: attendance on or before this date"),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """Return attendance records for the given employee, ordered by date descending. Includes total_present_days in the filtered set."""
    if employee_crud.get_by_id(db, employee_id) is None:
        raise NotFoundError("Employee", employee_id)
    records, total_present_days = attendance_crud.get_by_employee_with_stats(
        db,
        employee_id,
        from_date=from_date,
        to_date=to_date,
        skip=skip,
        limit=limit,
    )
    return AttendanceListByEmployeeResponse(
        records=[AttendanceRead.model_validate(r) for r in records],
        total_present_days=total_present_days,
    )
