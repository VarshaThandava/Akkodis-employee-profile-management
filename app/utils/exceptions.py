"""Centralized exception classes and handlers."""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError

from app.utils.error_schemas import ErrorDetail, ErrorResponse


class AppException(Exception):
    """Base application exception."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail: str | None = None,
    ):
        self.message = message
        self.status_code = status_code
        self.detail = detail or message
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, resource: str, identifier: str | int):
        super().__init__(
            message=f"{resource} not found",
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with id '{identifier}' not found",
        )


class ConflictError(AppException):
    def __init__(self, message: str, detail: str | None = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            detail=detail or message,
        )


def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Return 422 with a structured error body for invalid request data."""
    errors = exc.errors()
    details = [f"{e.get('loc', ())}: {e.get('msg', 'invalid')}" for e in errors]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error=ErrorDetail(
                code="VALIDATION_ERROR",
                message="Invalid request body or query parameters",
                detail="; ".join(details),
            )
        ).model_dump(),
    )


def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    """Map DB integrity errors (unique, fk) to 409/400."""
    err_msg = str(getattr(exc, "orig", exc))
    detail = "Resource already exists or invalid reference."
    if "unique" in err_msg.lower() or "duplicate" in err_msg.lower():
        detail = "A record with this value already exists."
    elif "foreign key" in err_msg.lower() or "violates foreign key" in err_msg.lower():
        detail = "Referenced resource does not exist."
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content=ErrorResponse(
            error=ErrorDetail(
                code="CONFLICT",
                message="Database constraint violation",
                detail=detail,
            )
        ).model_dump(),
    )


def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle our custom AppException."""
    code = "ERROR"
    if exc.status_code == status.HTTP_404_NOT_FOUND:
        code = "NOT_FOUND"
    elif exc.status_code == status.HTTP_409_CONFLICT:
        code = "CONFLICT"
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=ErrorDetail(
                code=code,
                message=exc.message,
                detail=exc.detail,
            )
        ).model_dump(),
    )


def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions. Returns 500 with a safe message (no stack trace)."""
    import logging
    logger = logging.getLogger(__name__)
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error=ErrorDetail(
                code="INTERNAL_ERROR",
                message="An unexpected error occurred.",
                detail="Please try again later or contact support.",
            )
        ).model_dump(),
    )
