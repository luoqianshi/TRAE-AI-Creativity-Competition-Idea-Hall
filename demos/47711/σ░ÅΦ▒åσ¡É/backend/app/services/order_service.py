from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import uuid4

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestException, NotFoundException
from app.models.cart_item import CartItem
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User
from app.models.withdraw_request import WithdrawRequest
from app.schemas.order import (
    OrderCreateRequest,
    OrderItemOut,
    OrderListPayload,
    OrderOut,
    OrderPayDemoRequest,
    RevenueDashboardOut,
)
from app.schemas.shop import DesignPayload, PrintAreaOut
from app.services.shop_service import ensure_default_products
from app.services.user_service import ensure_user_profile
from app.services.vip_service import activate_demo_vip


PAID_REVENUE_RATE = 1.0


def _now() -> datetime:
    return datetime.utcnow()


def _next_order_no() -> str:
    return f"OD{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{uuid4().hex[:6].upper()}"


def _normalize_print_area(raw: dict[str, Any] | None) -> PrintAreaOut:
    if not isinstance(raw, dict):
        return PrintAreaOut()
    return PrintAreaOut(
        width=max(int(raw.get("width", 0) or 0), 0),
        height=max(int(raw.get("height", 0) or 0), 0),
        shape=str(raw.get("shape", "rect") or "rect"),
        label=str(raw.get("label", "") or ""),
    )


def _normalize_design(raw: dict[str, Any] | None) -> DesignPayload | None:
    if not isinstance(raw, dict):
        return None
    if not raw.get("image_path"):
        return None
    try:
        return DesignPayload.model_validate(raw)
    except Exception:
        return None


def _serialize_order_item(order_item: OrderItem) -> OrderItemOut:
    return OrderItemOut(
        id=order_item.id,
        product_id=order_item.product_id,
        name=order_item.product_name,
        emoji=order_item.product_emoji,
        desc=order_item.product_desc,
        status=order_item.product_status,
        print_area=_normalize_print_area(order_item.print_area),
        quantity=order_item.quantity,
        unit_price=round(float(order_item.unit_price or 0), 2),
        line_total=round(float(order_item.line_total or 0), 2),
        design=_normalize_design(order_item.design_json),
        kind=order_item.kind,
    )


def _serialize_order(order: Order) -> OrderOut:
    return OrderOut(
        id=order.id,
        order_no=order.order_no,
        user_id=order.user_id,
        status=order.status,
        payment_status=order.payment_status,
        payment_channel=order.payment_channel,
        payment_provider=order.payment_provider,
        payment_reference=order.payment_reference,
        payment_payload=order.payment_payload or {},
        currency=order.currency,
        subtotal_amount=round(float(order.subtotal_amount or 0), 2),
        discount_amount=round(float(order.discount_amount or 0), 2),
        total_amount=round(float(order.total_amount or 0), 2),
        total_quantity=int(order.total_quantity or 0),
        paid_amount=round(float(order.paid_amount or 0), 2),
        paid_at=order.paid_at,
        note=order.note or "",
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=[_serialize_order_item(item) for item in sorted(order.items, key=lambda x: x.id)],
    )


def _get_owned_order(db: Session, *, user_id: int, order_id: int) -> Order:
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == user_id)
        .first()
    )
    if order is None:
        raise NotFoundException("订单不存在")
    return order


def _append_payment_event(
    order: Order,
    *,
    action: str,
    payload: dict[str, Any] | None = None,
) -> None:
    current_payload = dict(order.payment_payload or {})
    timeline = current_payload.get("timeline")
    if not isinstance(timeline, list):
        timeline = []
    event = {
        "action": action,
        "at": _now().isoformat(),
        "status": order.status,
        "payment_status": order.payment_status,
    }
    if payload:
        event["payload"] = payload
    timeline.append(event)
    current_payload["timeline"] = timeline
    order.payment_payload = current_payload


def _mark_revenue_when_paid(db: Session, *, order: Order) -> None:
    if order.revenue_recorded:
        return

    user = db.query(User).filter(User.id == order.user_id).first()
    if user is None:
        raise NotFoundException("用户不存在")
    profile = ensure_user_profile(db, user)

    settled_amount = round(float(order.total_amount or 0) * PAID_REVENUE_RATE, 2)
    profile.total_revenue = round(float(profile.total_revenue or 0) + settled_amount, 2)
    profile.month_revenue = round(float(profile.month_revenue or 0) + settled_amount, 2)
    profile.pending_withdraw = round(float(profile.pending_withdraw or 0) + settled_amount, 2)
    order.revenue_recorded = True

    has_vip_demo_item = any(item.kind == "vip_demo" for item in order.items)
    if has_vip_demo_item:
        activate_demo_vip(db, user_id=order.user_id, plan_code="month")


