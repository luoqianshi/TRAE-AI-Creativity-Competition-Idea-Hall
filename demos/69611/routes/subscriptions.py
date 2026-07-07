"""Report subscription API.

Allows users to subscribe to customized reports by department/entity
with schedule control and classification-aware filtering.
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from utils.auth import APIKeyInfo, verify_api_key
from utils.audit_logger import get_audit_logger

logger = logging.getLogger(__name__)

router = APIRouter(tags=["subscriptions"])


# ============================================================
# Pydantic models
# ============================================================

class CreateSubscriptionRequest(BaseModel):
    report_type: str
    department: Optional[str] = None
    entities: Optional[List[str]] = None
    schedule_cron: Optional[str] = None
    classification: str = "internal"


class SubscriptionResponse(BaseModel):
    id: int
    subscriber_id: str
    department: Optional[str]
    report_type: str
    entities: List[str]
    schedule_cron: Optional[str]
    classification: str
    active: bool


class GenerateRequest(BaseModel):
    extra_kwargs: Optional[dict] = None


# ============================================================
# Routes
# ============================================================

@router.post("/subscriptions", response_model=SubscriptionResponse)
async def create_subscription(
    body: CreateSubscriptionRequest,
    request: Request,
    auth_info: APIKeyInfo = Depends(verify_api_key),
):
    """Create a new report subscription.

    Validates report type, classification level, and creates the
    subscription with the configured schedule.
    """
    valid_types = {"daily", "weekly", "topic", "alert_brief"}
    if body.report_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported report type: {body.report_type}. "
                   f"Supported: {sorted(valid_types)}",
        )

    from utils.classification import get_classifier
    classifier = get_classifier()
    if not classifier.can_access(auth_info.classification_level, body.classification):
        raise HTTPException(
            status_code=403,
            detail=f"Subscription classification ({body.classification}) "
                   f"exceeds your clearance ({auth_info.classification_level})",
        )

    subscriber_id = auth_info.key_hash[:8]

    try:
        from services.subscription_manager import get_subscription_manager
        mgr = get_subscription_manager()
        sub_id = await mgr.create_subscription(
            subscriber_id=subscriber_id,
            report_type=body.report_type,
            department=body.department,
            entities=body.entities,
            schedule_cron=body.schedule_cron,
            classification=body.classification,
        )
    except Exception as e:
        logger.error("Failed to create subscription: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create subscription")

    audit = get_audit_logger()
    await audit.log_access(
        user=subscriber_id,
        resource=f"subscription:{sub_id}",
        action="create",
        ip=request.client.host if request.client else "",
        classification=auth_info.classification_level,
        metadata={
            "report_type": body.report_type,
            "department": body.department,
            "entities": body.entities or [],
        },
    )

    return SubscriptionResponse(
        id=sub_id,
        subscriber_id=subscriber_id,
        department=body.department,
        report_type=body.report_type,
        entities=body.entities or [],
        schedule_cron=body.schedule_cron,
        classification=body.classification,
        active=True,
    )


@router.get("/subscriptions", response_model=List[SubscriptionResponse])
async def list_subscriptions(
    request: Request,
    auth_info: APIKeyInfo = Depends(verify_api_key),
):
    """List subscriptions for the current API Key holder.

    Only returns subscriptions created by the calling API Key.
    """
    subscriber_id = auth_info.key_hash[:8]

    from services.subscription_manager import get_subscription_manager
    mgr = get_subscription_manager()
    subs = await mgr.list_subscriptions(subscriber_id=subscriber_id, active_only=False)

    audit = get_audit_logger()
    await audit.log_access(
        user=subscriber_id,
        resource="subscriptions:list",
        action="view",
        ip=request.client.host if request.client else "",
        classification=auth_info.classification_level,
    )

    return [
        SubscriptionResponse(
            id=s["id"],
            subscriber_id=s["subscriber_id"],
            department=s["department"],
            report_type=s["report_type"],
            entities=s["entities"],
            schedule_cron=s["schedule_cron"],
            classification=s["classification"],
            active=s["active"],
        )
        for s in subs
    ]


@router.delete("/subscriptions/{sub_id}")
async def deactivate_subscription(
    sub_id: int,
    request: Request,
    auth_info: APIKeyInfo = Depends(verify_api_key),
):
    """Deactivate a subscription (soft delete).

    Only the subscription creator can deactivate their own subscriptions.
    """
    subscriber_id = auth_info.key_hash[:8]

    from services.subscription_manager import get_subscription_manager
    mgr = get_subscription_manager()

    subs = await mgr.list_subscriptions(subscriber_id=subscriber_id, active_only=False)
    owned_ids = {s["id"] for s in subs}
    if sub_id not in owned_ids:
        raise HTTPException(status_code=403, detail="Not authorized to manage this subscription")

    ok = await mgr.deactivate_subscription(sub_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Subscription not found or already deactivated")

    audit = get_audit_logger()
    await audit.log_access(
        user=subscriber_id,
        resource=f"subscription:{sub_id}",
        action="delete",
        ip=request.client.host if request.client else "",
        classification=auth_info.classification_level,
    )

    return {"status": "deactivated", "subscription_id": sub_id}


@router.post("/subscriptions/{sub_id}/generate")
async def generate_subscription_report(
    sub_id: int,
    body: Optional[GenerateRequest] = None,
    request: Request = None,
    auth_info: APIKeyInfo = Depends(verify_api_key),
):
    """Generate a personalized report for a subscription immediately.

    Filters report content based on the subscription's entity list
    and classification level.
    """
    subscriber_id = auth_info.key_hash[:8]

    from services.subscription_manager import get_subscription_manager
    mgr = get_subscription_manager()

    subs = await mgr.list_subscriptions(subscriber_id=subscriber_id, active_only=True)
    target = next((s for s in subs if s["id"] == sub_id), None)
    if target is None:
        raise HTTPException(status_code=404, detail="Subscription not found or inactive")

    extra_kwargs = (body.extra_kwargs if body else None) or {}

    try:
        report = await mgr.generate_personalized_report(target, **extra_kwargs)
    except Exception as e:
        logger.error("Failed to generate personalized report: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate personalized report")

    audit = get_audit_logger()
    await audit.log_access(
        user=subscriber_id,
        resource=f"subscription:{sub_id}:report",
        action="generate",
        ip=request.client.host if request.client else "",
        classification=auth_info.classification_level,
        metadata={
            "report_type": target["report_type"],
            "entities": target["entities"],
        },
    )

    return report
