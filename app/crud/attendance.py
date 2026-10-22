"""Attendance CRUD."""
from datetime import date

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.attendance import Attendance, AttendanceStatus
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate
from app.utils.exceptions import ConflictError, NotFoundError


def get_by_id(db: Session, attendance_id: int) -> Attendance | None:
    return db.get(Attendance, attendance_id)


def get_by_employee_and_date(db: Session, employee_id: int, d: date) -> Attendance | None:
    return db.execute(
        select(Attendance).where(
            Attendance.employee_id == employee_id,
            Attendance.date == d,
        )
    ).scalar_one_or_none()


def get_many(
    db: Session,
    *,
    skip: int = 0,
    limit: int = 100,
    employee_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
) -> list[Attendance]:
    q = select(Attendance).order_by(Attendance.date.desc(), Attendance.id)
    if employee_id is not None:
        q = q.where(Attendance.employee_id == employee_id)
    if from_date is not None:
        q = q.where(Attendance.date >= from_date)
    if to_date is not None:
        q = q.where(Attendance.date <= to_date)
    q = q.offset(skip).limit(limit)
    return list(db.execute(q).scalars().all())


def get_by_employee_with_stats(
    db: Session,
    employee_id: int,
    *,
    from_date: date | None = None,
    to_date: date | None = None,
    skip: int = 0,
    limit: int = 500,
) -> tuple[list[Attendance], int]:
    """Return (attendances for employee, date desc; total_present_days in filtered set)."""
    q = select(Attendance).where(Attendance.employee_id == employee_id)
    if from_date is not None:
        q = q.where(Attendance.date >= from_date)
    if to_date is not None:
        q = q.where(Attendance.date <= to_date)
    q_ordered = q.order_by(Attendance.date.desc(), Attendance.id).offset(skip).limit(limit)
    records = list(db.execute(q_ordered).scalars().all())

    count_q = select(func.count()).select_from(Attendance).where(
        Attendance.employee_id == employee_id,
        Attendance.status == AttendanceStatus.PRESENT,
    )
    if from_date is not None:
        count_q = count_q.where(Attendance.date >= from_date)
    if to_date is not None:
        count_q = count_q.where(Attendance.date <= to_date)
    total_present_days = db.execute(count_q).scalar() or 0
    return records, total_present_days


def create(db: Session, payload: AttendanceCreate) -> Attendance:
    from app.crud.employee import employee_crud
    if employee_crud.get_by_id(db, payload.employee_id) is None:
        raise NotFoundError("Employee", payload.employee_id)
    existing = get_by_employee_and_date(db, payload.employee_id, payload.date)
    if existing:
        raise ConflictError(
            "Attendance already recorded for this employee on this date",
            detail=f"Employee {payload.employee_id} already has attendance for {payload.date}",
        )
    obj = Attendance(
        employee_id=payload.employee_id,
        date=payload.date,
        status=payload.status,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update(db: Session, attendance_id: int, payload: AttendanceUpdate) -> Attendance:
    obj = get_by_id(db, attendance_id)
    if not obj:
        raise NotFoundError("Attendance", attendance_id)
    if payload.status is not None:
        obj.status = payload.status
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, attendance_id: int) -> None:
    obj = get_by_id(db, attendance_id)
    if not obj:
        raise NotFoundError("Attendance", attendance_id)
    db.delete(obj)
    db.commit()


class AttendanceCRUD:
    get_by_id = staticmethod(get_by_id)
    get_by_employee_and_date = staticmethod(get_by_employee_and_date)
    get_many = staticmethod(get_many)
    get_by_employee_with_stats = staticmethod(get_by_employee_with_stats)
    create = staticmethod(create)
    update = staticmethod(update)
    delete = staticmethod(delete)


attendance_crud = AttendanceCRUD()
