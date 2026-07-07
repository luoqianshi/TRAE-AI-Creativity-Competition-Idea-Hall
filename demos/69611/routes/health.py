"""健康检查与系统指标端点"""

import logging
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

from services.bytewax_service import get_bytewax_running
from services.scheduler_service import get_scheduler_running
from utils.auth import verify_api_key, APIKeyInfo

logger = logging.getLogger(__name__)

router = APIRouter()

# 全局引用(由 main.py 注入,或通过 DI 容器解析)
_ingestion_scheduler = None

# /metrics 端点 Bearer Token 认证(供 Prometheus scraper 使用)
# 未配置时在 production 环境记录警告
_METRICS_TOKEN = os.getenv("METRICS_TOKEN", "")
if not _METRICS_TOKEN and os.getenv("ENVIRONMENT", "").lower() == "production":
    logger.warning(
        "生产环境未配置 METRICS_TOKEN,/metrics 端点将无认证暴露指标数据."
        "建议设置 METRICS_TOKEN 环境变量并在 Prometheus 配置 bearer_token."
    )


def set_ingestion_scheduler(sched):
    """注入采集调度器,同时注册到 DI 容器"""
    global _ingestion_scheduler
    _ingestion_scheduler = sched
    try:
        from utils.di_container import register_service
        register_service("ingestion_scheduler", sched)
    except Exception:
        pass


def _resolve_ingestion_scheduler():
    """Resolve ingestion scheduler from global or DI container"""
    global _ingestion_scheduler
    if _ingestion_scheduler is not None:
        return _ingestion_scheduler
    try:
        from utils.di_container import resolve_service
        return resolve_service("ingestion_scheduler")
    except (KeyError, ImportError):
        return None


@router.get("/health")
async def liveness():
    """Kubernetes liveness probe — lightweight check that the process is alive."""
    return {"status": "alive", "service": "omnilog-api"}


@router.get("/ready")
async def readiness():
    """Kubernetes readiness probe — checks that core components are healthy."""
    from main import get_startup_health
    health = get_startup_health()
    is_ready = health.status not in ("failed", "starting")
    return {
        "status": "ready" if is_ready else "not_ready",
        "startup_status": health.status,
        "components": dict(health.bootstrapped),
    }


@router.get("/api/health")
async def detailed_health():
    """Component-level health check (no auth required — for orchestration probes)."""
    from main import get_startup_health
    health = get_startup_health()

    # Check live connection to each DB
    db_status = {}
    try:
        from utils.db_pool import get_pool_manager
        pool = get_pool_manager()
        db_status = await pool.health_check_all()
    except Exception as e:
        db_status = {"error": str(e)}

    return {
        "status": health.status,
        "components": dict(health.bootstrapped),
        "errors": dict(health.errors),
        "database_connections": db_status,
        "scheduler_running": get_scheduler_running(),
        "bytewax_running": get_bytewax_running(),
    }


@router.get("/api/metrics")
async def get_metrics(auth: APIKeyInfo = Depends(verify_api_key)):
    """Get system metrics (auth required)"""
    from utils.db_pool import get_pool_manager

    metrics = {
        "redis_stream_length": 0,
        "es_doc_count": 0,
        "today_collected": 0,
        "active_collectors": 0,
        "success_rate": 0.0,
    }

    try:
        pool_manager = get_pool_manager()

        # Redis 队列长度
        try:
            redis_client = await pool_manager.redis.get_connection()
            stream_length = await redis_client.xlen("raw_documents")
            metrics["redis_stream_length"] = stream_length
        except Exception as e:
            logger.warning(f"查询 Redis 队列长度失败: {e}")

        # Elasticsearch 文档数
        try:
            es_client = await pool_manager.elasticsearch.get_client()
            count_result = await es_client.count(index="omnilog_docs")
            metrics["es_doc_count"] = count_result.get("count", 0)

            # 今日采集量:从 ES 查询当天 timestamp 的文档数
            today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            today_result = await es_client.count(
                index="omnilog_docs",
                body={
                    "query": {
                        "range": {"timestamp": {"gte": f"{today}||/d", "lte": f"{today}||/d"}}
                    }
                }
            )
            metrics["today_collected"] = today_result.get("count", 0)
        except Exception as es_err:
            logger.warning(f"查询 ES 今日采集量失败: {es_err}")

        # 采集器状态
        sched = _resolve_ingestion_scheduler()
        if sched:
            try:
                metrics["active_collectors"] = len(sched.get_jobs())
            except Exception as col_err:
                logger.warning(f"获取采集器数量失败: {col_err}")

        # 从 PostgreSQL 计算最近 24 小时的真实采集成功率
        # success_rate = success_runs / total_runs
        try:
            pg_pool = await pool_manager.postgres.get_pool()
            async with pg_pool.acquire() as conn:
                row = await conn.fetchrow(
                    """
                    SELECT
                        COUNT(*) FILTER (WHERE status = 'success') AS success,
                        COUNT(*) AS total
                    FROM ingestion_runs
                    WHERE start_time >= NOW() - INTERVAL '24 hours'
                    """
                )
                if row and row["total"] > 0:
                    metrics["success_rate"] = round(
                        row["success"] / row["total"] * 100, 2
                    )
                else:
                    metrics["success_rate"] = 0.0
        except Exception as pg_err:
            logger.warning(f"计算采集成功率失败: {pg_err}")
            metrics["success_rate"] = 0.0

    except Exception as e:
        logger.error(f"获取指标失败: {e}")

    return metrics
