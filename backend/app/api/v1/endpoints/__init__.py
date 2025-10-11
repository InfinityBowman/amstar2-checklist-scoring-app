from .auth import router as auth_router
from .users import router as users_router
from .electric import router as electric_router

__all__ = ["auth_router", "users_router", "electric_router"]
