"""Standard error response schemas."""
from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    code: str = Field(..., description="Error code")
    message: str = Field(..., description="Human-readable message")
    detail: str | None = Field(None, description="Additional detail")


class ErrorResponse(BaseModel):
    error: ErrorDetail = Field(..., description="Error payload")
