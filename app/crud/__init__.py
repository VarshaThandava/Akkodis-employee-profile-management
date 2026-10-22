"""CRUD operations."""
from app.crud.employee import employee_crud
from app.crud.attendance import attendance_crud

__all__ = ["employee_crud", "attendance_crud"]
