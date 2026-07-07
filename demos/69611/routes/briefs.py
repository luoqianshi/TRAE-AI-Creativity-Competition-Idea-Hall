"""Intelligence brief API — generate and retrieve briefs."""

import logging
from datetime import date, datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from reporting.intel_brief import (
    BriefType,
    IntelBrief,
    IntelBriefGenerator,
    get_brief_generator,
)
from utils.auth import verify_api_key
from utils.db_pool import get_pool_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/intelligence/briefs", tags=["intelligence-briefs"])


@router.post("/generate")
async def generate_brief(
    brief_type: str = Query("executive", description="executive|sector|flash"),
    sector: Optional[str] = Query(None, description="Sector name (for sector briefs)"),
    report_id: Optional[str] = Query(None, description="Base report ID"),
    generate_from_report: bool = False,
    _=Depends(verify_api_key),
) -> dict:
    """Generate an intelligence brief.

    Args:
        brief_type: Type of brief to generate.
        sector: Required for sector briefs.
        report_id: Optional existing report ID to base brief on.
        generate_from_report: If True and report_id provided, derive brief
                              from the existing report.

    Returns:
        Generated IntelBrief as dict.
    """
    try:
        bt = BriefType(brief_type)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid brief type: {brief_type}. Must be one of: {[bt.value for bt in BriefType]}",
        )

    if bt == BriefType.SECTOR and not sector:
        raise HTTPException(
            status_code=400,
            detail="sector parameter is required for sector briefs",
        )

    generator = get_brief_generator()
    context: dict = {"sector": sector} if sector else {}

    if generate_from_report and report_id:
        briefs = await generator.generate_from_report(
            report_id, brief_types=[bt]
        )
        if not briefs:
            raise HTTPException(status_code=404, detail="Source report not found")
        brief = briefs[0]
    else:
        brief = await generator.generate(bt, context)

    return _brief_to_dict(brief)


@router.get("")
async def list_briefs(
    brief_type: Optional[str] = Query(None, description="Filter by type"),
    limit: int = Query(20, le=100),
    _=Depends(verify_api_key),
) -> dict:
    """List generated intelligence briefs."""
    try:
        pool = await get_pool_manager()
        pg = await pool.postgres.get_pool()
        conditions = ["classification IN ('internal', 'public')"]
        params: list = []
        param_idx = 1

        if brief_type:
            conditions.append(f"metadata->>'sector' = ${param_idx}")
            params.append(brief_type)
            param_idx += 1

        where = " AND ".join(conditions)

        async with pg.acquire() as conn:
            rows = await conn.fetch(
                f"""
                SELECT id, report_date, title, summary, classification,
                       metadata, created_at
                FROM daily_reports
                WHERE {where}
                ORDER BY created_at DESC
                LIMIT ${param_idx}
                """,
                *params,
                limit,
            )
        return {
            "briefs": [
                {
                    "id": r["id"],
                    "title": r["title"],
                    "date": str(r["report_date"]) if r["report_date"] else None,
                    "summary": (r["summary"] or "")[:300],
                    "classification": r["classification"],
                    "metadata": r.get("metadata", {}),
                    "created_at": str(r["created_at"]) if r["created_at"] else None,
                }
                for r in rows
            ],
            "total": len(rows),
        }
    except Exception as e:
        logger.error("Failed to list briefs: %s", e)
        return {"briefs": [], "total": 0}


@router.get("/{brief_id}")
async def get_brief(
    brief_id: str,
    _=Depends(verify_api_key),
) -> dict:
    """Get a single brief by ID with full content."""
    try:
        pool = await get_pool_manager()
        pg = await pool.postgres.get_pool()
        async with pg.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, report_date, title, summary, full_markdown,
                       metadata, classification, created_at
                FROM daily_reports WHERE id = $1
                """,
                brief_id,
            )
        if not row:
            raise HTTPException(status_code=404, detail="Brief not found")

        return {
            "id": row["id"],
            "title": row["title"],
            "date": str(row["report_date"]) if row["report_date"] else None,
            "summary": row["summary"],
            "markdown": row["full_markdown"],
            "metadata": row.get("metadata", {}),
            "classification": row["classification"],
            "created_at": str(row["created_at"]) if row["created_at"] else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get brief %s: %s", brief_id, e)
        raise HTTPException(status_code=500, detail="Failed to retrieve brief")


def _brief_to_dict(brief: IntelBrief) -> dict:
    return {
        "brief_id": brief.brief_id,
        "brief_type": brief.brief_type.value,
        "title": brief.title,
        "summary": brief.summary,
        "markdown": brief.markdown,
        "key_findings": brief.key_findings,
        "entities": brief.entities,
        "events": brief.events,
        "sources": brief.sources,
        "confidence": brief.confidence,
        "classification": brief.classification,
        "generated_at": brief.generated_at,
        "metadata": brief.metadata,
    }
