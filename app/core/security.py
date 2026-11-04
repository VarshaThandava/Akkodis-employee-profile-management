
"""Password hashing and JWT authentication utilities."""

import os
from datetime import datetime, timedelta, timezone


import jwt
from dotenv import load_dotenv
from pwdlib import PasswordHash

load_dotenv()


password_hash = PasswordHash.recommended()

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def get_secret_key() -> str:
    """Get JWT secret key from environment variables."""
    secret_key = os.getenv("JWT_SECRET_KEY")

    if not secret_key:
        raise RuntimeError(
            "JWT_SECRET_KEY is missing from environment variables."
        )

    return secret_key


def hash_password(password: str) -> str:
    """Hash a plain-text password."""
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """Verify a password against its stored hash."""
    return password_hash.verify(plain_password, hashed_password)


def create_access_token(
    *,
    email: str,
    role: str,
    user_id: int,
    employee_record_id: int | None = None,
) -> str:
    """Generate a signed JWT access token."""

    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": email,
        "user_id": user_id,
        "role": role,
        "employee_record_id": employee_record_id,
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        get_secret_key(),
        algorithm=JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> dict:
    """Validate and decode a JWT access token."""

    return jwt.decode(
        token,
        get_secret_key(),
        algorithms=[JWT_ALGORITHM],
    )
