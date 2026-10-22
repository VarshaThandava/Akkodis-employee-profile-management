"""Employee CRUD."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate
from app.utils.exceptions import ConflictError, NotFoundError


def get_by_id(db: Session, employee_id: int) -> Employee | None:
    return db.get(Employee, employee_id)


def get_by_employee_id(db: Session, employee_id: str) -> Employee | None:
    return db.execute(select(Employee).where(Employee.employee_id == employee_id)).scalar_one_or_none()


def get_by_email(db: Session, email: str) -> Employee | None:
    return db.execute(select(Employee).where(Employee.email == email)).scalar_one_or_none()


def get_many(
    db: Session,
    *,
    skip: int = 0,
    limit: int = 100,
    department: str | None = None,
) -> list[Employee]:
    q = select(Employee).order_by(Employee.id)
    if department:
        q = q.where(Employee.department == department)
    q = q.offset(skip).limit(limit)
    return list(db.execute(q).scalars().all())


def create(db: Session, payload: EmployeeCreate) -> Employee:
    existing = get_by_employee_id(db, payload.employee_id)
    if existing:
        raise ConflictError(
            "An employee with this employee_id already exists.",
            detail=f"employee_id '{payload.employee_id}' is already in use.",
        )
    existing = get_by_email(db, payload.email)
    if existing:
        raise ConflictError(
            "An employee with this email already exists.",
            detail=f"email '{payload.email}' is already in use.",
        )
    obj = Employee(
        employee_id=payload.employee_id,
        full_name=payload.full_name,
        email=payload.email,
        department=payload.department,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update(db: Session, employee_id: int, payload: EmployeeUpdate) -> Employee:
    obj = get_by_id(db, employee_id)
    if not obj:
        raise NotFoundError("Employee", employee_id)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, employee_id: int) -> None:
    obj = get_by_id(db, employee_id)
    if not obj:
        raise NotFoundError("Employee", employee_id)
    db.delete(obj)
    db.commit()


class EmployeeCRUD:
    get_by_id = staticmethod(get_by_id)
    get_by_employee_id = staticmethod(get_by_employee_id)
    get_by_email = staticmethod(get_by_email)
    get_many = staticmethod(get_many)
    create = staticmethod(create)
    update = staticmethod(update)
    delete = staticmethod(delete)


employee_crud = EmployeeCRUD()
