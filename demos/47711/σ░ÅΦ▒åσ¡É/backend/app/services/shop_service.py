from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException
from app.models.cart_item import CartItem
from app.models.product import Product
from app.schemas.shop import (
    CartItemCreateRequest,
    CartItemOut,
    CartItemUpdateRequest,
    CartPayload,
    DesignPayload,
    PrintAreaOut,
    ProductListPayload,
    ProductOut,
)


DEFAULT_PRODUCTS: list[dict[str, Any]] = [
    {
        "name": "定制 OC 亚克力立牌",
        "emoji": "🏷️",
        "price": 68,
        "desc": "高清印刷，还原你的 OC 形象",
        "status": "去购买",
        "print_area": {"width": 280, "height": 380, "shape": "rect", "label": "立牌正面"},
    },
    {
        "name": "OC 主题手机壳",
        "emoji": "📱",
        "price": 128,
        "desc": "硬壳/软壳可选，支持全型号",
        "status": "去购买",
        "print_area": {
            "width": 260,
            "height": 480,
            "shape": "round-rect",
            "label": "手机壳背面",
        },
    },
    {
        "name": "限定版 OC 抱枕",
        "emoji": "🛏️",
        "price": 198,
        "desc": "45cm 双面印刷，柔软亲肤",
        "status": "预售中",
        "print_area": {"width": 360, "height": 360, "shape": "rect", "label": "抱枕正面"},
    },
    {
        "name": "OC 角色 NFC 手办",
        "emoji": "🎭",
        "price": 328,
        "desc": "内置 NFC 芯片，触碰解锁专属语音",
        "status": "去购买",
        "print_area": {"width": 240, "height": 320, "shape": "rect", "label": "手办底座"},
    },
    {
        "name": "定制签名海报",
        "emoji": "🖼️",
        "price": 48,
        "desc": "A3 尺寸铜版纸，含角色签名",
        "status": "去购买",
        "print_area": {"width": 300, "height": 420, "shape": "rect", "label": "海报区域"},
    },
    {
        "name": "OC 主题马克杯",
        "emoji": "☕",
        "price": 58,
        "desc": "陶瓷变色杯，遇热显现角色立绘",
        "status": "去购买",
        "print_area": {"width": 400, "height": 240, "shape": "rect", "label": "杯身展开面"},
    },
    {
        "name": "角色主题文具套装",
        "emoji": "✏️",
        "price": 38,
        "desc": "含笔记本、贴纸、书签、中性笔",
        "status": "去购买",
        "print_area": {"width": 300, "height": 360, "shape": "rect", "label": "笔记本封面"},
    },
    {
        "name": "OC 定制钥匙扣",
        "emoji": "🔑",
        "price": 28,
        "desc": "金属材质，双面浮雕工艺",
        "status": "去购买",
        "print_area": {"width": 200, "height": 200, "shape": "circle", "label": "钥匙扣正面"},
    },
    {
        "name": "VIP 契约月卡（演示）",
        "emoji": "✨",
        "price": 28,
        "desc": "演示商品：支付成功后可通过订单域激活 VIP 占位能力",
        "status": "演示商品",
        "kind": "vip_demo",
        "print_area": {"width": 200, "height": 120, "shape": "rect", "label": "会员权益卡"},
    },
]


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


def _serialize_product(product: Product) -> ProductOut:
    return ProductOut(
        id=product.id,
        name=product.name,
        emoji=product.emoji,
        price=round(float(product.price or 0), 2),
        desc=product.desc or "",
        status=product.status or "",
        print_area=_normalize_print_area(product.print_area),
        kind=product.kind or "physical",
        is_active=bool(product.is_active),
        created_at=product.created_at,
        updated_at=product.updated_at,
    )


def _serialize_cart_item(cart_item: CartItem, product: Product) -> CartItemOut:
    unit_price = round(float(cart_item.unit_price or product.price or 0), 2)
    quantity = max(int(cart_item.quantity or 1), 1)
    return CartItemOut(
        id=cart_item.id,
        product_id=product.id,
        name=product.name,
        emoji=product.emoji,
        price=unit_price,
        desc=product.desc or "",
        status=product.status or "",
        print_area=_normalize_print_area(product.print_area),
        quantity=quantity,
        design=_normalize_design(cart_item.design_json),
        line_total=round(unit_price * quantity, 2),
        kind=product.kind or "physical",
        created_at=cart_item.created_at,
        updated_at=cart_item.updated_at,
    )


