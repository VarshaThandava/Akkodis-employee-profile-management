"""Health check endpoint."""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health", status_code=200)
def health_check() -> dict[str, str]:
    """Liveness/readiness check."""
    return {"status": "ok"}
