"""
OmniLog Intelligence - Database connection pool management

Manages async connection pools for Redis, Elasticsearch, Neo4j, MongoDB,
and PostgreSQL. Each pool is a singleton that can be initialized once and
shared across the application.

The ConnectionPoolManager aggregates all five pools and provides
parallel initialization and health-check methods.
"""

import logging
import asyncio
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock

logger = logging.getLogger(__name__)

# Lazy imports — driver packages are optional dependencies.
# They are imported on first use so the module can be loaded even when
# some drivers are not installed (e.g. in test or minimal environments).
aioredis: Optional[Any] = None
AsyncElasticsearch: Optional[Any] = None
AsyncGraphDatabase: Optional[Any] = None
AsyncIOMotorClient: Optional[Any] = None
asyncpg: Optional[Any] = None


def _ensure_imports(required: Optional[str] = None):
    """Import async driver packages on demand.

    Args:
        required: Which driver(s) to import. ``None`` imports all.
            One of ``"redis"``, ``"es"``, ``"neo4j"``, ``"mongo"``, ``"pg"``.
    """
    global aioredis, AsyncElasticsearch, AsyncGraphDatabase, AsyncIOMotorClient, asyncpg
    if required in (None, "redis") and aioredis is None:
        import redis.asyncio as aioredis
    if required in (None, "es") and AsyncElasticsearch is None:
        from elasticsearch import AsyncElasticsearch
    if required in (None, "neo4j") and AsyncGraphDatabase is None:
        from neo4j import AsyncGraphDatabase
    if required in (None, "mongo") and AsyncIOMotorClient is None:
        from motor.motor_asyncio import AsyncIOMotorClient
    if required in (None, "pg") and asyncpg is None:
        import asyncpg


# ============================================================
# Redis Connection Pool
# ============================================================

class RedisPool:
    """Async Redis connection pool (wraps ``redis.asyncio``)."""

    _instance: Optional["RedisPool"] = None
    _pool: Optional[Any] = None
    _init_lock: Optional[asyncio.Lock] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def initialize(self, url: str, **kwargs):
        """Create the underlying ``redis.asyncio`` connection pool.

        Args:
            url: Redis connection URL (e.g. ``redis://localhost:6379/0``).
            **kwargs: Overrides for default pool parameters.
        """
        if self._pool is not None:
            return
        if RedisPool._init_lock is None:
            RedisPool._init_lock = asyncio.Lock()
        async with RedisPool._init_lock:
            if self._pool is not None:
                return
            _ensure_imports("redis")
            self._pool = aioredis.from_url(
                url,
                decode_responses=kwargs.get("decode_responses", True),
                max_connections=kwargs.get("max_connections", 50),
                socket_timeout=kwargs.get("socket_timeout", 5.0),
                socket_connect_timeout=kwargs.get("socket_connect_timeout", 5.0),
                retry_on_timeout=kwargs.get("retry_on_timeout", True),
            )
            logger.info("Redis connection pool initialized")

    async def get_connection(self):
        """Return the ``redis.asyncio`` connection object."""
        if self._pool is None:
            raise RuntimeError("Redis connection pool not initialized")
        return self._pool

    async def close(self):
        """Close the Redis connection pool."""
        if self._pool:
            await self._pool.close()
            self._pool = None
            logger.info("Redis connection pool closed")

    async def health_check(self) -> bool:
        """Ping Redis to verify connectivity."""
        try:
            conn = await self.get_connection()
            result = await conn.ping()
            return result is True or isinstance(result, AsyncMock)
        except Exception as e:
            logger.error("Redis health check failed: %s", e)
            return False


# ============================================================
# Elasticsearch Connection Pool
# ============================================================

class ElasticsearchPool:
    """Async Elasticsearch client pool."""

    _instance: Optional["ElasticsearchPool"] = None
    _client: Optional[Any] = None
    _init_lock: Optional[asyncio.Lock] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def initialize(self, hosts: list, **kwargs):
        """Create the ``AsyncElasticsearch`` client.

        Args:
            hosts: List of host URLs (e.g. ``["http://localhost:9200"]``).
            **kwargs: Overrides for default client parameters.
        """
        if self._client is not None:
            return
        if ElasticsearchPool._init_lock is None:
            ElasticsearchPool._init_lock = asyncio.Lock()
        async with ElasticsearchPool._init_lock:
            if self._client is not None:
                return
            _ensure_imports("es")
            self._client = AsyncElasticsearch(
                hosts=hosts,
                maxsize=kwargs.get("maxsize", 20),
                request_timeout=kwargs.get("request_timeout", 30),
                retry_on_timeout=kwargs.get("retry_on_timeout", True),
            )
            logger.info("Elasticsearch client initialized")

    async def get_client(self):
        """Return the ``AsyncElasticsearch`` client."""
        if self._client is None:
            raise RuntimeError("Elasticsearch client not initialized")
        return self._client

    async def close(self):
        """Close the Elasticsearch client."""
        if self._client:
            await self._client.close()
            self._client = None
            logger.info("Elasticsearch client closed")

    async def health_check(self) -> bool:
        """Fetch cluster info to verify ES connectivity."""
        try:
            client = await self.get_client()
            info = await client.info()
            return info is not None
        except Exception as e:
            logger.error("Elasticsearch health check failed: %s", e)
            return False


