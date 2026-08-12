"""
Database engine and session management.

`get_db` is a FastAPI dependency yielding a request-scoped SQLAlchemy
session, closed automatically after the request completes.
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

# pool_pre_ping avoids serving requests on a dead connection after DB
# restarts/idle timeouts — relevant for a service expected to run long-term.
engine = create_engine(
    settings.database_url or "sqlite:///./dev_placeholder.db",
    pool_pre_ping=True,
    future=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
