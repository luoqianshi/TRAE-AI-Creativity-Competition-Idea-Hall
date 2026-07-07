"""Reports API — daily report retrieval, diff, and generation."""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from utils.auth import APIKeyInfo, verify_api_key
from services.scheduler_service import _run_report_generation, _check_report_exists

logger = logging.getLogger(__name__)

router = APIRouter(tags=["reports"])

# Global database client injected from main.py lifespan or DI container
_reports_collection = None


def set_db_clients(reports):
    """Inject database clients from main.py lifespan."""
    global _reports_collection
    _reports_collection = reports
    try:
        from utils.di_container import register_service
        register_service("reports_collection", reports)
    except Exception:
        pass


def _resolve_reports_collection():
    """Resolve the reports collection, falling back to DI container."""
    global _reports_collection
    if _reports_collection is not None:
        return _reports_collection
    try:
        from utils.di_container import resolve_service
        return resolve_service("reports_collection")
    except (KeyError, ImportError):
        return None


async def _get_report(date: str) -> Optional[dict]:
    """Get a report for a given date from PG (primary) or MongoDB (fallback)."""
    try:
        from utils.db_pool import get_pool_manager
        pool = get_pool_manager()
        pg_pool = await pool.postgres.get_pool()
        async with pg_pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM daily_reports WHERE report_date = $1::date",
                date,
            )
            if row:
                return dict(row)
    except Exception as e:
        logger.warning("PG report query failed, falling back to MongoDB: %s", e)

    mongo_collection = _resolve_reports_collection()
    if mongo_collection:
        try:
            report = await mongo_collection.find_one({"date": date})
            if report:
                return report
        except Exception as e:
            logger.warning("MongoDB report query failed: %s", e)

    return None


async def _get_report_calendar(month: str) -> dict:
    """Get a calendar view showing which days in a month have reports.

    Checks PG first, then falls back to MongoDB.
    """
    try:
        year, month_num = month.split("-")
        year_int = int(year)
        month_int = int(month_num)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=400, detail="Invalid month format, use YYYY-MM")

    import calendar as cal_mod
    days_in_month = cal_mod.monthrange(year_int, month_int)[1]
    start_date = f"{month}-01"
    end_date = f"{month}-{days_in_month:02d}"

    calendar_map = {day: False for day in range(1, days_in_month + 1)}

    try:
        from utils.db_pool import get_pool_manager
        pool = get_pool_manager()
        pg_pool = await pool.postgres.get_pool()
        async with pg_pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT report_date FROM daily_reports "
                "WHERE report_date >= $1::date AND report_date < $2::date",
                start_date,
                end_date,
            )
            for row in rows:
                day = row["report_date"].day
                calendar_map[day] = True
    except Exception as e:
        logger.warning("PG calendar query failed: %s", e)

    if not any(calendar_map.values()):
        mongo_collection = _resolve_reports_collection()
        if mongo_collection:
            try:
                cursor = mongo_collection.find(
                    {"date": {"$gte": start_date, "$lt": end_date}},
                    {"date": 1},
                )
                async for doc in cursor:
                    day = int(doc["date"].split("-")[2])
                    calendar_map[day] = True
            except Exception as e:
                logger.warning("MongoDB calendar query failed: %s", e)

    return {
        "month": month,
        "days_in_month": days_in_month,
        "calendar": {day: calendar_map[day] for day in range(1, days_in_month + 1)},
    }


@router.get("/api/reports/{date}")
async def get_report_by_date(
    date: str,
    auth: APIKeyInfo = Depends(verify_api_key),
):
    """Get a daily report by date (YYYY-MM-DD)."""
    try:
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")

    report = await _get_report(date)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return report


@router.get("/api/reports/{date}/diff")
async def get_diff(
    date: str,
    auth: APIKeyInfo = Depends(verify_api_key),
):
    """Get the diff summary comparing this report to the previous day."""
    try:
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")

    report = await _get_report(date)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    diff_text = report.get("diff_from_previous", "")
    if not diff_text:
        return {"date": date, "has_diff": False, "message": "No historical comparison data available"}

    return {"date": date, "has_diff": True, "diff": diff_text}


@router.get("/api/reports/calendar/{month}")
async def get_calendar(
    month: str,
    auth: APIKeyInfo = Depends(verify_api_key),
):
    """Get a monthly calendar showing which days have reports."""
    return await _get_report_calendar(month)


@router.post("/api/reports/generate")
async def generate_report(
    date: Optional[str] = None,
    auth: APIKeyInfo = Depends(verify_api_key),
):
    """Generate a daily report for the given date (default: yesterday)."""
    if date is None:
        date = (datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=1)).strftime("%Y-%m-%d")

    if await _check_report_exists(date):
        raise HTTPException(
            status_code=409,
            detail=f"Report for {date} already exists",
        )

    try:
        await _run_report_generation(date)
        return {"success": True, "date": date, "message": f"Report generation started for {date}"}
    except Exception as e:
        logger.error("Report generation failed: %s", e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Report generation failed",
        )
