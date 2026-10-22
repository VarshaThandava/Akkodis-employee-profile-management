"""
Logging configuration for the application.
Configurable via LOG_LEVEL in settings.
"""
import logging
import sys

from app.core.config import get_settings


def setup_logging() -> None:
    """Configure root and app loggers. Call once at startup."""
    settings = get_settings()
    level = getattr(logging, settings.log_level.upper(), logging.INFO)

    format_string = (
        "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s"
    )
    date_fmt = "%Y-%m-%d %H:%M:%S"

    logging.basicConfig(
        level=level,
        format=format_string,
        datefmt=date_fmt,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )

    # Reduce noise from third-party loggers in production
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.DEBUG if settings.echo_sql else logging.WARNING
    )
