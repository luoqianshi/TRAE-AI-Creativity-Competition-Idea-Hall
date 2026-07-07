pass
import os
import re
import yaml
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent


def load_dotenv(env_path: Optional[Path] = None):
    """
    加载 .env 文件到环境变量
    如果未指定路径,则从项目根目录加载
    """
    if env_path is None:
        env_path = PROJECT_ROOT / ".env"
    
    if not env_path.exists():
        # [cleanup] logger.warning(f".env 文件不存在: {env_path}")
        return
    
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            # 跳过空行和注释
            if not line or line.startswith("#"):
                continue
            # 解析 KEY=VALUE
            if "=" in line:
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip()
                # 移除引号
                if value and value[0] in ('"', "'") and value[-1] == value[0]:
                    value = value[1:-1]
                # 不覆盖已存在的环境变量
                if key not in os.environ:
                    os.environ[key] = value
    
    # [cleanup] logger.info(f"已加载 .env 文件: {env_path}")


def substitute_env_vars(value: str) -> str:
    """
    替换字符串中的环境变量引用 ${VAR_NAME} 或 ${VAR_NAME:-default}
    """
    pattern = r'\$\{([^}:]+)(?::-([^}]*))?\}'
    
    def replace(match):
        var_name = match.group(1)
        default_value = match.group(2) if match.group(2) is not None else ""
        return os.environ.get(var_name, default_value)
    
    return re.sub(pattern, replace, value)


