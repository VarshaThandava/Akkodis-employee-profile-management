
"""Demo and session-based authentication and role authorization."""

from dataclasses import dataclass
from datetime import datetime, timezone
import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.employee import Employee
from app.routes.auth import DEMO_USERS, ACTIVE_SESSIONS

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

    # 1. Validate existing hardcoded demo tokens.
    demo_user = next(
        (
            user
            for user in DEMO_USERS.values()
            if secrets.compare_digest(token, user["token"])
        ),
        None,
    )

    if demo_user:
        employee_id = demo_user.get("employee_id")
        employee_record_id = None

        if demo_user["role"] == "Employee":
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
                email
                for email, user in DEMO_USERS.items()
                if user is demo_user
            ),
            name=demo_user["name"],
            role=demo_user["role"],
            employee_id=employee_id,
            employee_record_id=employee_record_id,
        )

    # 2. Validate newly registered employee session tokens.
    session = ACTIVE_SESSIONS.get(token)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )

    # Check session expiration.
    if datetime.now(timezone.utc) >= session["expires_at"]:
        ACTIVE_SESSIONS.pop(token, None)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
        )

    # Retrieve the employee associated with the session.
    employee = (
        db.query(Employee)
        .filter(Employee.id == session["employee_record_id"])
        .first()
    )

    if not employee:
        ACTIVE_SESSIONS.pop(token, None)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Employee record not found",
        )

    return CurrentUser(
        email=employee.email,
        name=employee.full_name,
        role="Employee",
        employee_id=employee.employee_id,
        employee_record_id=employee.id,
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