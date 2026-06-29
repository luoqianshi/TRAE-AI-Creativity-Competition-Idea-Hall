from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.response import ApiResponse, success_response
from app.schemas.shop import ProductListPayload
from app.services.shop_service import list_products


router = APIRouter(tags=["products"])


@router.get("/products", response_model=ApiResponse[ProductListPayload])
def get_products(
    db: Session = Depends(get_db),
) -> ApiResponse[ProductListPayload]:
    return success_response(list_products(db), message="获取成功")
