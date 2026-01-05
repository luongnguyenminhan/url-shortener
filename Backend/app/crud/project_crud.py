"""CRUD operations for Project model"""
from typing import Optional, List
from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models.project import Project, ProjectStatus
from app.schemas.common import PaginationSortSearchSchema
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.utils import common_utils


def create(db: Session, project: ProjectCreate, owner_id: UUID) -> Project:
    """Create a new project"""
    # Calculate expired_date from expired_days if provided
    expired_date = None
    if project.expired_days:
        expired_date = common_utils.get_utc_now() + timedelta(days=project.expired_days)
    
    db_project = Project(
        owner_id=owner_id,
        title=project.title,
        status=project.status or ProjectStatus.DRAFT.value,
        expired_date=expired_date,
    )
    db.add(db_project)
    return db_project


def get_by_id(db: Session, project_id: UUID) -> Optional[Project]:
    """Get project by ID"""
    return db.query(Project).filter(Project.id == project_id).options(joinedload(Project.photos), joinedload(Project.owner)).first()

def get_by_title_and_owner(
    db: Session,
    title: str,
    owner_id: UUID,
) -> Optional[Project]:
    """Get project by title and owner ID"""
    return db.query(Project).filter(
        (Project.title == title) & (Project.owner_id == owner_id)
    ).first()


def get_by_owner(
    db: Session,
    owner_id: UUID,
    pagination_params: PaginationSortSearchSchema,
    status: Optional[str] = None,
) -> List[Project]:
    """Get all projects by owner with optional filtering"""
    query = db.query(Project).filter(Project.owner_id == owner_id).options(joinedload(Project.photos), joinedload(Project.owner))

    if status:
        query = query.filter(Project.status == status)

    return query.offset(pagination_params.skip).limit(pagination_params.limit).all()


def get_all(
    db: Session,
    pagingation_params: PaginationSortSearchSchema,
    status: Optional[str] = None,
) -> List[Project]:
    """Get all projects with optional filtering by status"""
    query = db.query(Project).options(joinedload(Project.photos), joinedload(Project.owner))

    if status:
        query = query.filter(Project.status == status)

    return query.offset(pagingation_params.skip).limit(pagingation_params.limit).all()


def update(
    db: Session,
    project_id: UUID,
    project_update: ProjectUpdate,
) -> Optional[Project]:
    """Update project"""
    db_project = db.query(Project).filter(Project.id == project_id).options(joinedload(Project.owner)).first()
    if not db_project:
        return None

    update_data = project_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)

    db.add(db_project)
    return db_project


def update_status(
    db: Session,
    project_id: UUID,
    status: ProjectStatus,
) -> Optional[Project]:
    """Update project status"""
    db_project = db.query(Project).filter(Project.id == project_id).options(joinedload(Project.owner)).first()
    if not db_project:
        return None
    db_project.status = status
    db.add(db_project)
    return db_project


def delete(db: Session, project_id: UUID) -> bool:
    """Delete project"""
    db_project = db.get(Project, project_id)
    if not db_project:
        return False

    db.delete(db_project)
    return True


def count_by_owner(db: Session, owner_id: UUID, status: Optional[str] = None) -> int:
    """Count projects by owner with optional status filter"""
    query = db.query(Project).filter(Project.owner_id == owner_id)
    
    if status:
        query = query.filter(Project.status == status)
    
    return query.count()


def count_all(db: Session, status: Optional[str] = None) -> int:
    """Count all projects with optional status filter"""
    query = db.query(Project)
    
    if status:
        query = query.filter(Project.status == status)
    
    return query.count()


def get_expired_projects(db: Session) -> List[Project]:
    """Get projects that should be deleted (expired_date passed)"""
    now = datetime.utcnow()
    return db.query(Project).filter(
        (Project.expired_date.isnot(None)) & (Project.expired_date < now)
    ).options(joinedload(Project.owner)).all()


def soft_delete(db: Session, project_id: UUID) -> Optional[Project]:
    """Soft delete by setting status to completed"""
    db_project = db.query(Project).filter(Project.id == project_id).options(joinedload(Project.owner)).first()
    if not db_project:
        return None

    db_project.is_deleted = True
    db.add(db_project)
    return db_project
