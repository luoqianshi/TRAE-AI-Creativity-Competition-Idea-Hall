"""OpenTelemetry 全链路追踪配置

trace_id 贯穿 collector → redis_stream → bytewax → es/chroma
    → entity_consumer → neo4j → event_detector → report

环境变量:
    OTEL_ENABLED: 是否启用 (默认 false)
    OTEL_SERVICE_NAME: 服务名 (默认 omnilog)
    OTEL_EXPORTER_OTLP_ENDPOINT: OTLP endpoint
        (默认 http://otel-collector:4318/v1/traces)
"""

import logging
import os
from contextlib import contextmanager
from typing import Optional

try:
    from opentelemetry import trace
    from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
    from opentelemetry.sdk.resources import SERVICE_NAME, Resource
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    _OTEL_AVAILABLE = True
except ImportError:
    trace = None
    OTLPSpanExporter = None
    SERVICE_NAME = None
    Resource = None
    TracerProvider = None
    BatchSpanProcessor = None
    _OTEL_AVAILABLE = False

logger = logging.getLogger(__name__)

_tracer_provider: Optional[TracerProvider] = None
_initialized = False


def init_tracing(service_name: str = "omnilog") -> Optional[TracerProvider]:
    """初始化 OpenTelemetry 追踪

    默认不启用,需设置 OTEL_ENABLED=true 才会启用,避免影响现有部署.

    Args:
        service_name: 默认服务名(可被 OTEL_SERVICE_NAME 覆盖)

    Returns:
        TracerProvider 实例;未启用时返回 None
    """
    global _tracer_provider, _initialized

    if _initialized:
        return _tracer_provider

    enabled = os.getenv("OTEL_ENABLED", "false").lower() == "true"
    if not enabled:
        # [cleanup] logger.info("OpenTelemetry 追踪未启用 (设置 OTEL_ENABLED=true 启用)")
        _initialized = True
        return None

    service = os.getenv("OTEL_SERVICE_NAME", service_name)
    endpoint = os.getenv(
        "OTEL_EXPORTER_OTLP_ENDPOINT",
        "http://otel-collector:4318/v1/traces",
    )

    resource = Resource.create({SERVICE_NAME: service})
    _tracer_provider = TracerProvider(resource=resource)

    exporter = OTLPSpanExporter(endpoint=endpoint)
    _tracer_provider.add_span_processor(BatchSpanProcessor(exporter))
    trace.set_tracer_provider(_tracer_provider)

    # [cleanup] logger.info(f"OpenTelemetry 追踪已启用: service={service}, endpoint={endpoint}")
    _initialized = True
    return _tracer_provider


def get_tracer(name: str = "omnilog"):
    """Get a tracer, or a no-op if OTEL is unavailable."""
    if _OTEL_AVAILABLE and trace is not None:
        return trace.get_tracer(name)
    from contextlib import nullcontext
    return nullcontext()


def shutdown_tracing():
    """关闭追踪,刷新剩余 span"""
    global _tracer_provider
    if _tracer_provider:
        _tracer_provider.shutdown()
        # [cleanup] logger.info("OpenTelemetry 追踪已关闭")


@contextmanager
def span(name: str, attributes: dict = None):
    """创建一个 span 的便捷上下文管理器

    用法:
        with span("collect_rss", {"source": "tech_news"}) as s:
            # 业务逻辑
            pass

    Args:
        name: span 名称
        attributes: span 属性字典(值会被转为字符串)
    """
    if not _OTEL_AVAILABLE:
        yield None
        return
    tracer = get_tracer()
    with tracer.start_as_current_span(name) as s:
        if attributes:
            for k, v in attributes.items():
                s.set_attribute(k, str(v))
        yield s


def inject_trace_context(carrier: dict) -> str:
    """将当前 trace context 注入到 carrier(用于跨服务传递)

    Args:
        carrier: 承载上下文的字典(如 Redis Stream 消息字段)

    Returns:
        trace_id 字符串(32 位十六进制),用于日志关联;
        若当前无活跃 span 则返回空串
    """
    from opentelemetry.propagate import inject

    inject(carrier)
    current = trace.get_current_span()
    if current and current.is_recording():
        ctx = current.get_span_context()
        return f"{ctx.trace_id:032x}"
    return ""


def extract_trace_context(carrier: dict):
    """从 carrier 提取 trace context

    Args:
        carrier: 承载上下文的字典(如 Redis Stream 消息字段)

    Returns:
        Context 对象,可作为新 span 的父上下文
    """
    from opentelemetry.propagate import extract

    return extract(carrier)
