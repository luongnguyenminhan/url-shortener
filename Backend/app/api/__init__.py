"""API module initialization"""
from fastapi import FastAPI

from app.api.endpoints import auth, photo, photo_guest, project


def register_routers(app: FastAPI) -> None:
    """
    Register all API routers with the FastAPI application.

    Args:
        app: FastAPI application instance
    """
    app.include_router(auth.router)
    app.include_router(project.router)
    app.include_router(photo.router)
    app.include_router(photo_guest.router)

