"""Demo authentication and role-based authorization dependencies."""

from dataclasses import dataclass
import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.employee import Employee
from app.routes.auth import DEMO_USERS

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass
class CurrentUser:
    email: str
    name: str
    role: str
    employee_id: str | None = None
    employee_record_id: int | None = None


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> CurrentUser:

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    token = credentials.credentials

    # Validate the temporary demo token.
    user_data = next(
        (
            user
            for user in DEMO_USERS.values()
            if secrets.compare_digest(token, user["token"])
        ),
        None,
    )

    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    employee_id = user_data.get("employee_id")
    employee_record_id = None

    # Link Employee login to the existing employee database record.
    if user_data["role"] == "Employee":
        employee = (
            db.query(Employee)
            .filter(Employee.employee_id == employee_id)
            .first()
        )

        if not employee:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Employee record not found",
            )

        employee_record_id = employee.id

    return CurrentUser(
        email=next(
            email for email, user in DEMO_USERS.items()
            if user is user_data
        ),
        name=user_data["name"],
        role=user_data["role"],
        employee_id=employee_id,
        employee_record_id=employee_record_id,
    )


def require_admin(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:

    if current_user.role != "HR Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user


def require_employee(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:

    if current_user.role != "Employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employee access required",
        )

    return current_user