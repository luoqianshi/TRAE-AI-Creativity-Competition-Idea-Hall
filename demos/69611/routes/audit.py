"""Audit log query API."""

import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Optional

from utils.auth import verify_api_key, APIKeyInfo
from utils.audit_logger import get_audit_logger

logger = logging.getLogger(__name__)

router = APIRouter(tags=["audit"])


@router.get("/audit/logs")
async def query_audit_logs(
    request: Request,
    user: Optional[str] = None,
    resource: Optional[str] = None,
    action: Optional[str] = None,
    start: Optional[str] = None,
    end: Optional[str] = None,
    limit: int = 100,
    auth_info: APIKeyInfo = Depends(verify_api_key),
):
    """Query audit logs (authentication required).

    Non-paginated endpoint; limit only caps the number of returned records.
    Results are filtered by the caller's classification level.
    """
    audit = get_audit_logger()
    await audit.log_access(
        user=auth_info.key_hash[:8],
        resource="audit_logs",
        action="search",
        ip=request.client.host if request.client else "",
        classification="internal",
    )

    start_time = datetime.fromisoformat(start) if start else None
    end_time = datetime.fromisoformat(end) if end else None

    try:
        logs = await audit.query_logs(
            user=user,
            resource=resource,
            action=action,
            start_time=start_time,
            end_time=end_time,
            limit=min(limit, 1000),
            max_classification=auth_info.classification_level,
        )
        return {"total": len(logs), "logs": logs}
    except Exception as e:
        logger.error("Audit log query failed: %s", e, exc_info=True)
        raise HTTPException(
            status_code=503,
            detail="Audit log query service temporarily unavailable",
        )
