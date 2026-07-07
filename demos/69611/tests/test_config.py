"""测试配置管理模块"""

import os
from config import get_config, reload_config, substitute_env_vars


class TestConfig:
    """配置管理测试"""

    def test_substitute_env_vars(self):
        """测试环境变量替换"""
        os.environ["TEST_VAR"] = "test_value"
        result = substitute_env_vars("prefix_${TEST_VAR}_suffix")
        assert result == "prefix_test_value_suffix"
        del os.environ["TEST_VAR"]

    def test_substitute_env_vars_with_default(self):
        """测试带默认值的环境变量替换"""
        result = substitute_env_vars("${NONEXISTENT_VAR:-default_value}")
        assert result == "default_value"

    def test_get_config_singleton(self):
        """测试配置单例"""
        config1 = get_config()
        config2 = get_config()
        assert config1 is config2

    def test_reload_config(self):
        """测试配置重载"""
        config1 = get_config()
        config2 = reload_config()
        assert config1 is not config2

    def test_config_structure(self):
        """测试配置结构完整性"""
        config = get_config()

        # 检查主要配置块 — 对齐 AppConfig 实际属性
        assert hasattr(config, "redis")
        assert hasattr(config, "elasticsearch")
        assert hasattr(config, "neo4j")
        assert hasattr(config, "minio")
        assert hasattr(config, "postgres")
        assert hasattr(config, "mongodb")
        assert hasattr(config, "llm")
        assert hasattr(config, "chromadb")
        assert hasattr(config, "pipeline_config")
        assert hasattr(config, "collectors_config")

    def test_redis_config(self):
        """测试 Redis 配置"""
        config = get_config()
        assert config.redis.host
        assert config.redis.port > 0
        assert config.redis.url

    def test_elasticsearch_config(self):
        """测试 Elasticsearch 配置"""
        config = get_config()
        assert config.elasticsearch.hosts
        assert len(config.elasticsearch.hosts) > 0

    def test_neo4j_config(self):
        """测试 Neo4j 配置"""
        config = get_config()
        assert config.neo4j.uri
        assert config.neo4j.user

    def test_llm_config(self):
        """测试 LLM 配置"""
        config = get_config()
        assert config.llm.base_url
        assert config.llm.model

    def test_pipeline_config_yaml(self):
        """测试流水线 YAML 配置"""
        config = get_config()
        assert isinstance(config.pipeline_config, dict)

    def test_collectors_config_yaml(self):
        """测试采集器 YAML 配置"""
        config = get_config()
        assert isinstance(config.collectors_config, dict)

    def test_get_pipeline_setting(self):
        """测试流水线配置项访问"""
        config = get_config()
        batch_size = config.get_pipeline_setting("redis", "batch_size", default=50)
        assert isinstance(batch_size, (int, type(None)))
