"""End-of-day batch processing scheduler service.

Manages the APScheduler instance that runs daily batch jobs at 08:00 CST,
including event detection, impact analysis, data reconciliation, and
report generation.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from utils.timezone import business_now

logger = logging.getLogger(__name__)

scheduler: Optional[AsyncIOScheduler] = None
_reports_collection = None


def set_reports_collection(collection):
    """Inject MongoDB reports collection from main.py.

    Also registered with the DI container as the unified dependency
    injection entry point.
    """
    global _reports_collection
    _reports_collection = collection


def _resolve_reports_collection():
    """Resolve the reports collection, importing from DI if needed."""
    global _reports_collection
    if _reports_collection is not None:
        return _reports_collection
    try:
        from utils.db_pool import get_pool_manager
        pool = get_pool_manager()
        _reports_collection = pool.mongodb.get_collection("reports")
        return _reports_collection
    except Exception:
        return None


async def _check_report_exists(date_str: str) -> bool:
    """Check if a daily report already exists for the given date.

    Checks PostgreSQL (primary) first, then falls back to MongoDB.
    """
    try:
        from utils.db_pool import get_pool_manager
        pool = get_pool_manager()
        pg_pool = await pool.postgres.get_pool()
        async with pg_pool.acquire() as conn:
            row = await conn.fetchval(
                "SELECT 1 FROM daily_reports WHERE report_date = $1::date",
                date_str,
            )
            if row:
                return True
    except Exception as e:
        logger.warning("PG daily_reports query failed, falling back to MongoDB: %s", e)

    mongo_collection = _resolve_reports_collection()
    if mongo_collection:
        try:
            report = await mongo_collection.find_one({"date": date_str})
            return report is not None
        except Exception as e:
            logger.warning("MongoDB reports query failed: %s", e)

    return False


async def _run_event_detection(hours: int = 24):
    """Trigger event detection pipeline."""
    try:
        from analysis.event_detector import EventDetector
        detector = EventDetector()
        events = await detector.detect_events(hours=hours)
        await detector.close()
        logger.info("Event detection complete: %d events", len(events))
    except Exception as e:
        logger.error("Event detection failed: %s", e)


async def _run_impact_analysis():
    """Trigger impact/relationship analysis pipeline."""
    try:
        from analysis.impact_analyzer import ImpactAnalyzer
        analyzer = ImpactAnalyzer()
        await analyzer.run_full_analysis()
        await analyzer.close()
        logger.info("Impact analysis complete")
    except Exception as e:
        logger.error("Impact analysis failed: %s", e)


async def _run_report_generation(date_str: str):
    """Generate a daily report for the given date string."""
    try:
        from reporting.report_generator import ReportGenerator
        generator = ReportGenerator()
        target_date = datetime.strptime(date_str, "%Y-%m-%d")
        result = await generator.generate(date=target_date)
        await generator.close()
        logger.info("Report generation complete: %s", result.get("date"))
    except Exception as e:
        logger.error("Report generation failed: %s", e)


async def daily_batch_job():
    """Execute the daily end-of-day batch processing job.

    Steps:
    1. Idempotency check - skip if report already exists
    2. Event detection (last 24h)
    3. Impact/relationship analysis
    4. Data reconciliation
    5. Report generation
    """
    logger.info("=" * 60)
    logger.info("Daily batch job started")
    logger.info("=" * 60)

    start_time = business_now()
    yesterday = business_now().replace(tzinfo=None) - timedelta(days=1)
    yesterday_str = yesterday.strftime("%Y-%m-%d")

    try:
        if await _check_report_exists(yesterday_str):
            logger.info("Report already exists for %s, skipping", yesterday_str)
            return

        logger.info("Step 1/4: Event detection")
        await _run_event_detection(hours=24)

        logger.info("Step 2/4: Impact analysis")
        await _run_impact_analysis()

        logger.info("Step 3/4: Data reconciliation")
        try:
            from utils.reconciliation import get_reconciler
            reconciler = get_reconciler()
            recon_report = await reconciler.reconcile_documents()
            logger.info(
                "Reconciliation complete: compliance %.2f%%",
                recon_report.get("compliance_score", 0) * 100,
            )
        except Exception as e:
            logger.warning("Data reconciliation failed (non-blocking): %s", e)

        logger.info("Step 4/4: Report generation")
        await _run_report_generation(yesterday_str)

        duration = (business_now() - start_time).total_seconds()
        logger.info("Daily batch job complete (elapsed: %.1fs)", duration)

    except Exception as e:
        logger.error("Daily batch job failed: %s", e, exc_info=True)


def create_scheduler() -> AsyncIOScheduler:
    """Create and configure the APScheduler with daily batch job."""
    global scheduler
    sched = AsyncIOScheduler(timezone="Asia/Shanghai")

    sched.add_job(
        daily_batch_job,
        trigger=CronTrigger(hour=8, minute=0),
        id="daily_batch_job",
        name="Daily batch job",
        replace_existing=True,
        misfire_grace_time=3600,
    )

    logger.info("Scheduler created: daily batch at 08:00 CST")
    scheduler = sched
    return sched


def stop_scheduler():
    """Shut down the scheduler gracefully."""
    global scheduler
    if scheduler:
        scheduler.shutdown()
        scheduler = None
        logger.info("Scheduler stopped")


def get_scheduler_running() -> bool:
    """Return whether the scheduler is currently running."""
    return scheduler is not None and scheduler.running
