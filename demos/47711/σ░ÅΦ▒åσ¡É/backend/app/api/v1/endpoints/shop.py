from fastapi import APIRouter

from app.api.v1.endpoints.cart import router as cart_router
from app.api.v1.endpoints.orders import router as orders_router
from app.api.v1.endpoints.products import router as products_router


router = APIRouter(tags=["shop"])
router.include_router(products_router)
router.include_router(cart_router)
router.include_router(orders_router)
