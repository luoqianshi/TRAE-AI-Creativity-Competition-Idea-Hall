"""pytest 全局配置

在测试收集前 mock 掉重量级可选依赖,使纯单元测试能在缺少
elasticsearch / opentelemetry / neo4j / sentence-transformers 等可选依赖的环境下运行.

# [removed garbled text]
这样包的 __init__.py 能正常执行,子模块导入也能正常工作.
"""

import sys
from unittest.mock import MagicMock

# Mock 重量级可选第三方库(reporting/analysis/__init__.py 会 import 它们)
_heavy_modules = [
    "elasticsearch",
    "elasticsearch._async.client",
    "neo4j",
    "neo4j.async_graph",
    "opentelemetry",
    "opentelemetry.trace",
    "opentelemetry.sdk.trace",
    "opentelemetry.sdk.resources",
    "opentelemetry.exporter.otlp.proto.grpc.trace_exporter",
    "motor",
    "motor.motor_asyncio",
    "minio",
    "sklearn",
    "sklearn.cluster",
    "sklearn.linear_model",
    "sklearn.feature_extraction.text",
    "transformers",
    "feedparser",
    "aiohttp",
    "chromadb",
    "asyncpg",
]

for _mod in _heavy_modules:
    if _mod not in sys.modules:
        sys.modules[_mod] = MagicMock()

# sentence_transformers: mock 为导入即抛 ImportError,使 embedding.py 走 hash 降级
class _STMock:
    def __init__(self, *args, **kwargs):
        raise ImportError("sentence_transformers not installed in test env")

sys.modules.setdefault("sentence_transformers", _STMock)

# langdetect: 提供可配置的 mock
_langdetect_mock = MagicMock()
class _LangDetectException(Exception):
    pass
_langdetect_mock.LangDetectException = _LangDetectException
_langdetect_mock.DetectorFactory = MagicMock()

def _detect(text):
    # 简单启发式:含中文字符返回 zh-cn,否则返回 en
    for ch in text:
        if "\u4e00" <= ch <= "\u9fff":
            return "zh-cn"
    return "en"
_langdetect_mock.detect = _detect
sys.modules.setdefault("langdetect", _langdetect_mock)

# redis: 使用真实 redis.asyncio(fakeredis 依赖它),仅在未安装时 mock
try:
    import redis.asyncio  # noqa: F401
except ImportError:
    sys.modules.setdefault("redis", MagicMock())
    sys.modules.setdefault("redis.asyncio", MagicMock())

# utils.tracing 依赖 opentelemetry,注入轻量 span 上下文管理器
_tracing_mock = MagicMock()


@_tracing_mock.contextmanager
def _span(*args, **kwargs):
    yield MagicMock()


_tracing_mock.span = _span
sys.modules["utils.tracing"] = _tracing_mock

# 预导入 reporting 和 analysis 包,使其在 sys.modules 中注册为真实包,
# 避免 test_distributed_reliability.py 的 sys.modules.setdefault("analysis", MagicMock())
# 将其覆盖为 MagicMock(导致后续 test_source_merger.py 等无法导入子模块).
try:
    import reporting  # noqa: F401
except Exception:
    pass
try:
    import analysis  # noqa: F401
except Exception:
    pass
