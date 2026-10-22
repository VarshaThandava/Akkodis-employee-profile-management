"""API route modules."""
from fastapi import APIRouter

from app.routes import employees, attendances

api_router = APIRouter(prefix="/api")

api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
api_router.include_router(attendances.router, prefix="/attendance", tags=["attendance"])
