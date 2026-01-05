"""Database session management and transaction utilities"""

from contextlib import contextmanager
from threading import local
from typing import Any, Generator, Optional

from sqlmodel import Session

from app.db import engine

# Thread-local storage for session tracking
_thread_local = local()


class DatabaseManager:
    """Database manager for handling sessions and transactions"""

    @staticmethod
    def get_session() -> Session:
        """Get a new database session"""
        return Session(engine)

    @staticmethod
    def get_or_create_session() -> tuple[Session, bool]:
        """
        Get existing active session or create a new one

        Returns:
            tuple: (session, is_new) - session object and boolean indicating if it's newly created

        Usage:
            db, is_new = DatabaseManager.get_or_create_session()
            try:
                # do something
                if is_new:
                    DatabaseManager.commit(db)
            finally:
                if is_new:
                    DatabaseManager.close(db)
        """
        active_session = getattr(_thread_local, "session", None)
        if active_session and active_session.is_active:
            return active_session, False

        new_session = DatabaseManager.get_session()
        _thread_local.session = new_session
        return new_session, True

    @staticmethod
    def set_session(db: Session) -> None:
        """Set the current thread session"""
        _thread_local.session = db

    @staticmethod
    def get_current_session() -> Optional[Session]:
        """Get current thread session if it exists"""
        return getattr(_thread_local, "session", None)

    @staticmethod
    def has_active_session() -> bool:
        """Check if there's an active session in current thread"""
        session = getattr(_thread_local, "session", None)
        return session is not None and session.is_active

    @staticmethod
    def clear_session() -> None:
        """Clear current thread session"""
        _thread_local.session = None

    @staticmethod
    def commit(db: Session) -> None:
        """Commit transaction"""
        db.commit()

    @staticmethod
    def rollback(db: Session) -> None:
        """Rollback transaction"""
        db.rollback()

    @staticmethod
    def close(db: Session) -> None:
        """Close database session"""
        db.close()

    @staticmethod
    @contextmanager
    def transaction(db: Session) -> Generator[Session, None, None]:
        """
        Context manager for database transaction

        Usage:
            with DatabaseManager.transaction(db) as transaction_db:
                # do something
                # auto commit on success, rollback on error
        """
        try:
            yield db
            db.commit()
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

    @staticmethod
    @contextmanager
    def session() -> Generator[Session, None, None]:
        """
        Context manager for getting and managing a session
        Reuses existing session if available, otherwise creates new one

        Usage:
            with DatabaseManager.session() as db:
                # do something
                # auto commit on success, rollback on error
        """
        db, is_new = DatabaseManager.get_or_create_session()
        try:
            yield db
            if is_new:
                db.commit()
        except Exception as e:
            if is_new:
                db.rollback()
            raise e
        finally:
            if is_new:
                db.close()
                DatabaseManager.clear_session()

    @staticmethod
    def flush(db: Session) -> None:
        """Flush pending changes to the database without committing"""
        db.flush()

    @staticmethod
    def refresh(db: Session, obj: Any) -> None:
        """Refresh an object from the database"""
        db.refresh(obj)

    @staticmethod
    def expunge(db: Session, obj: Any) -> None:
        """Remove an object from session"""
        db.expunge(obj)

    @staticmethod
    def expunge_all(db: Session) -> None:
        """Remove all objects from session"""
        db.expunge_all()

    @staticmethod
    def is_active(db: Session) -> bool:
        """Check if session is active"""
        return db.is_active

    @staticmethod
    def begin_nested(db: Session) -> Any:
        """
        Begin a nested transaction (savepoint)

        Usage:
            savepoint = DatabaseManager.begin_nested(db)
            try:
                # do something
                db.commit()
            except Exception:
                db.rollback(savepoint)
        """
        return db.begin_nested()