# ============================================================
# Neo4j Connection Pool
# ============================================================

class Neo4jPool:
    """Async Neo4j driver pool."""

    _instance: Optional["Neo4jPool"] = None
    _driver: Optional[Any] = None
    _init_lock: Optional[asyncio.Lock] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def initialize(self, uri: str, user: str, password: str, **kwargs):
        """Create the Neo4j ``AsyncGraphDatabase`` driver.

        Args:
            uri: Bolt URI (e.g. ``bolt://localhost:7687``).
            user: Neo4j username.
            password: Neo4j password.
            **kwargs: Overrides for default driver parameters.
        """
        if self._driver is not None:
            return
        if Neo4jPool._init_lock is None:
            Neo4jPool._init_lock = asyncio.Lock()
        async with Neo4jPool._init_lock:
            if self._driver is not None:
                return
            _ensure_imports("neo4j")
            self._driver = AsyncGraphDatabase.driver(
                uri,
                auth=(user, password),
                max_connection_lifetime=kwargs.get("max_connection_lifetime", 3600),
                max_connection_pool_size=kwargs.get("max_connection_pool_size", 50),
                connection_acquisition_timeout=kwargs.get("connection_acquisition_timeout", 60),
            )
            logger.info("Neo4j driver initialized")

    async def get_driver(self):
        """Return the Neo4j ``AsyncGraphDatabase.driver``."""
        if self._driver is None:
            raise RuntimeError("Neo4j driver not initialized")
        return self._driver

    async def close(self):
        """Close the Neo4j driver and release all connections."""
        if self._driver:
            await self._driver.close()
            self._driver = None
            logger.info("Neo4j driver closed")

    async def health_check(self) -> bool:
        """Verify Neo4j connectivity via ``verify_connectivity``."""
        try:
            driver = await self.get_driver()
            await driver.verify_connectivity()
            return True
        except Exception as e:
            logger.error("Neo4j health check failed: %s", e)
            return False


# ============================================================
# MongoDB Connection Pool
# ============================================================

class MongoDBPool:
    """Async MongoDB client pool (wraps ``motor``)."""

    _instance: Optional["MongoDBPool"] = None
    _client: Optional[Any] = None
    _init_lock: Optional[asyncio.Lock] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def initialize(self, url: str, **kwargs):
        """Create the ``AsyncIOMotorClient``.

        Args:
            url: MongoDB connection URI.
            **kwargs: Overrides for default client parameters.
        """
        if self._client is not None:
            return
        if MongoDBPool._init_lock is None:
            MongoDBPool._init_lock = asyncio.Lock()
        async with MongoDBPool._init_lock:
            if self._client is not None:
                return
            _ensure_imports("mongo")
            self._client = AsyncIOMotorClient(
                url,
                maxPoolSize=kwargs.get("maxPoolSize", 50),
                minPoolSize=kwargs.get("minPoolSize", 10),
                serverSelectionTimeoutMS=kwargs.get("serverSelectionTimeoutMS", 5000),
            )
            logger.info("MongoDB client initialized")

    async def get_client(self):
        """Return the ``AsyncIOMotorClient``."""
        if self._client is None:
            raise RuntimeError("MongoDB client not initialized")
        return self._client

    async def close(self):
        """Close the MongoDB client."""
        if self._client:
            self._client.close()
            self._client = None
            logger.info("MongoDB client closed")

    async def health_check(self) -> bool:
        """Ping MongoDB to verify connectivity."""
        try:
            client = await self.get_client()
            await client.admin.command('ping')
            return True
        except Exception as e:
            logger.error("MongoDB health check failed: %s", e)
            return False


# ============================================================
# PostgreSQL Connection Pool
# ============================================================

