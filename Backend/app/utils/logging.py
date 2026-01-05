"""
Logging Utility for URL Shortener Backend using Loguru

This module provides simple, powerful logging using loguru.
Features include:

- Beautiful colorful console output by default
- Automatic log rotation and retention
- Minimal configuration needed
- FastAPI middleware integration
- Exception tracking and formatting

Usage:
    from app.utils.logging import logger, setup_logging

    # Setup logging (call once in main.py)
    setup_logging()

    # Use logger directly
    logger.info("Application started")
    logger.warning("Something might be wrong")
    logger.error("An error occurred")
    logger.debug("Detailed debug information")
    logger.success("Operation completed successfully")
"""

import sys
import time
from pathlib import Path

from loguru import logger as loguru_logger

# Export logger for easy import
logger = loguru_logger


def setup_logging(level: str = "INFO", log_dir: str = "logs") -> None:
    """
    Setup logging configuration using loguru.

    Args:
        level: Log level ("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL")
        log_dir: Directory to store log files

    Example:
        setup_logging("DEBUG")  # Enable debug logging
    """
    # Remove default handler
    loguru_logger.remove()

    # Add console handler with colors
    loguru_logger.add(
        sys.stderr,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=level,
        colorize=True,
    )

    # Create logs directory if it doesn't exist
    log_path = Path(log_dir)
    log_path.mkdir(exist_ok=True)

    # Add file handler with rotation
    loguru_logger.add(
        log_path / "app_{time:YYYY-MM-DD}.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level=level,
        rotation="00:00",  # Rotate daily at midnight
        retention="7 days",  # Keep logs for 7 days
        compression="zip",  # Compress rotated logs
    )

    # Add error log file
    loguru_logger.add(
        log_path / "error_{time:YYYY-MM-DD}.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="ERROR",
        rotation="00:00",
        retention="30 days",
        compression="zip",
    )


# FastAPI middleware for request/response logging
class FastAPILoggingMiddleware:
    """
    FastAPI middleware that logs HTTP requests and responses with timing.

    Logs request method, path, response status, and duration.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        # Extract request info
        method = scope["method"]
        path = scope["path"]
        query = scope.get("query_string", b"").decode("utf-8")
        if query:
            path = f"{path}?{query}"

        logger.info(f"→ {method} {path}")

        # Track timing
        start_time = time.time()
        original_send = send
        response_status = None
        response_length = 0

        async def logging_send(message):
            nonlocal response_status, response_length

            if message["type"] == "http.response.start":
                response_status = message["status"]
            elif message["type"] == "http.response.body":
                response_length += len(message.get("body", b""))

            await original_send(message)

        try:
            await self.app(scope, receive, logging_send)
            duration = time.time() - start_time

            if response_status and response_status < 400:
                logger.success(f"← {method} {path} | {response_status} | {duration:.3f}s | {response_length} bytes")
            else:
                logger.warning(f"← {method} {path} | {response_status} | {duration:.3f}s | {response_length} bytes")
        except Exception as e:
            logger.error(f"Error processing request {method} {path}: {e}")
            duration = time.time() - start_time
            logger.error(f"← {method} {path} | ERROR | {duration:.3f}s", exc_info=True)
            raise
