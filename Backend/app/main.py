from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.routing import APIRoute

from app.core.vault_loader import load_config
from app.api import register_routers
from app.core.config import settings
from app.core.firebase import initialize_firebase
from app.db import create_tables
from app.exception_handlers.http_exception import custom_exception_handler, custom_http_exception_handler
from app.utils.logging import setup_logging, FastAPILoggingMiddleware, logger

# Load configuration from .env or Vault
load_config()

def custom_generate_unique_id(route: APIRoute) -> str:
    """
    Custom function to generate unique operation IDs for OpenAPI schema.
    This creates cleaner method names for generated client code.
    """
    if route.tags:
        # Use first tag + operation name for better organization
        return f"{route.tags[0]}_{route.name}"
    return route.name


def custom_openapi():
    """
    Custom OpenAPI schema generator with additional metadata and extensions.
    """
    if app.openapi_schema:
        return app.openapi_schema

    # Generate base OpenAPI schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    # Add custom extensions
    openapi_schema["info"]["x-logo"] = {
        "url": "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png",
        "altText": "SecureScribe API Logo",
    }

    # Add custom servers for different environments
    openapi_schema["servers"] = [
        {"url": "http://localhost:8081/be", "description": "Development server"},
        {"url": "https://photo.wc504.io.vn/be", "description": "Production server"},
    ]

    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT Authorization header using the Bearer scheme.",
        }
    }

    # Apply security globally
    openapi_schema["security"] = [{"BearerAuth": []}]

    # Cache the schema
    app.openapi_schema = openapi_schema
    return openapi_schema


app = FastAPI(
    title="URLShortener",
    version="1.0.0",
    root_path="/be",
    generate_unique_id_function=custom_generate_unique_id,
)

# Set custom OpenAPI schema
app.openapi = custom_openapi

# Add CORS middleware
APP_CORS_ORIGINS = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=APP_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add colorful logging middleware
app.add_middleware(FastAPILoggingMiddleware)

# Error handler
app.add_exception_handler(HTTPException, custom_http_exception_handler)
app.add_exception_handler(Exception, custom_exception_handler)


@app.on_event("startup")
def startup_event():
    """Initialize database tables, logging, and services on application startup"""
    # Setup colorful logging
    setup_logging(settings.LOG_LEVEL)

    # Initialize Firebase
    try:
        initialize_firebase()
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}", exc_info=True)
        raise

    # Initialize database tables
    create_tables()

    # Register API routers
    register_routers(app)
    logger.info("Application startup completed")
