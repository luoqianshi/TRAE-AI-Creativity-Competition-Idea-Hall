from fastapi import APIRouter

from app.api.v1.endpoints.ocs import router as ocs_router
from app.api.v1.endpoints.relations import router as relations_router
from app.api.v1.endpoints.world import router as world_router


router = APIRouter()
router.include_router(ocs_router)
router.include_router(world_router)
router.include_router(relations_router)