def ensure_default_products(db: Session) -> None:
    existing_count = db.query(Product.id).count()
    if existing_count == 0:
        for idx, item in enumerate(DEFAULT_PRODUCTS):
            db.add(
                Product(
                    name=item["name"],
                    emoji=item.get("emoji", "🛍️"),
                    price=float(item.get("price", 0)),
                    desc=item.get("desc", ""),
                    status=item.get("status", "在售"),
                    print_area=item.get("print_area", {}),
                    kind=item.get("kind", "physical"),
                    is_active=True,
                    sort_order=idx,
                )
            )
        db.commit()
        return

    vip_exists = (
        db.query(Product.id)
        .filter(Product.kind == "vip_demo", Product.is_active.is_(True))
        .first()
    )
    if vip_exists is not None:
        return

    vip = DEFAULT_PRODUCTS[-1]
    db.add(
        Product(
            name=vip["name"],
            emoji=vip.get("emoji", "✨"),
            price=float(vip.get("price", 0)),
            desc=vip.get("desc", ""),
            status=vip.get("status", "演示商品"),
            print_area=vip.get("print_area", {}),
            kind="vip_demo",
            is_active=True,
            sort_order=9999,
        )
    )
    db.commit()


def list_products(db: Session) -> ProductListPayload:
    ensure_default_products(db)
    rows = (
        db.query(Product)
        .filter(Product.is_active.is_(True))
        .order_by(Product.sort_order.asc(), Product.id.asc())
        .all()
    )
    return ProductListPayload(items=[_serialize_product(item) for item in rows])


def _build_cart_payload(db: Session, *, user_id: int) -> CartPayload:
    rows = (
        db.query(CartItem, Product)
        .join(Product, Product.id == CartItem.product_id)
        .filter(CartItem.user_id == user_id, Product.is_active.is_(True))
        .order_by(CartItem.id.desc())
        .all()
    )
    items = [_serialize_cart_item(cart_item, product) for cart_item, product in rows]
    total_quantity = sum(item.quantity for item in items)
    total_amount = round(sum(item.line_total for item in items), 2)
    return CartPayload(
        items=items,
        total_quantity=total_quantity,
        total_amount=total_amount,
        currency="CNY",
    )


def get_cart(db: Session, *, user_id: int) -> CartPayload:
    ensure_default_products(db)
    return _build_cart_payload(db, user_id=user_id)


def add_cart_item(
    db: Session,
    *,
    user_id: int,
    payload: CartItemCreateRequest,
) -> CartPayload:
    ensure_default_products(db)
    product = (
        db.query(Product)
        .filter(Product.id == payload.product_id, Product.is_active.is_(True))
        .first()
    )
    if product is None:
        raise NotFoundException("商品不存在或已下架")

    design = payload.design.model_dump() if payload.design is not None else None
    cart_item = CartItem(
        user_id=user_id,
        product_id=product.id,
        quantity=payload.quantity,
        unit_price=round(float(product.price or 0), 2),
        design_json=design,
    )
    db.add(cart_item)
    db.commit()
    return _build_cart_payload(db, user_id=user_id)


def update_cart_item(
    db: Session,
    *,
    user_id: int,
    item_id: int,
    payload: CartItemUpdateRequest,
) -> CartPayload:
    cart_item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.user_id == user_id)
        .first()
    )
    if cart_item is None:
        raise NotFoundException("购物车项不存在")

    if payload.quantity is not None:
        cart_item.quantity = payload.quantity

    if "design" in payload.model_fields_set:
        cart_item.design_json = (
            payload.design.model_dump() if payload.design is not None else None
        )

    db.commit()
    return _build_cart_payload(db, user_id=user_id)


def delete_cart_item(db: Session, *, user_id: int, item_id: int) -> CartPayload:
    cart_item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.user_id == user_id)
        .first()
    )
    if cart_item is None:
        raise NotFoundException("购物车项不存在")
    db.delete(cart_item)
    db.commit()
    return _build_cart_payload(db, user_id=user_id)


def clear_cart(db: Session, *, user_id: int) -> None:
    db.query(CartItem).filter(CartItem.user_id == user_id).delete(synchronize_session=False)
    db.commit()
