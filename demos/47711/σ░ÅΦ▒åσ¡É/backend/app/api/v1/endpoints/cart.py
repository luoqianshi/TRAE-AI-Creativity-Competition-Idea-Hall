from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.response import ApiResponse, success_response
from app.schemas.shop import CartItemCreateRequest, CartItemUpdateRequest, CartPayload
from app.services.shop_service import (
    add_cart_item,
    clear_cart,
    delete_cart_item,
    get_cart,
    update_cart_item,
)


router = APIRouter(tags=["cart"])


@router.get("/cart", response_model=ApiResponse[CartPayload])
def get_cart_detail(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[CartPayload]:
    return success_response(get_cart(db, user_id=current_user.id), message="获取成功")


@router.post("/cart/items", response_model=ApiResponse[CartPayload])
def post_cart_item(
    payload: CartItemCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[CartPayload]:
    return success_response(
        add_cart_item(db, user_id=current_user.id, payload=payload),
        message="已加入购物车",
    )


@router.patch("/cart/items/{item_id}", response_model=ApiResponse[CartPayload])
def patch_cart_item(
    item_id: int,
    payload: CartItemUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[CartPayload]:
    return success_response(
        update_cart_item(
            db,
            user_id=current_user.id,
            item_id=item_id,
            payload=payload,
        ),
        message="购物车已更新",
    )


@router.delete("/cart/items/{item_id}", response_model=ApiResponse[CartPayload])
def delete_cart_line(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[CartPayload]:
    return success_response(
        delete_cart_item(db, user_id=current_user.id, item_id=item_id),
        message="已移除",
    )


@router.delete("/cart", response_model=ApiResponse[None])
def delete_cart_all(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[None]:
    clear_cart(db, user_id=current_user.id)
    return success_response(message="购物车已清空")
