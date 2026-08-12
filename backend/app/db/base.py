"""
SQLAlchemy declarative base.

All ORM models (User, Incident, etc., added in later increments) inherit
from `Base`. Alembic's env.py imports `Base.metadata` for autogeneration,
so every new model module must be imported somewhere reachable from here
(see migrations/env.py) before `alembic revision --autogenerate` is run.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