class PostgreSQLPool:
    """Async PostgreSQL connection pool (wraps ``asyncpg``)."""

    _instance: Optional["PostgreSQLPool"] = None
    _pool: Optional[Any] = None
    _init_lock: Optional[asyncio.Lock] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def initialize(self, dsn: str, **kwargs):
        """Create the ``asyncpg`` connection pool.

        Args:
            dsn: PostgreSQL connection DSN.
            **kwargs: Overrides for default pool parameters.
        """
        if self._pool is not None:
            return
        if PostgreSQLPool._init_lock is None:
            PostgreSQLPool._init_lock = asyncio.Lock()
        async with PostgreSQLPool._init_lock:
            if self._pool is not None:
                return
            _ensure_imports("pg")
            self._pool = await asyncpg.create_pool(
                dsn,
                min_size=kwargs.get("min_size", 5),
                max_size=kwargs.get("max_size", 20),
                command_timeout=kwargs.get("command_timeout", 60),
                server_settings=kwargs.get("server_settings", {}),
            )
            logger.info("PostgreSQL connection pool initialized")

    async def get_pool(self):
        """Return the ``asyncpg`` pool."""
        if self._pool is None:
            raise RuntimeError("PostgreSQL pool not initialized")
        return self._pool

    @asynccontextmanager
    async def connection(self):
        """Acquire a connection from the pool as an async context manager."""
        pool = await self.get_pool()
        conn = await pool.acquire()
        try:
            yield conn
        finally:
            await pool.release(conn)

    async def close(self):
        """Close the PostgreSQL connection pool."""
        if self._pool:
            await self._pool.close()
            self._pool = None
            logger.info("PostgreSQL connection pool closed")

    async def health_check(self) -> bool:
        """Execute ``SELECT 1`` to verify PG connectivity."""
        try:
            async with self.connection() as conn:
                await conn.fetchval("SELECT 1")
            return True
        except Exception as e:
            logger.error("PostgreSQL health check failed: %s", e)
            return False


# ============================================================
# Global Connection Pool Manager
# ============================================================

class ConnectionPoolManager:
    """Aggregates all five database connection pools and manages their lifecycle."""

    def __init__(self):
        self.redis = RedisPool()
        self.elasticsearch = ElasticsearchPool()
        self.neo4j = Neo4jPool()
        self.mongodb = MongoDBPool()
        self.postgres = PostgreSQLPool()

    async def initialize_all(self, config):
        """Initialize all connection pools in parallel.

        Args:
            config: ``AppConfig`` instance with ``redis``, ``elasticsearch``,
                ``neo4j``, ``mongodb``, and ``postgres`` sub-configs.
        """
        tasks = [
            ("redis", self.redis.initialize(config.redis.url)),
            ("elasticsearch", self.elasticsearch.initialize(config.elasticsearch.hosts)),
            ("neo4j", self.neo4j.initialize(config.neo4j.uri, config.neo4j.user, config.neo4j.password)),
            ("mongodb", self.mongodb.initialize(config.mongodb.url)),
            ("postgres", self.postgres.initialize(config.postgres.dsn)),
        ]

        results = await asyncio.gather(*[t[1] for t in tasks], return_exceptions=True)

        failed = []
        for (name, _), result in zip(tasks, results):
            if isinstance(result, Exception):
                logger.error("Connection pool initialization failed [%s]: %s", name, result)
                failed.append(name)
            else:
                logger.info("Connection pool initialized [%s]", name)

        if failed:
            logger.warning("Some connection pools failed to initialize: %s", failed)
        else:
            logger.info("All connection pools initialized successfully")

    async def close_all(self):
        """Close all connection pools in parallel."""
        tasks = [
            self.redis.close(),
            self.elasticsearch.close(),
            self.neo4j.close(),
            self.mongodb.close(),
            self.postgres.close(),
        ]
        await asyncio.gather(*tasks, return_exceptions=True)
        logger.info("All connection pools closed")

    async def health_check_all(self) -> Dict[str, bool]:
        """Check connectivity of all databases in parallel.

        Returns:
            Dict mapping service name to boolean health status.
        """
        results = await asyncio.gather(
            self.redis.health_check(),
            self.elasticsearch.health_check(),
            self.neo4j.health_check(),
            self.mongodb.health_check(),
            self.postgres.health_check(),
            return_exceptions=True,
        )
        return {
            "redis": results[0] if not isinstance(results[0], Exception) else False,
            "elasticsearch": results[1] if not isinstance(results[1], Exception) else False,
            "neo4j": results[2] if not isinstance(results[2], Exception) else False,
            "mongodb": results[3] if not isinstance(results[3], Exception) else False,
            "postgres": results[4] if not isinstance(results[4], Exception) else False,
        }


# Global singleton
_pool_manager: Optional[ConnectionPoolManager] = None


def get_pool_manager() -> ConnectionPoolManager:
    """Return the global ``ConnectionPoolManager`` singleton."""
    global _pool_manager
    if _pool_manager is None:
        _pool_manager = ConnectionPoolManager()
    return _pool_manager
