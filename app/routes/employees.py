"""Employee API routes."""
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import (
    CurrentUser,
    get_current_user,
    require_admin,
)
from app.crud.employee import employee_crud
from app.schemas.employee import EmployeeCreate, EmployeeRead, EmployeeUpdate
from app.models.employee import Employee

router = APIRouter()


# @router.post(
#     "",
#     response_model=EmployeeRead,
#     status_code=status.HTTP_201_CREATED,
#     summary="Create employee",
#     responses={
#         201: {"description": "Employee created successfully"},
#         409: {"description": "employee_id or email already exists"},
#         422: {"description": "Validation error (invalid or missing fields)"},
#     },
# )
# def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
#     """Create a new employee. Validates required fields, email format, and unique employee_id/email."""
#     return employee_crud.create(db, payload)


# @router.get(
#     "",
#     response_model=list[EmployeeRead],
#     summary="List employees",
# )
# def list_employees(
#     skip: int = Query(0, ge=0, description="Number of records to skip"),
#     limit: int = Query(100, ge=1, le=500, description="Max number of records to return"),
#     department: str | None = Query(None, description="Filter by department"),
#     db: Session = Depends(get_db),
# ):
#     """Return a list of employees with optional pagination and department filter."""
#     return employee_crud.get_many(db, skip=skip, limit=limit, department=department)

# @router.get(
#     "/by-employee-id/{employee_id}",
#     response_model=EmployeeRead,
#     summary="Get employee by employee ID",
# )
# def get_employee_by_employee_id(
#     employee_id: str,
#     db: Session = Depends(get_db),
# ):
#     """Return an employee using their business employee ID."""
#     employee = (
#         db.query(Employee)
#         .filter(Employee.employee_id == employee_id)
#         .first()
#     )

#     if not employee:
#         from app.utils.exceptions import NotFoundError
#         raise NotFoundError("Employee", employee_id)

#     return employee

# @router.get(
#     "/{id}",
#     response_model=EmployeeRead,
#     summary="Get employee by ID",
#     responses={404: {"description": "Employee not found"}},
# )
# def get_employee(id: int, db: Session = Depends(get_db)):
#     """Return a single employee by primary key id."""
#     obj = employee_crud.get_by_id(db, id)
#     if not obj:
#         from app.utils.exceptions import NotFoundError
#         raise NotFoundError("Employee", id)
#     return obj


# @router.patch(
#     "/{id}",
#     response_model=EmployeeRead,
#     summary="Update employee",
#     responses={404: {"description": "Employee not found"}},
# )
# def update_employee(id: int, payload: EmployeeUpdate, db: Session = Depends(get_db)):
#     """Partially update an employee."""
#     return employee_crud.update(db, id, payload)


# @router.delete(
#     "/{id}",
#     status_code=status.HTTP_204_NO_CONTENT,
#     summary="Delete employee",
#     responses={404: {"description": "Employee not found"}},
# )
# def delete_employee(id: int, db: Session = Depends(get_db)):
#     """Delete an employee by id. Returns 404 if not found."""
#     employee_crud.delete(db, id)




# Admin only: Create employee
@router.post(
    "",
    response_model=EmployeeRead,
    status_code=status.HTTP_201_CREATED,
)
def create_employee(
    payload: EmployeeCreate,
    db: Session = Depends(get_db),
    admin: CurrentUser = Depends(require_admin),
):
    return employee_crud.create(db, payload)


# Admin only: List all employees
@router.get("", response_model=list[EmployeeRead])
def list_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    department: str | None = Query(None),
    db: Session = Depends(get_db),
    admin: CurrentUser = Depends(require_admin),
):
    return employee_crud.get_many(
        db,
        skip=skip,
        limit=limit,
        department=department,
    )


# Admin or the matching Employee: Get profile by employee ID
@router.get(
    "/by-employee-id/{employee_id}",
    response_model=EmployeeRead,
)
def get_employee_by_employee_id(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    employee = (
        db.query(Employee)
        .filter(Employee.employee_id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if (
        current_user.role != "HR Admin"
        and current_user.employee_record_id != employee.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only access your own profile",
        )

    return employee


# Admin only: Get employee by database ID
@router.get("/{id}", response_model=EmployeeRead)
def get_employee(
    id: int,
    db: Session = Depends(get_db),
    admin: CurrentUser = Depends(require_admin),
):
    employee = employee_crud.get_by_id(db, id)

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    return employee


# Admin or the matching Employee: Update profile
@router.patch("/{id}", response_model=EmployeeRead)
def update_employee(
    id: int,
    payload: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    employee = employee_crud.get_by_id(db, id)

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if (
        current_user.role != "HR Admin"
        and current_user.employee_record_id != employee.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only update your own profile",
        )

    return employee_crud.update(db, id, payload)


# Admin or the matching Employee: Delete profile
@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_employee(
    id: int,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    employee = employee_crud.get_by_id(db, id)

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if (
        current_user.role != "HR Admin"
        and current_user.employee_record_id != employee.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own profile",
        )

    employee_crud.delete(db, id)
