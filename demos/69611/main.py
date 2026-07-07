"""
OmniLog Intelligence - FastAPI application factory
"""
import asyncio
import os
from dataclasses import dataclass, field
from contextlib import asynccontextmanager
from typing import Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_config
from utils.logging import setup_logging, get_logger

setup_logging(level="INFO", log_format="text")
logger = get_logger(__name__)


_shutdown_state: dict = {
    "ingestion_scheduler": None,
    "consumer": None,
    "consumer_task": None,
    "dq_monitor": None,
    "dq_task": None,
}


# ============================================================
# Startup Health Tracker
# ============================================================

@dataclass
class StartupHealth:
    bootstrapped: Dict[str, bool] = field(default_factory=dict)
    errors: Dict[str, str] = field(default_factory=dict)
    status: str = "starting"  # starting | degraded | running | failed

    def record(self, component: str, ok: bool, error: str = "") -> None:
        self.bootstrapped[component] = ok
        if not ok and error:
            self.errors[component] = error

    def is_critical_dead(self) -> bool:
        """Critical components (pg, redis) must be running"""
        return not self.bootstrapped.get("pg", False) or not self.bootstrapped.get("redis", False)

    def summary(self) -> dict:
        return {
            "status": self.status,
            "components": dict(self.bootstrapped),
            "errors": dict(self.errors),
        }

    def degrade(self) -> None:
        if self.status == "running":
            self.status = "degraded"


_startup_health = StartupHealth()


def get_startup_health() -> StartupHealth:
    return _startup_health


def _task_done_callback(task: asyncio.Task) -> None:
    """Handle background task completion"""
    if task.cancelled():
        return
    exc = task.exception()
    if exc:
        logger.error(
            f"Background task {task.get_name()} failed: {type(exc).__name__}: {exc}",
            exc_info=exc,
        )


# ============================================================
# Startup helper functions — each wraps a startup step
# ============================================================

async def _init_tracing():
    from utils.tracing import init_tracing
    init_tracing()


async def _init_monitor():
    from utils.monitor import init_monitor, get_monitor
    from utils.di_container import register_service, get_container
    init_monitor()
    monitor = get_monitor()
    register_service("monitor", monitor)
    get_container().register_disposable(monitor)
    monitor.start()


async def _init_es_index(pool_manager):
    from scripts.init_es import INDEX_MAPPING, INDEX_SETTINGS, ES_INDEX
    es_client = await pool_manager.elasticsearch.get_client()
    if es_client and not await es_client.indices.exists(index=ES_INDEX):
        await es_client.indices.create(
            index=ES_INDEX,
            mappings=INDEX_MAPPING,
            settings=INDEX_SETTINGS
        )
        logger.info(f"ES index created: {ES_INDEX}")
    else:
        logger.info(f"ES index exists: {ES_INDEX}")


async def _init_neo4j(pool_manager):
    driver = await pool_manager.neo4j.get_driver()
    constraint_cyphers = [
        "DROP CONSTRAINT entity_name IF EXISTS",
        "CREATE CONSTRAINT entity_id_unique IF NOT EXISTS FOR (e:Entity) REQUIRE e.entity_id IS UNIQUE",
        "CREATE CONSTRAINT document_id IF NOT EXISTS FOR (d:Document) REQUIRE d.id IS UNIQUE",
        "CREATE CONSTRAINT event_id IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE",
    ]
    async with driver.session() as session:
        for cypher in constraint_cyphers:
            result = await session.run(cypher)
            await result.consume()
    logger.info("Neo4j constraints ready")


