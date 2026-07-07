"""OmniLog Intelligence 采集器模块"""

from collectors.base import BaseCollector, RawDocument
from collectors.registry import CollectorRegistry, get_registry
from collectors.loader import (
    load_yaml_config,
    register_collectors_from_config,
    register_collector_type,
    auto_discover_collectors,
)
from collectors.rss_collector import RSSCollector

__all__ = [
    # 基础类
    "BaseCollector",
    "RawDocument",
    # 注册表
    "CollectorRegistry",
    "get_registry",
    # 配置加载
    "load_yaml_config",
    "register_collectors_from_config",
    "register_collector_type",
    "auto_discover_collectors",
    # 具体采集器
    "RSSCollector",
]
