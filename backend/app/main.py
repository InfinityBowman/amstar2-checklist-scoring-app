from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from scalar_fastapi import get_scalar_api_reference

from app.core.config import settings
from app.db.session import get_session
from app.api.v1 import api_router
from app.utils.seed import seed_database

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI app.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Application startup: checking if database needs seeding")
    try:
        # First try the improved seed function that processes init.sql
        await seed_database()
        
        # As a fallback, also try to seed just the demo users
        # This ensures we at least have login credentials even if other seed data fails
        from app.utils.seed import seed_demo_users
        await seed_demo_users()
    except Exception as e:
        logger.error(f"Failed to seed database: {e}")
    
    yield
    
    # Shutdown
    logger.info("Application shutdown")


app = FastAPI(
    title="CoRATES API", 
    version="0.1.0",
    lifespan=lifespan,
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler for consistent error responses
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Handle validation errors consistently
@app.exception_handler(422)
async def validation_exception_handler(request: Request, exc):
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation error", "errors": exc.detail if hasattr(exc, 'detail') else str(exc)}
    )

# Handle general exceptions
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/healthz/db")
async def healthz_db(session: AsyncSession = Depends(get_session)):
    await session.execute(text("SELECT 1"))
    return {"db": "ok"}


@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title,
    )

# Include API routers
app.include_router(api_router, prefix=settings.API_PREFIX)