async def _init_postgres_tables(pool_manager):
    """Create all required PostgreSQL tables."""
    pg_pool = await pool_manager.postgres.get_pool()
    async with pg_pool.acquire() as conn:
        # Entity knowledge base
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS entity_knowledge_base (
                entity_id VARCHAR(64) PRIMARY KEY,
                canonical_name VARCHAR(255) NOT NULL,
                aliases JSONB NOT NULL DEFAULT '[]',
                entity_type VARCHAR(32) NOT NULL,
                description TEXT,
                description_vec JSONB,
                wikidata_id VARCHAR(32),
                source_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """)
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_entity_kb_aliases ON entity_knowledge_base USING gin (aliases)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_entity_kb_type ON entity_knowledge_base (entity_type)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_entity_kb_canonical ON entity_knowledge_base (canonical_name)")

        # Audit log
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS intelligence_audit_log (
                id VARCHAR(64) PRIMARY KEY,
                user_id VARCHAR(128) NOT NULL,
                resource_id VARCHAR(256) NOT NULL,
                action VARCHAR(32) NOT NULL,
                ip VARCHAR(64),
                classification VARCHAR(32) DEFAULT 'public',
                metadata JSONB DEFAULT '{}',
                timestamp TIMESTAMP NOT NULL,
                prev_hash VARCHAR(64),
                record_hash VARCHAR(64)
            )
        """)
        await conn.execute("ALTER TABLE intelligence_audit_log ADD COLUMN IF NOT EXISTS prev_hash VARCHAR(64)")
        await conn.execute("ALTER TABLE intelligence_audit_log ADD COLUMN IF NOT EXISTS record_hash VARCHAR(64)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_user ON intelligence_audit_log (user_id)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_resource ON intelligence_audit_log (resource_id)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON intelligence_audit_log (timestamp)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_action ON intelligence_audit_log (action)")
    logger.info("PostgreSQL tables ready")


async def _init_pgvector():
    from utils.pgvector_store import get_pgvector_store
    store = get_pgvector_store()
    await store.ensure_tables()
    logger.info("pgvector tables ready")


async def _init_mongodb(pool_manager, config):
    if not config.mongodb.url:
        raise RuntimeError("MongoDB URL not configured")
    # Access the internal client to test connectivity
    client = pool_manager.mongodb._client
    await client.admin.command('ping')
    return True


def _register_di_services(config, pool_manager, reports_collection):
    from routes.reports import set_db_clients
    set_db_clients(reports_collection)

    from services.scheduler_service import set_reports_collection
    set_reports_collection(reports_collection)

    from utils.di_container import register_service
    from utils.llm_client import LLMClient
    register_service("config", config)
    register_service("pool_manager", pool_manager)
    register_service("reports_collection", reports_collection)
    register_service("llm_client", LLMClient())
    logger.info("DI container services registered")


async def _init_ingestion_scheduler(config, pool_manager):
    from ingestion.scheduler import IngestionScheduler
    from collectors.loader import load_collectors_from_config

    load_collectors_from_config(
        extra_configs=["config/worldmonitor_feeds.yaml"]
    )

    sched = IngestionScheduler(
        redis_url=config.redis.url,
        minio_endpoint=config.minio.endpoint,
        minio_access_key=config.minio.access_key,
        minio_secret_key=config.minio.secret_key,
        postgres_dsn=config.postgres.dsn
    )
    await sched.add_all_enabled_collectors()
    await sched.start()

    from routes.health import set_ingestion_scheduler
    set_ingestion_scheduler(sched)
    from utils.di_container import register_service
    register_service("ingestion_scheduler", sched)

    _shutdown_state["ingestion_scheduler"] = sched
    logger.info("Ingestion scheduler started")


async def _start_entity_consumer():
    from analysis.consumer import EntityExtractionConsumer
    consumer = EntityExtractionConsumer()
    task = asyncio.create_task(consumer.consume(), name="entity-consumer")
    task.add_done_callback(_task_done_callback)
    logger.info("Entity extraction consumer started")
    return consumer, task


async def _init_alert_router():
    from analysis.alert_router import get_alert_router
    from utils.reconciliation import set_alert_callback
    alert_router = get_alert_router()
    set_alert_callback(alert_router.route)
    from utils.di_container import register_service
    register_service("alert_router", alert_router)
    logger.info("Reconciliation alert callback injected")


async def _start_data_quality_monitor():
    from utils.data_quality_monitor import get_data_quality_monitor
    dq_monitor = get_data_quality_monitor()
    task = asyncio.create_task(dq_monitor.start(), name="data-quality-monitor")
    task.add_done_callback(_task_done_callback)
    logger.info("Data quality monitor started")
    return dq_monitor, task


