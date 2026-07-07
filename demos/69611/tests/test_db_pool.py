"""测试数据库连接池模块"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from utils.db_pool import (
    RedisPool,
    ElasticsearchPool,
    Neo4jPool,
    MongoDBPool,
    PostgreSQLPool,
    ConnectionPoolManager,
    get_pool_manager,
)


class TestRedisPool:
    """Redis connection pool tests."""

    def test_singleton_pattern(self):
        pool1 = RedisPool()
        pool2 = RedisPool()
        assert pool1 is pool2

    @pytest.mark.asyncio
    async def test_initialize(self):
        pool = RedisPool()
        pool._pool = None
        with patch("utils.db_pool.aioredis") as mock_aioredis:
            mock_pool = Mock()
            mock_aioredis.from_url.return_value = mock_pool
            await pool.initialize("redis://localhost:6379")
            assert pool._pool == mock_pool
            mock_aioredis.from_url.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_connection(self):
        pool = RedisPool()
        mock_pool = Mock()
        pool._pool = mock_pool
        result = await pool.get_connection()
        assert result == mock_pool

    @pytest.mark.asyncio
    async def test_close(self):
        pool = RedisPool()
        mock_pool = AsyncMock()
        pool._pool = mock_pool
        await pool.close()
        assert pool._pool is None
        mock_pool.close.assert_called_once()

    @pytest.mark.asyncio
    async def test_health_check_success(self):
        pool = RedisPool()
        mock_pool = AsyncMock()
        mock_pool.ping.return_value = True
        pool._pool = mock_pool
        result = await pool.health_check()
        assert result is True

    @pytest.mark.asyncio
    async def test_health_check_failure(self):
        pool = RedisPool()
        mock_pool = AsyncMock()
        mock_pool.ping.side_effect = Exception("Connection failed")
        pool._pool = mock_pool
        result = await pool.health_check()
        assert result is False


class TestElasticsearchPool:
    """Elasticsearch connection pool tests."""

    def test_singleton_pattern(self):
        pool1 = ElasticsearchPool()
        pool2 = ElasticsearchPool()
        assert pool1 is pool2

    @pytest.mark.asyncio
    async def test_initialize(self):
        pool = ElasticsearchPool()
        pool._client = None
        with patch("utils.db_pool.AsyncElasticsearch") as mock_es:
            mock_client = Mock()
            mock_es.return_value = mock_client
            await pool.initialize(["http://localhost:9200"])
            assert pool._client == mock_client
            mock_es.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_client(self):
        pool = ElasticsearchPool()
        mock_client = Mock()
        pool._client = mock_client
        result = await pool.get_client()
        assert result == mock_client

    @pytest.mark.asyncio
    async def test_close(self):
        pool = ElasticsearchPool()
        mock_client = AsyncMock()
        pool._client = mock_client
        await pool.close()
        assert pool._client is None
        mock_client.close.assert_called_once()

    @pytest.mark.asyncio
    async def test_health_check_success(self):
        pool = ElasticsearchPool()
        mock_client = AsyncMock()
        mock_client.info.return_value = {"cluster_name": "test"}
        pool._client = mock_client
        result = await pool.health_check()
        assert result is True

    @pytest.mark.asyncio
    async def test_health_check_failure(self):
        pool = ElasticsearchPool()
        mock_client = AsyncMock()
        mock_client.info.side_effect = Exception("Connection failed")
        pool._client = mock_client
        result = await pool.health_check()
        assert result is False


class TestNeo4jPool:
    """Neo4j connection pool tests."""

    def test_singleton_pattern(self):
        pool1 = Neo4jPool()
        pool2 = Neo4jPool()
        assert pool1 is pool2

    @pytest.mark.asyncio
    async def test_initialize(self):
        pool = Neo4jPool()
        pool._driver = None
        with patch("utils.db_pool.AsyncGraphDatabase") as mock_neo4j:
            mock_driver = Mock()
            mock_neo4j.driver.return_value = mock_driver
            await pool.initialize("bolt://localhost:7687", "neo4j", "password")
            assert pool._driver == mock_driver
            mock_neo4j.driver.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_driver(self):
        pool = Neo4jPool()
        mock_driver = Mock()
        pool._driver = mock_driver
        result = await pool.get_driver()
        assert result == mock_driver

    @pytest.mark.asyncio
    async def test_close(self):
        pool = Neo4jPool()
        mock_driver = AsyncMock()
        pool._driver = mock_driver
        await pool.close()
        assert pool._driver is None
        mock_driver.close.assert_called_once()

    @pytest.mark.asyncio
    async def test_health_check_success(self):
        pool = Neo4jPool()
        mock_driver = AsyncMock()
        mock_driver.verify_connectivity.return_value = None
        pool._driver = mock_driver
        result = await pool.health_check()
        assert result is True

    @pytest.mark.asyncio
    async def test_health_check_failure(self):
        pool = Neo4jPool()
        pool._driver = None
        result = await pool.health_check()
        assert result is False


class TestPostgreSQLPool:
    """PostgreSQL connection pool tests."""

    def test_singleton_pattern(self):
        pool1 = PostgreSQLPool()
        pool2 = PostgreSQLPool()
        assert pool1 is pool2

    @pytest.mark.asyncio
    async def test_initialize(self):
        pool = PostgreSQLPool()
        pool._pool = None
        with patch("utils.db_pool.asyncpg") as mock_asyncpg:
            mock_pg_pool = AsyncMock()
            mock_asyncpg.create_pool.return_value = mock_pg_pool
            await pool.initialize("postgresql://localhost:5432/omnilog")
            assert pool._pool == mock_pg_pool
            mock_asyncpg.create_pool.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_pool(self):
        pool = PostgreSQLPool()
        mock_pool = Mock()
        pool._pool = mock_pool
        result = await pool.get_pool()
        assert result == mock_pool

    @pytest.mark.asyncio
    async def test_close(self):
        pool = PostgreSQLPool()
        mock_pool = AsyncMock()
        pool._pool = mock_pool
        await pool.close()
        assert pool._pool is None
        mock_pool.close.assert_called_once()

    @pytest.mark.asyncio
    async def test_health_check_success(self):
        pool = PostgreSQLPool()
        with patch.object(pool, "connection") as mock_conn:
            mock_conn.return_value.__aenter__.return_value.fetchval.return_value = 1
            result = await pool.health_check()
            assert result is True

    @pytest.mark.asyncio
    async def test_health_check_failure(self):
        pool = PostgreSQLPool()
        pool._pool = None
        result = await pool.health_check()
        assert result is False


class TestConnectionPoolManager:
    """ConnectionPoolManager tests."""

    @pytest.mark.asyncio
    async def test_initialize_all_partial_failure(self):
        manager = ConnectionPoolManager()
        config = Mock()
        config.redis.url = "redis://localhost:6379"
        config.elasticsearch.hosts = ["http://localhost:9200"]
        config.neo4j.uri = "bolt://localhost:7687"
        config.neo4j.user = "neo4j"
        config.neo4j.password = "password"
        config.mongodb.url = "mongodb://localhost:27017"
        config.postgres.dsn = "postgresql://localhost:5432/omnilog"

        with patch.object(manager.redis, "initialize", side_effect=Exception("Redis failed")):
            with patch.object(manager.elasticsearch, "initialize"):
                with patch.object(manager.neo4j, "initialize"):
                    with patch.object(manager.mongodb, "initialize"):
                        with patch.object(manager.postgres, "initialize"):
                            await manager.initialize_all(config)
                            assert manager.redis._pool is None

    @pytest.mark.asyncio
    async def test_health_check_all(self):
        manager = ConnectionPoolManager()
        for name in ["redis", "elasticsearch", "neo4j", "mongodb", "postgres"]:
            pool = getattr(manager, name)
            pool._pool = AsyncMock() if name == "postgres" else Mock()
            if name == "postgres":
                pool._pool = AsyncMock()
            else:
                setattr(pool, "_pool" if name != "elasticsearch" else "_client", AsyncMock())
        result = await manager.health_check_all()
        assert isinstance(result, dict)
        assert all(k in result for k in ["redis", "elasticsearch", "neo4j", "mongodb", "postgres"])

    @pytest.mark.asyncio
    async def test_initialize_and_close_cycle(self):
        manager = ConnectionPoolManager()
        with patch.object(manager.redis, "initialize"):
            with patch.object(manager.elasticsearch, "initialize"):
                with patch.object(manager.neo4j, "initialize"):
                    with patch.object(manager.mongodb, "initialize"):
                        with patch.object(manager.postgres, "initialize"):
                            await manager.initialize_all(Mock())
        with patch.object(manager.redis, "close"):
            with patch.object(manager.elasticsearch, "close"):
                with patch.object(manager.neo4j, "close"):
                    with patch.object(manager.mongodb, "close"):
                        with patch.object(manager.postgres, "close"):
                            await manager.close_all()


class TestGetPoolManager:
    """get_pool_manager singleton tests."""

    def test_singleton(self):
        p1 = get_pool_manager()
        p2 = get_pool_manager()
        assert p1 is p2

    def test_singleton_is_connection_pool_manager(self):
        pool = get_pool_manager()
        assert isinstance(pool, ConnectionPoolManager)