def create_order_from_cart(
    db: Session,
    *,
    user_id: int,
    payload: OrderCreateRequest,
) -> OrderOut:
    ensure_default_products(db)
    rows = (
        db.query(CartItem, Product)
        .join(Product, Product.id == CartItem.product_id)
        .filter(CartItem.user_id == user_id, Product.is_active.is_(True))
        .order_by(CartItem.id.asc())
        .all()
    )
    if not rows:
        raise BadRequestException("购物车为空，无法创建订单")

    subtotal_amount = 0.0
    total_quantity = 0
    order = Order(
        order_no=_next_order_no(),
        user_id=user_id,
        status="pending_payment",
        payment_status="unpaid",
        payment_channel="demo",
        payment_provider="demo-gateway",
        currency="CNY",
        subtotal_amount=0,
        discount_amount=0,
        total_amount=0,
        total_quantity=0,
        paid_amount=0,
        note=payload.note or "",
    )
    db.add(order)
    db.flush()

    for cart_item, product in rows:
        quantity = max(int(cart_item.quantity or 1), 1)
        unit_price = round(float(cart_item.unit_price or product.price or 0), 2)
        line_total = round(unit_price * quantity, 2)
        subtotal_amount += line_total
        total_quantity += quantity

        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                product_emoji=product.emoji,
                product_desc=product.desc,
                product_status=product.status,
                print_area=product.print_area or {},
                unit_price=unit_price,
                quantity=quantity,
                line_total=line_total,
                design_json=cart_item.design_json,
                kind=product.kind or "physical",
            )
        )

    order.subtotal_amount = round(subtotal_amount, 2)
    order.total_amount = round(subtotal_amount, 2)
    order.total_quantity = total_quantity
    _append_payment_event(order, action="order_created", payload={"source": payload.source})

    db.query(CartItem).filter(CartItem.user_id == user_id).delete(synchronize_session=False)
    db.commit()
    db.refresh(order)
    return _serialize_order(order)


def list_orders(db: Session, *, user_id: int) -> OrderListPayload:
    rows = (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.id.desc())
        .all()
    )
    return OrderListPayload(items=[_serialize_order(row) for row in rows])


def get_order_detail(db: Session, *, user_id: int, order_id: int) -> OrderOut:
    order = _get_owned_order(db, user_id=user_id, order_id=order_id)
    return _serialize_order(order)


def pay_order_demo(
    db: Session,
    *,
    user_id: int,
    order_id: int,
    payload: OrderPayDemoRequest,
) -> OrderOut:
    order = _get_owned_order(db, user_id=user_id, order_id=order_id)

    action = payload.action
    provider = payload.payment_provider or order.payment_provider or "demo-gateway"
    callback_payload = payload.callback_payload or {}

    if action == "start":
        if order.status == "canceled":
            raise BadRequestException("订单已取消，不能继续支付")
        if order.payment_status == "paid":
            return _serialize_order(order)
        order.payment_status = "processing"
        order.status = "payment_processing"
        order.payment_provider = provider
        order.payment_reference = order.payment_reference or f"PAY{uuid4().hex[:12].upper()}"
        _append_payment_event(order, action=action, payload=callback_payload)

    elif action in {"succeed", "callback_success"}:
        if order.status == "canceled":
            raise BadRequestException("订单已取消，不能支付")
        if order.payment_status != "paid":
            order.payment_status = "paid"
            order.status = "paid"
            order.payment_provider = provider
            order.payment_reference = order.payment_reference or f"PAY{uuid4().hex[:12].upper()}"
            order.paid_amount = round(float(order.total_amount or 0), 2)
            order.paid_at = _now()
            _mark_revenue_when_paid(db, order=order)
        _append_payment_event(order, action=action, payload=callback_payload)

    elif action in {"fail", "callback_fail"}:
        if order.payment_status == "paid":
            raise BadRequestException("订单已支付，不能标记失败")
        if order.status == "canceled":
            raise BadRequestException("订单已取消")
        order.payment_status = "failed"
        order.status = "pending_payment"
        order.payment_provider = provider
        _append_payment_event(order, action=action, payload=callback_payload)

    elif action == "cancel":
        if order.payment_status == "paid":
            raise BadRequestException("订单已支付，不能取消")
        order.payment_status = "canceled"
        order.status = "canceled"
        _append_payment_event(order, action=action, payload=callback_payload)

    else:
        raise BadRequestException("不支持的支付动作")

    db.commit()
    db.refresh(order)
    return _serialize_order(order)


def get_revenue_dashboard(db: Session, *, user_id: int) -> RevenueDashboardOut:
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise NotFoundException("用户不存在")
    profile = ensure_user_profile(db, user)

    paid_orders_count = (
        db.query(func.count(Order.id))
        .filter(Order.user_id == user_id, Order.payment_status == "paid")
        .scalar()
        or 0
    )
    last_paid_at = (
        db.query(func.max(Order.paid_at))
        .filter(Order.user_id == user_id, Order.payment_status == "paid")
        .scalar()
    )
    withdrawn_total = (
        db.query(func.coalesce(func.sum(WithdrawRequest.amount), 0))
        .filter(WithdrawRequest.user_id == user_id)
        .scalar()
        or 0
    )
    last_withdraw_requested_at = (
        db.query(func.max(WithdrawRequest.created_at))
        .filter(WithdrawRequest.user_id == user_id)
        .scalar()
    )

    return RevenueDashboardOut(
        currency="CNY",
        total_revenue=round(float(profile.total_revenue or 0), 2),
        month_revenue=round(float(profile.month_revenue or 0), 2),
        pending_withdraw=round(float(profile.pending_withdraw or 0), 2),
        available_withdraw=round(float(profile.pending_withdraw or 0), 2),
        paid_orders_count=int(paid_orders_count),
        withdrawn_total=round(float(withdrawn_total or 0), 2),
        last_paid_at=last_paid_at,
        last_withdraw_requested_at=last_withdraw_requested_at,
    )