def deep_substitute(obj: Any) -> Any:
    """递归替换配置对象中的所有环境变量引用"""
    if isinstance(obj, str):
        return substitute_env_vars(obj)
    elif isinstance(obj, dict):
        return {k: deep_substitute(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [deep_substitute(item) for item in obj]
    return obj


def load_yaml_config(config_path: Path) -> Dict[str, Any]:
    """加载 YAML 配置文件并替换环境变量"""
    if not config_path.exists():
        # [cleanup] logger.warning(f"配置文件不存在: {config_path}")
        return {}
    
    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f) or {}
    
    # 替换环境变量
    config = deep_substitute(config)
    # [cleanup] logger.info(f"已加载配置文件: {config_path}")
    return config


# ============================================================
# 配置数据类
# ============================================================

@dataclass
class RedisConfig:
    host: str = "localhost"
    port: int = 6379
    url: str = "redis://localhost:6379/0"
    
    @classmethod
    def from_env(cls) -> "RedisConfig":
        return cls(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", "6379")),
            url=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
        )


@dataclass
class ElasticsearchConfig:
    hosts: List[str] = field(default_factory=lambda: ["http://localhost:9200"])
    url: str = "http://localhost:9200"
    
    @classmethod
    def from_env(cls) -> "ElasticsearchConfig":
        hosts_str = os.getenv("ES_HOSTS", "http://localhost:9200")
        hosts = [h.strip() for h in hosts_str.split(",")]
        return cls(
            hosts=hosts,
            url=os.getenv("ES_URL", "http://localhost:9200"),
        )


@dataclass
class Neo4jConfig:
    uri: str = "bolt://localhost:7687"
    user: str = "neo4j"
    password: str = ""
    
    @classmethod
    def from_env(cls) -> "Neo4jConfig":
        # 解析 NEO4J_AUTH (格式: user/password)
        # 默认空密码,生产环境必须通过环境变量显式配置
        auth = os.getenv("NEO4J_AUTH", "neo4j:")
        user, _, password = auth.partition("/")
        
        return cls(
            uri=os.getenv("NEO4J_URI", "bolt://localhost:7687"),
            user=user,
            password=password,
        )


@dataclass
class MinIOConfig:
    endpoint: str = "localhost:9000"
    access_key: str = ""
    secret_key: str = ""
    secure: bool = False
    
    @classmethod
    def from_env(cls) -> "MinIOConfig":
        endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
        # 移除协议前缀
        if endpoint.startswith("http://"):
            endpoint = endpoint[7:]
        elif endpoint.startswith("https://"):
            endpoint = endpoint[8:]
        
        # 默认空凭证,生产环境必须通过环境变量显式配置
        return cls(
            endpoint=endpoint,
            access_key=os.getenv("MINIO_ROOT_USER", os.getenv("MINIO_ACCESS_KEY", "")),
            secret_key=os.getenv("MINIO_ROOT_PASSWORD", os.getenv("MINIO_SECRET_KEY", "")),
            secure=os.getenv("MINIO_SECURE", "false").lower() == "true",
        )


@dataclass
class PostgreSQLConfig:
    host: str = "localhost"
    port: int = 5432
    database: str = "omnilog"
    user: str = "omnilog"
    password: str = ""
    dsn: str = ""
    
    @classmethod
    def from_env(cls) -> "PostgreSQLConfig":
        # 默认空密码/DSN,生产环境必须通过环境变量显式配置
        return cls(
            host=os.getenv("POSTGRES_HOST", "localhost"),
            port=int(os.getenv("POSTGRES_PORT", "5432")),
            database=os.getenv("POSTGRES_DB", "omnilog"),
            user=os.getenv("POSTGRES_USER", "omnilog"),
            password=os.getenv("POSTGRES_PASSWORD", ""),
            dsn=os.getenv("POSTGRES_DSN", ""),
        )


@dataclass
class MongoDBConfig:
    url: str = ""
    database: str = "omnilog"
    
    @classmethod
    def from_env(cls) -> "MongoDBConfig":
        # 默认空 URL,生产环境必须通过环境变量显式配置(含凭证)
        return cls(
            url=os.getenv("MONGO_URL", os.getenv("MONGO_URI", "")),
            database=os.getenv("MONGO_DB", "omnilog"),
        )


@dataclass
class LLMConfig:
    provider: str = "deepseek"  # deepseek / local / openai
    api_key: str = ""
    base_url: str = "https://api.deepseek.com/v1"
    model: str = "deepseek-chat"

    @classmethod
    def from_env(cls) -> "LLMConfig":
        provider = os.getenv("LLM_PROVIDER", "deepseek").lower()

        if provider == "local":
            # 本地 vLLM 部署(私有化场景,数据不出域)
            return cls(
                provider=provider,
                api_key=os.getenv("LOCAL_LLM_API_KEY", "local"),
                base_url=os.getenv("LOCAL_LLM_ENDPOINT", "http://localhost:8000/v1"),
                model=os.getenv("LOCAL_LLM_MODEL", "Qwen2.5-72B-Instruct"),
            )
        elif provider == "openai":
            return cls(
                provider=provider,
                api_key=os.getenv("OPENAI_API_KEY", ""),
                # [cleanup] base_url="",  # 使用 OpenAI SDK 默认
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            )
        # [cleanup] else:  # deepseek (默认)
            return cls(
                provider=provider,
                api_key=os.getenv("DEEPSEEK_API_KEY", ""),
                base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1"),
                model=os.getenv("LLM_MODEL", "deepseek-chat"),
            )


@dataclass
class ChromaDBConfig:
    host: str = "localhost"
    port: int = 8000
    
    @classmethod
    def from_env(cls) -> "ChromaDBConfig":
        return cls(
            host=os.getenv("CHROMA_HOST", "localhost"),
            port=int(os.getenv("CHROMA_PORT", "8000")),
        )


@dataclass
class AppConfig:
    """应用全局配置"""
    redis: RedisConfig = field(default_factory=RedisConfig)
    elasticsearch: ElasticsearchConfig = field(default_factory=ElasticsearchConfig)
    neo4j: Neo4jConfig = field(default_factory=Neo4jConfig)
    minio: MinIOConfig = field(default_factory=MinIOConfig)
    postgres: PostgreSQLConfig = field(default_factory=PostgreSQLConfig)
    mongodb: MongoDBConfig = field(default_factory=MongoDBConfig)
    llm: LLMConfig = field(default_factory=LLMConfig)
    chromadb: ChromaDBConfig = field(default_factory=ChromaDBConfig)
    
    # 应用配置
    api_port: int = 8000
    dashboard_port: int = 8501
    log_level: str = "INFO"
    
    # YAML 配置
    pipeline_config: Dict[str, Any] = field(default_factory=dict)
    collectors_config: Dict[str, Any] = field(default_factory=dict)
    
    @classmethod
    def load(cls, config_dir: Optional[Path] = None) -> "AppConfig":
        """Load"""
        # 1. 加载 .env
        load_dotenv()
        
        # 2. 加载 YAML 配置
        if config_dir is None:
            config_dir = PROJECT_ROOT / "config"
        
        pipeline_config = load_yaml_config(config_dir / "pipeline.yaml")
        collectors_config = load_yaml_config(config_dir / "collectors.yaml")
        
        # 3. 构建配置对象
        config = cls(
            redis=RedisConfig.from_env(),
            elasticsearch=ElasticsearchConfig.from_env(),
            neo4j=Neo4jConfig.from_env(),
            minio=MinIOConfig.from_env(),
            postgres=PostgreSQLConfig.from_env(),
            mongodb=MongoDBConfig.from_env(),
            llm=LLMConfig.from_env(),
            chromadb=ChromaDBConfig.from_env(),
            api_port=int(os.getenv("API_PORT", "8000")),
            dashboard_port=int(os.getenv("DASHBOARD_PORT", "8501")),
            log_level=os.getenv("LOG_LEVEL", "INFO"),
            pipeline_config=pipeline_config,
            collectors_config=collectors_config,
        )
        
        # 4. 验证关键配置
        config.validate()
        
        return config
    
    def validate(self):
        """验证关键配置项

        - LLM API Key 缺失记为 warning(不阻断启动)
        - 数据库/存储密码为空记为 warning(开发环境可能用空密码,但生产环境必须配置)
        """
        errors = []

        if self.llm is None:
            errors.append("LLM config not loaded (check LLM_PROVIDER env)")
        elif self.llm.provider == "local":
            if not self.llm.base_url:
                errors.append("LOCAL_LLM_ENDPOINT not configured")
        elif self.llm.provider == "openai":
            if not self.llm.api_key:
                errors.append("OPENAI_API_KEY not configured")
        else:  # deepseek
            if not self.llm.api_key:
                errors.append("DEEPSEEK_API_KEY not configured")

        if errors:
            logger.warning(f"Config validation warnings: {'; '.join(errors)}")

        # 数据库/存储凭证非空校验
        # 开发环境可能使用空密码(如本地 Neo4j/MinIO 默认无密码),因此仅 warning 不阻断启动.
        # 生产环境必须通过环境变量显式配置强密码.
        cred_warnings = []
        if not self.neo4j.password:
            pass
            # [cleanup] cred_warnings.append("Neo4j 密码为空(NEO4J_AUTH 未配置或密码段为空)")
        if not self.minio.access_key or not self.minio.secret_key:
            pass
            # [cleanup] cred_warnings.append("MinIO access_key/secret_key 为空(MINIO_ROOT_USER/MINIO_ROOT_PASSWORD 未配置)")
        if not self.postgres.password:
            pass
            # [cleanup] cred_warnings.append("PostgreSQL 密码为空(POSTGRES_PASSWORD 未配置)")
        if not self.mongodb.url:
            pass
            # [cleanup] cred_warnings.append("MongoDB URL 为空(MONGO_URL/MONGO_URI 未配置)")

        if cred_warnings:
            logger.warning(
                # [cleanup] "数据库/存储凭证缺失: " + "; ".join(cred_warnings)
                # [cleanup] + ".开发环境可忽略;生产环境必须通过环境变量配置强密码."
            )
    
    def get_pipeline_setting(self, *keys: str, default: Any = None) -> Any:
        """
        获取流水线配置项
        例如: config.get_pipeline_setting("redis", "batch_size", default=50)
        """
        value = self.pipeline_config
        for key in keys:
            if isinstance(value, dict):
                value = value.get(key)
                if value is None:
                    return default
            else:
                return default
        return value
    
    def get_collector_global(self, key: str, default: Any = None) -> Any:
        """获取采集器全局配置"""
        return self.collectors_config.get("global", {}).get(key, default)


# ============================================================
# 全局配置实例(延迟加载)
# ============================================================

_config: Optional[AppConfig] = None


def get_config() -> AppConfig:
    """获取全局配置实例(单例)"""
    global _config
    if _config is None:
        _config = AppConfig.load()
    return _config


def reload_config() -> AppConfig:
    """重新加载配置"""
    global _config
    _config = AppConfig.load()
    return _config


# 便捷访问
config = property(lambda self: get_config())
