"""
HRMS Lite - FastAPI application entry point.
Production-ready: CORS, logging, graceful errors, .env support.
"""

import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError, OperationalError

from app.core.config import get_settings
from app.core.database import Base, engine
from app.core.logging_config import setup_logging
from app.models import Employee, Attendance
from app.routes import api_router, health, auth
from app.utils.exceptions import (
    AppException,
    app_exception_handler,
    global_exception_handler,
    integrity_error_handler,
    validation_exception_handler,
)


load_dotenv()
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()

    logger.info(
        "Application starting (environment=%s)",
        settings.environment,
    )

    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables ready")

    except OperationalError as e:
        logger.warning(
            "Database unreachable at startup "
            "(tables not created): %s. "
            "Check DATABASE_URL, network, and firewall. "
            "Use SQLite for local dev if Supabase times out.",
            e,
        )

    logger.info("Application startup complete")

    yield

    logger.info("Application shutting down")


app = FastAPI(
    title="HRMS Lite API",
    description="Lightweight HRMS backend - Employees and Attendance",
    version="1.0.0",
    lifespan=lifespan,
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
app.add_exception_handler(
    AppException,
    app_exception_handler,
)

app.add_exception_handler(
    IntegrityError,
    integrity_error_handler,
)

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler,
)

app.add_exception_handler(
    Exception,
    global_exception_handler,
)


# Application routes
app.include_router(
    health.router,
    tags=["health"],
)

app.include_router(auth.router)

app.include_router(api_router)