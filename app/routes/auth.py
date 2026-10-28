from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter(
    prefix="/api/auth",
    tags=["authentication"]
)


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    name: str
    role: str


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):

    if (
        request.email == "admin@company.com"
        and request.password == "Admin@123"
    ):
        return LoginResponse(
            access_token="demo-login-token",
            token_type="bearer",
            name="HR Administrator",
            role="HR Admin"
        )

    raise HTTPException(
        status_code=401,
        detail="Invalid email or password"
    )