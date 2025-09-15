from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy import text

from app.core.config import settings


engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, autoflush=False, class_=AsyncSession)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            # SQLAlchemy closes sessions on exit; explicit close not required
            pass


async def ping_db() -> bool:
    async with AsyncSessionLocal() as session:
        await session.execute(text("SELECT 1"))
    return True

