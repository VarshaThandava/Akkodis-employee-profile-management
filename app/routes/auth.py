
"""Authentication and employee registration routes."""

import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password
from app.models.employee import Employee


router = APIRouter(
    prefix="/api/auth",
    tags=["authentication"]
)

# Temporary in-memory sessions for newly registered employees.
# Sessions are cleared when the backend restarts.
ACTIVE_SESSIONS = {}

SESSION_EXPIRE_MINUTES = 30


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    name: str
    role: str
    employee_id: str | None = None


class EmployeeRegisterRequest(BaseModel):
    employee_id: str = Field(min_length=2, max_length=64)
    full_name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    department: str = Field(min_length=2, max_length=128)
    current_role: str | None = Field(default=None, max_length=255)
    years_of_experience: float | None = Field(default=None, ge=0)
    location: str | None = Field(default=None, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class EmployeeRegisterResponse(BaseModel):
    message: str
    employee_id: str
    full_name: str
    email: EmailStr
    role: str


# Existing hardcoded demo credentials remain unchanged.
DEMO_USERS = {
    "admin@company.com": {
        "password": "Admin@123",
        "name": "HR Administrator",
        "role": "HR Admin",
        "token": "demo-admin-token"
    }
}


@router.post(
    "/register",
    response_model=EmployeeRegisterResponse,
    status_code=status.HTTP_201_CREATED
)
def register_employee(
    request: EmployeeRegisterRequest,
    db: Session = Depends(get_db)
):
    email = str(request.email).strip().lower()
    employee_id = request.employee_id.strip()

    if db.query(Employee).filter(
        Employee.employee_id == employee_id
    ).first():
        raise HTTPException(
            status_code=409,
            detail="Employee ID already exists"
        )

    if db.query(Employee).filter(
        Employee.email.ilike(email)
    ).first():
        raise HTTPException(
            status_code=409,
            detail="Email address is already registered"
        )

    employee = Employee(
        employee_id=employee_id,
        full_name=request.full_name.strip(),
        email=email,
        department=request.department.strip(),
        current_role=request.current_role,
        years_of_experience=request.years_of_experience,
        location=request.location,
        password_hash=hash_password(request.password)
    )

    try:
        db.add(employee)
        db.commit()
        db.refresh(employee)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to complete employee registration"
        )

    return EmployeeRegisterResponse(
        message="Employee registered successfully",
        employee_id=employee.employee_id,
        full_name=employee.full_name,
        email=employee.email,
        role="Employee"
    )


@router.post("/login", response_model=LoginResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    email = str(request.email).strip().lower()

    # 1. Existing hardcoded Admin and Employee login.
    demo_user = DEMO_USERS.get(email)

    if demo_user and request.password == demo_user["password"]:
        return LoginResponse(
            access_token=demo_user["token"],
            token_type="bearer",
            name=demo_user["name"],
            role=demo_user["role"],
            employee_id=demo_user.get("employee_id")
        )

    # 2. Newly registered employee login from SQLite.
    employee = db.query(Employee).filter(
        Employee.email.ilike(email)
    ).first()

    if (
        employee
        and employee.password_hash
        and verify_password(request.password, employee.password_hash)
    ):
        token = secrets.token_urlsafe(32)

        ACTIVE_SESSIONS[token] = {
            "employee_record_id": employee.id,
            "expires_at": datetime.now(timezone.utc)
            + timedelta(minutes=SESSION_EXPIRE_MINUTES)
        }

        return LoginResponse(
            access_token=token,
            token_type="bearer",
            name=employee.full_name,
            role="Employee",
            employee_id=employee.employee_id
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password"
    )
