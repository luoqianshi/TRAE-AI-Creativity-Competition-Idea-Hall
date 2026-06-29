from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.order import (
    OrderCreateRequest,
    OrderListPayload,
    OrderOut,
    OrderPayDemoRequest,
    RevenueDashboardOut,
)
from app.schemas.response import ApiResponse, success_response
from app.services.order_service import (
    create_order_from_cart,
    get_order_detail,
    get_revenue_dashboard,
    list_orders,
    pay_order_demo,
)


router = APIRouter(tags=["orders"])


@router.post("/orders", response_model=ApiResponse[OrderOut])
def post_orders(
    payload: OrderCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[OrderOut]:
    return success_response(
        create_order_from_cart(db, user_id=current_user.id, payload=payload),
        message="订单创建成功",
    )


@router.get("/orders", response_model=ApiResponse[OrderListPayload])
def get_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[OrderListPayload]:
    return success_response(list_orders(db, user_id=current_user.id), message="获取成功")


@router.get("/orders/{order_id}", response_model=ApiResponse[OrderOut])
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[OrderOut]:
    return success_response(
        get_order_detail(db, user_id=current_user.id, order_id=order_id),
        message="获取成功",
    )


@router.patch("/orders/{order_id}/pay-demo", response_model=ApiResponse[OrderOut])
def patch_order_pay_demo(
    order_id: int,
    payload: OrderPayDemoRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[OrderOut]:
    return success_response(
        pay_order_demo(
            db,
            user_id=current_user.id,
            order_id=order_id,
            payload=payload,
        ),
        message="支付状态已更新",
    )


@router.get("/me/revenue-dashboard", response_model=ApiResponse[RevenueDashboardOut])
def get_me_revenue_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[RevenueDashboardOut]:
    return success_response(
        get_revenue_dashboard(db, user_id=current_user.id),
        message="获取成功",
    )
