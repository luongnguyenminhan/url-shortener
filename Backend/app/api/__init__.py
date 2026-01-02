"""API module initialization"""
from fastapi import FastAPI

from app.api.endpoints import auth


def register_routers(app: FastAPI) -> None:
    """
    Register all API routers with the FastAPI application.

    Args:
        app: FastAPI application instance
    """
    app.include_router(auth.router)
