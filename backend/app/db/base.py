from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import all models here so they are registered with SQLAlchemy
from app.models import *  # noqa

