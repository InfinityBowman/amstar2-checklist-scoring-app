from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.config import settings
from app.db.session import get_session


app = FastAPI(title="AMSTAR2 API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/healthz/db")
async def healthz_db(session: AsyncSession = Depends(get_session)):
    await session.execute(text("SELECT 1"))
    return {"db": "ok"}


# In the next steps, include routers under settings.API_PREFIX, e.g.:
# from app.routers import projects, checklists
# app.include_router(projects.router, prefix=settings.API_PREFIX)
# app.include_router(checklists.router, prefix=settings.API_PREFIX)

