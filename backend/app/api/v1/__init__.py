from fastapi import APIRouter

from app.api.v1.endpoints import auth_router, users_router, electric_router

api_router = APIRouter()

# Include auth endpoints
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])

# Include user endpoints
api_router.include_router(users_router, prefix="/users", tags=["users"])

# Include electric endpoints
api_router.include_router(electric_router, prefix="/electric", tags=["electric"])