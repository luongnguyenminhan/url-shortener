from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.routing import APIRoute

from app.db import create_tables

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
        {"url": "https://securescribe.wc504.io.vn/be", "description": "Production server"},
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


@app.on_event("startup")
def startup_event():
    """Initialize database tables on application startup"""
    create_tables()
