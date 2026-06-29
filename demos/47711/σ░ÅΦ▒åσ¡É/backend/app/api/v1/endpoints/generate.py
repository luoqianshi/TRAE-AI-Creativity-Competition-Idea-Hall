from fastapi import APIRouter

from app.api.v1.endpoints.generation import router as generation_router
from app.api.v1.endpoints.home import router as home_router
from app.api.v1.endpoints.prompts import router as prompts_router


router = APIRouter()
router.include_router(home_router)
router.include_router(generation_router)
router.include_router(prompts_router)
