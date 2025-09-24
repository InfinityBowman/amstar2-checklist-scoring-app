from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.config import settings
from app.db.session import get_session
from app.api.v1 import api_router


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


# Include API routers
app.include_router(api_router, prefix=settings.API_PREFIX)

