from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth_router, users_router,
    projects_router, project_members_router, reviews_router,
    review_assignments_router, checklists_router, checklist_answers_router
)

api_router = APIRouter()

# Include auth endpoints
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])

# Include user endpoints
api_router.include_router(users_router, prefix="/users", tags=["users"])

# Include project endpoints
api_router.include_router(projects_router, prefix="/projects", tags=["projects"])

# Include project members endpoints
api_router.include_router(project_members_router, prefix="/projects", tags=["project-members"])

# Include review endpoints
api_router.include_router(reviews_router, prefix="/reviews", tags=["reviews"])

# Include review assignment endpoints
api_router.include_router(review_assignments_router, prefix="/reviews", tags=["review-assignments"])

# Include checklist endpoints
api_router.include_router(checklists_router, prefix="/checklists", tags=["checklists"])

# Include checklist answer endpoints
api_router.include_router(checklist_answers_router, prefix="/checklists", tags=["checklist-answers"])