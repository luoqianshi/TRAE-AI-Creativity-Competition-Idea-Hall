from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.schemas.vip import VipStatusOut


_VIP_COLUMNS_READY = False
_PLAN_DAYS = {
    "month": 30,
    "quarter": 90,
    "year": 365,
}


def _normalize_plan(plan_code: str | None) -> str:
    if not plan_code:
        return "quarter"
    return plan_code if plan_code in _PLAN_DAYS else "quarter"


def ensure_vip_columns(db: Session) -> None:
    global _VIP_COLUMNS_READY
    if _VIP_COLUMNS_READY:
        return

    table_name = "users"
    columns = {
        "vip_active": "ALTER TABLE users ADD COLUMN vip_active TINYINT(1) NOT NULL DEFAULT 0",
        "vip_activated_at": "ALTER TABLE users ADD COLUMN vip_activated_at DATETIME NULL",
        "vip_expires_at": "ALTER TABLE users ADD COLUMN vip_expires_at DATETIME NULL",
        "vip_plan_code": "ALTER TABLE users ADD COLUMN vip_plan_code VARCHAR(20) NULL",
    }

    for column_name, ddl in columns.items():
        exists = db.execute(
            text(
                """
                SELECT COUNT(1)
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = :schema_name
                  AND TABLE_NAME = :table_name
                  AND COLUMN_NAME = :column_name
                """
            ),
            {
                "schema_name": settings.mysql_database,
                "table_name": table_name,
                "column_name": column_name,
            },
        ).scalar_one()
        if not exists:
            db.execute(text(ddl))

    db.commit()
    _VIP_COLUMNS_READY = True


def get_user_vip_status(db: Session, *, user_id: int) -> VipStatusOut:
    ensure_vip_columns(db)
    row = db.execute(
        text(
            """
            SELECT vip_active, vip_activated_at, vip_expires_at
                 , vip_plan_code
            FROM users
            WHERE id = :user_id
            """
        ),
        {"user_id": user_id},
    ).mappings().first()

    if row is None:
        return VipStatusOut(is_active=False, plan_code="quarter")

    is_active = bool(row["vip_active"])
    expires_at = row["vip_expires_at"]
    if is_active and expires_at and expires_at < datetime.utcnow():
        is_active = False

    return VipStatusOut(
        is_active=is_active,
        plan_code=row["vip_plan_code"] or "quarter",
        activated_at=row["vip_activated_at"],
        expires_at=expires_at,
    )


def activate_demo_vip(db: Session, *, user_id: int, plan_code: str) -> VipStatusOut:
    ensure_vip_columns(db)
    normalized_plan = _normalize_plan(plan_code)
    now = datetime.utcnow()
    expires_at = now + timedelta(days=_PLAN_DAYS[normalized_plan])

    db.execute(
        text(
            """
            UPDATE users
            SET vip_active = 1,
                vip_activated_at = :activated_at,
                vip_expires_at = :expires_at,
                vip_plan_code = :plan_code
            WHERE id = :user_id
            """
        ),
        {
            "user_id": user_id,
            "activated_at": now,
            "expires_at": expires_at,
            "plan_code": normalized_plan,
        },
    )
    db.execute(
        text(
            """
            UPDATE chat_sessions
            SET is_vip_active = 1,
                vip_expires_at = :expires_at
            WHERE user_id = :user_id
            """
        ),
        {
            "user_id": user_id,
            "expires_at": expires_at,
        },
    )
    db.commit()

    return VipStatusOut(
        is_active=True,
        plan_code=normalized_plan,
        activated_at=now,
        expires_at=expires_at,
    )
