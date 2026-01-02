"""
Comprehensive Logging Utility for URL Shortener Backend

This module provides colorful, easy-to-read logging utilities designed for development
and debugging of the photo proofing platform. Features include:

- Colorful console output for better readability
- Configurable log levels
- FastAPI middleware integration
- Reusable logger factory
- Clean, structured output

Usage:
    from app.utils.logging import get_logger, setup_logging

    # Setup global logging
    setup_logging()

    # Get logger for your module
    logger = get_logger(__name__)

    # Log messages
    logger.info("Application started")
    logger.warning("Something might be wrong")
    logger.error("An error occurred")
    logger.debug("Detailed debug information")
"""

import logging
import sys
from typing import Optional

try:
    import colorama
    colorama.init()
    HAS_COLORAMA = True
except ImportError:
    HAS_COLORAMA = False


class ColorFormatter(logging.Formatter):
    """
    Custom formatter that adds ANSI color codes to log messages for better readability.

    Color scheme:
    - DEBUG: Blue
    - INFO: Green
    - WARNING: Yellow
    - ERROR: Red
    - CRITICAL: Red + Bold
    """

    # ANSI color codes
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[31;1m', # Red + Bold
    }
    RESET = '\033[0m'  # Reset to default

    def format(self, record: logging.LogRecord) -> str:
        """
        Format the log record with colors and clean structure.

        Args:
            record: The log record to format

        Returns:
            Formatted log message with colors
        """
        # Get the color for this log level
        color = self.COLORS.get(record.levelname, self.RESET)

        # Format timestamp
        timestamp = self.formatTime(record, "%Y-%m-%d %H:%M:%S")

        # Create the formatted message
        formatted_message = (
            f"{color}[{timestamp}] {record.levelname:<8} {record.name:<20} | {record.getMessage()}{self.RESET}"
        )

        # Add exception info if present
        if record.exc_info:
            formatted_message += f"\n{self.formatException(record.exc_info)}"

        return formatted_message


class LoggerFactory:
    """
    Factory class for creating configured loggers with colorful output.

    Provides a centralized way to create loggers with consistent configuration
    across the application.
    """

    @staticmethod
    def create_logger(
        name: str,
        level: int = logging.INFO,
        handler: Optional[logging.Handler] = None
    ) -> logging.Logger:
        """
        Create a configured logger with colorful console output.

        Args:
            name: Logger name (usually __name__)
            level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            handler: Optional custom handler (defaults to colored console handler)

        Returns:
            Configured logger instance
        """
        # Get or create logger
        logger = logging.getLogger(name)

        # Don't configure if already configured
        if logger.handlers:
            return logger

        # Set level
        logger.setLevel(level)

        # Create handler if not provided
        if handler is None:
            handler = logging.StreamHandler(sys.stdout)
            handler.setFormatter(ColorFormatter())

        # Add handler
        logger.addHandler(handler)

        # Prevent duplicate messages from parent loggers
        logger.propagate = False

        return logger


def get_logger(name: str, level: Optional[str] = None) -> logging.Logger:
    """
    Convenience function to get a configured logger.

    Args:
        name: Logger name (usually __name__)
        level: Optional log level override as string ("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL")
               If None, uses the global logging level from setup_logging()

    Returns:
        Configured logger instance

    Example:
        logger = get_logger(__name__)
        logger.info("This is an info message")

        # Override level for specific logger
        debug_logger = get_logger("debug.module", "DEBUG")
    """
    # If no level specified, use the root logger level
    if level is None:
        log_level = logging.getLogger().level
    else:
        # Convert string level to logging constant
        level_map = {
            'DEBUG': logging.DEBUG,
            'INFO': logging.INFO,
            'WARNING': logging.WARNING,
            'ERROR': logging.ERROR,
            'CRITICAL': logging.CRITICAL,
        }
        log_level = level_map.get(level.upper(), logging.INFO)

    return LoggerFactory.create_logger(name, log_level)


def setup_logging(level: str = "INFO") -> None:
    """
    Setup global logging configuration for the entire application.

    This configures the root logger with colorful console output.

    Args:
        level: Global log level ("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL")

    Example:
        setup_logging("DEBUG")  # Enable debug logging globally
    """
    # Convert string level to logging constant
    level_map = {
        'DEBUG': logging.DEBUG,
        'INFO': logging.INFO,
        'WARNING': logging.WARNING,
        'ERROR': logging.ERROR,
        'CRITICAL': logging.CRITICAL,
    }

    log_level = level_map.get(level.upper(), logging.INFO)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Remove existing handlers to avoid duplicates
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Add colored console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(ColorFormatter())
    root_logger.addHandler(console_handler)


# FastAPI middleware for request/response logging
class FastAPILoggingMiddleware:
    """
    FastAPI middleware that logs HTTP requests and responses.

    Logs request start, completion, and timing information.
    Useful for monitoring API performance and debugging.
    """

    def __init__(self, app, logger_name: str = "fastapi.middleware"):
        self.app = app
        self.logger = get_logger(logger_name)

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

        # Log request start
        self.logger.info(f"→ {method} {path}")

        # Create response wrapper to capture status and timing
        import time
        start_time = time.time()

        # Store original send function
        original_send = send

        # Response data
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

            # Calculate duration
            duration = time.time() - start_time

            # Log response
            status_color = (
                "\033[32m" if response_status and response_status < 400 else  # Green for success
                "\033[33m" if response_status and response_status < 500 else  # Yellow for client errors
                "\033[31m"  # Red for server errors
            )
            reset_color = "\033[0m"

            self.logger.info(
                f"← {method} {path} | "
                f"{status_color}{response_status}{reset_color} | "
                f"{duration:.3f}s | {response_length} bytes"
            )

        except Exception as e:
            # Log error
            duration = time.time() - start_time
            self.logger.error(
                f"← {method} {path} | ERROR | {duration:.3f}s | {str(e)}"
            )
            raise


# Initialize colorama if available
if HAS_COLORAMA:
    colorama.init(autoreset=True)
