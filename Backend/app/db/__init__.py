from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# Import all models to ensure they are registered
from app.models import (  # noqa: F401
    BaseModel,
    ClientSession,
    Photo,
    PhotoComment,
    PhotoVersion,
    Project,
    User,
)

engine = create_engine(
    str(settings.SQLALCHEMY_DATABASE_URI),
    pool_pre_ping=True,
    echo=False,  # Set to True for SQL debugging
)


def get_db():
    """Database session dependency for FastAPI"""
    with Session(engine) as session:
        yield session


def create_tables():
    """Create all tables defined in models"""
    SQLModel.metadata.create_all(engine)