async def _try_start_background_task(name: str, label: str, coro):
    """Try starting a background task; returns the task or None on failure."""
    try:
        return await coro
    except Exception as e:
        logger.error(f"BACKGROUND TASK FAILURE: {label}: {e}. Continuing.")
        get_startup_health().degrade()
        return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    config = get_config()
    health = get_startup_health()
    state = _shutdown_state  # populated by init functions, consumed by shutdown

    # ============================================================
    # TIER 1: Critical — block startup on failure
    # ============================================================
    logger.info("Initializing database connection pools...")
    try:
        from utils.db_pool import get_pool_manager
        pool_manager = get_pool_manager()
        await pool_manager.initialize_all(config)
        health.record("redis", await pool_manager.health_check_all().get("redis", False))
        health.record("pg", await pool_manager.health_check_all().get("postgres", False))
        health.record("pool_manager", True)
        logger.info("Database connection pools initialized")
    except Exception as e:
        health.record("pool_manager", False, str(e))
        health.record("redis", False)
        health.record("pg", False)
        logger.error(f"CRITICAL: DB pool init failed: {e}")
        pool_manager = None  # No graceful degradation for DB pools

    if health.is_critical_dead():
        logger.error(
            "CRITICAL: Core database(s) unavailable (redis/pg). "
            "System cannot operate without them."
        )
        health.status = "failed"
        yield
        return

    # ============================================================
    # TIER 2: Important — degrade on failure, warn loudly
    # ============================================================
    async def _try_init(component: str, label: str, coro):
        """Try initializing a component; warns on failure, degrades health."""
        try:
            await coro
            health.record(component, True)
            return True
        except Exception as e:
            health.record(component, False, str(e))
            logger.error(f"COMPONENT FAILURE: {label}: {e}. System is in degraded mode.")
            health.degrade()
            return False

    logger.info("Initializing OpenTelemetry tracing...")
    await _try_init("tracing", "OpenTelemetry tracing",
                    _init_tracing())

    logger.info("Initializing monitoring...")
    await _try_init("monitor", "Monitoring",
                    _init_monitor())

    logger.info("Initializing Elasticsearch index...")
    await _try_init("elasticsearch", "Elasticsearch index",
                    _init_es_index(pool_manager))

    logger.info("Initializing Neo4j constraints...")
    await _try_init("neo4j", "Neo4j constraints",
                    _init_neo4j(pool_manager))

    logger.info("Initializing PostgreSQL tables...")
    await _try_init("postgres_tables", "PostgreSQL tables",
                    _init_postgres_tables(pool_manager))

    logger.info("Initializing pgvector and report tables...")
    await _try_init("pgvector", "pgvector store",
                    _init_pgvector())

    logger.info("Initializing MongoDB fallback...")
    reports_collection = None
    mongo_ok = await _try_init("mongodb", "MongoDB fallback",
                               _init_mongodb(pool_manager, config))
    if mongo_ok:
        reports_collection = pool_manager.mongodb._client[config.mongodb.database]["daily_reports"]
        try:
            await reports_collection.create_index(
                [("date", -1)], unique=True, name="idx_date_unique_desc"
            )
        except Exception as e:
            logger.warning(f"MongoDB index creation failed: {e}")

    # ============================================================
    # TIER 3: Services — optional, degrade on failure
    # ============================================================
    _register_di_services(config, pool_manager, reports_collection)

    logger.info("Initializing ingestion scheduler...")
    await _try_init("ingestion_scheduler", "Ingestion scheduler",
                    _init_ingestion_scheduler(config, pool_manager))

    logger.info("Bytewax deployed as separate omnilog-pipeline service")

    from services.scheduler_service import create_scheduler
    sched = create_scheduler()
    sched.start()
    logger.info("Daily batch scheduler started")

    # Optional background services
    bg_result = await _try_start_background_task(
        "entity-extraction", "Entity extraction consumer",
        _start_entity_consumer()
    )
    if bg_result:
        state["consumer"], state["consumer_task"] = bg_result

    await _try_init("alert_router", "Alert router / reconciliation",
                    _init_alert_router())
    dq_result = await _try_start_background_task(
        "data-quality", "Data quality monitor",
        _start_data_quality_monitor()
    )
    if dq_result:
        state["dq_monitor"], state["dq_task"] = dq_result

    health.status = "running" if not health.errors else "degraded"
    logger.info("Startup complete, status: %s", health.status)

    yield

    # Shutdown
    logger.info("Shutting down...")

    if state.get("consumer"):
        await state["consumer"].stop()
    if state.get("consumer_task"):
        state["consumer_task"].cancel()
        try:
            await state["consumer_task"]
        except asyncio.CancelledError:
            pass
        logger.info("Entity extraction consumer stopped")

    from utils.reconciliation import set_alert_callback
    set_alert_callback(None)

    if state.get("dq_task"):
        state["dq_task"].cancel()
        try:
            await state["dq_task"]
        except asyncio.CancelledError:
            pass
        logger.info("Data quality monitor stopped")

    from services.scheduler_service import stop_scheduler
    stop_scheduler()

    if state.get("ingestion_scheduler"):
        await state["ingestion_scheduler"].stop()
        logger.info("Ingestion scheduler closed")

    from services.bytewax_service import stop_bytewax
    stop_bytewax()

    from utils.monitor import get_monitor
    try:
        get_monitor().stop()
        logger.info("Monitor stopped")
    except Exception as e:
        logger.warning(f"Stop monitor failed: {e}")

    await pool_manager.close_all()
    logger.info("All services closed")

    from utils.di_container import get_container
    await get_container().dispose_all()

    from utils.tracing import shutdown_tracing
    shutdown_tracing()


