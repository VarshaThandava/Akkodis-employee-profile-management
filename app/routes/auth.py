from fastapi import APIRouter, HTTPException
from pydantic import BaseModel,EmailStr


router = APIRouter(
    prefix="/api/auth",
    tags=["authentication"]
)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    name: str
    role: str
    employee_id: str | None = None


# Temporary demo credentials
DEMO_USERS = {
    "admin@company.com": {
        "password": "Admin@123",
        "name": "HR Administrator",
        "role": "HR Admin",
        "token": "demo-admin-token"
    },
     "milan_mohanty@akkodis.com": {
        "password": "Employee@123",
        "name": "Milan Mohanty",
        "role": "Employee",
        "token": "demo-employee-token",
        "employee_id": "AK1011"
    }
}

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):

    email = str(request.email).strip().lower()

    user = DEMO_USERS.get(email)

    if user and request.password == user["password"]:
        return LoginResponse(
            access_token=user["token"],
            token_type="bearer",
            name=user["name"],
            role=user["role"],
            employee_id=user.get("employee_id")
        )

    raise HTTPException(
        status_code=401,
        detail="Invalid email or password"
    )