# Create FastAPI app
_env = os.getenv("ENVIRONMENT", "development").lower()
_docs_enabled = os.getenv("DOCS_ENABLED", "").lower()
if _docs_enabled:
    _show_docs = _docs_enabled in ("1", "true", "yes")
else:
    _show_docs = _env != "production"

if not _show_docs:
    logger.info(f"ENVIRONMENT={_env}, /docs and /redoc disabled")

app = FastAPI(
    title="OmniLog Intelligence API",
    description="Intelligent information collection and daily deep report platform",
    version="1.0.0",
    docs_url="/docs" if _show_docs else None,
    redoc_url="/redoc" if _show_docs else None,
    openapi_url="/openapi.json" if _show_docs else None,
    lifespan=lifespan
)

_default_origins = "http://localhost:3000,http://localhost:8080,http://127.0.0.1:3000"
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", _default_origins).split(","),
    allow_credentials=True,
    allow_methods=os.getenv("CORS_METHODS", "GET,POST,PUT,DELETE,PATCH").split(","),
    allow_headers=os.getenv("CORS_HEADERS", "Content-Type,Authorization,X-API-Key").split(","),
)

cors_origins = os.getenv("CORS_ORIGINS", _default_origins).split(",")
if "*" in cors_origins:
    logger.error(
        "CORS_ORIGINS contains wildcard '*', incompatible with allow_credentials=True"
    )

# Register routes
from routes.health import router as health_router
from routes.graph import router as graph_router
from routes.search import router as search_router
from routes.audit import router as audit_router
from routes.intelligence import router as intelligence_router
from routes.history import router as history_router
from routes.subscriptions import router as subscriptions_router
from routes.reports import router as reports_router
from routes.geo import router as geo_router
from routes.briefs import router as briefs_router
from routes.query import router as query_router

app.include_router(health_router)
app.include_router(graph_router)
app.include_router(search_router)
app.include_router(audit_router, prefix="/api/intelligence")
app.include_router(intelligence_router, prefix="/api/intelligence")
app.include_router(history_router, prefix="/api")
app.include_router(subscriptions_router, prefix="/api/subscriptions")
app.include_router(reports_router)
app.include_router(geo_router)
app.include_router(briefs_router)
app.include_router(query_router)

from utils.auth import init_auth
init_auth()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
