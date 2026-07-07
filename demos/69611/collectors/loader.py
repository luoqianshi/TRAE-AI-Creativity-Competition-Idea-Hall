"""配置加载模块 - 从 YAML 文件加载采集器配置并注册"""

import logging
import re
from pathlib import Path
from typing import Dict, Any, List, Optional

import yaml

from collectors.base import BaseCollector
from collectors.registry import CollectorRegistry, get_registry

logger = logging.getLogger(__name__)


def load_yaml_config(config_path: str) -> Dict[str, Any]:
    """
    加载 YAML 配置文件

    Args:
        config_path: 配置文件路径

    Returns:
        配置字典
    """
    path = Path(config_path)
    if not path.exists():
        pass

    with open(path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    # [cleanup] logger.info(f"加载配置文件: {config_path}")
    return config or {}


def load_collectors_from_config(
    config_path: str = "config/collectors.yaml",
    extra_configs: Optional[list] = None,
) -> int:
    """
    从配置文件加载采集器(自动发现并注册采集器类型)

    Args:
        config_path: 主配置文件路径,默认为 config/collectors.yaml
        extra_configs: 额外配置文件路径列表,如 ["config/worldmonitor_feeds.yaml"]

    Returns:
        总共注册的采集器数量
    """
    # 自动发现并注册所有采集器类型
    auto_discover_collectors()

    total = 0
    # 从主配置文件注册
    total += register_collectors_from_config(config_path)

    # 从额外配置注册
    for extra_path in (extra_configs or []):
        total += register_collectors_from_config(extra_path)

    return total


def _convert_worldmonitor_feeds(config: dict) -> dict:
    """Convert worldmonitor_feeds.yaml format to collector config format."""
    collectors = []
    feeds = config.get("feeds", [])
    for idx, feed in enumerate(feeds):
        url = feed.get("url", "")
        domain = feed.get("source", url.split("/")[2] if "//" in url else f"feed_{idx}")
        # Sanitize name: alphanumeric + underscore only
        safe_name = re.sub(r"[^a-zA-Z0-9_]", "_", f"wm_{domain}")[:60]
        collectors.append({
            "type": "rss",
            "name": safe_name,
            "enabled": False,  # disabled by default — enable selectively
            "config": {
                "url": url,
                "max_items": 20,
                "update_interval": 1800,
            },
        })
    return {"collectors": collectors}


def register_collectors_from_config(
    config_path: str,
    registry: Optional[CollectorRegistry] = None
) -> int:
    """
    从 YAML 配置文件加载并注册所有采集器

    配置文件格式示例:
    ```yaml
    collectors:
      - type: rss
        name: hacker_news
        enabled: true
        config:
          url: https://news.ycombinator.com/rss
          max_items: 50

      - type: news_api
        name: techcrunch
        enabled: true
        config:
          api_key: ${NEWS_API_KEY}
          sources: techcrunch
    ```

    Args:
        config_path: 配置文件路径
        registry: 采集器注册表,默认使用全局注册表

    Returns:
        成功注册的采集器数量
    """
    if registry is None:
        registry = get_registry()

    # 加载配置
    config = load_yaml_config(config_path)
    collectors_config = config.get("collectors", [])

    # Auto-convert worldmonitor_feeds format (feeds: → collectors:)
    if not collectors_config and "feeds" in config:
        config = _convert_worldmonitor_feeds(config)
        collectors_config = config.get("collectors", [])

    if not collectors_config:

        pass
        return 0

    registered_count = 0

    for collector_cfg in collectors_config:
        collector_type = collector_cfg.get("type")
        name = collector_cfg.get("name")
        enabled = collector_cfg.get("enabled", True)
        collector_config = collector_cfg.get("config", {})

        if not collector_type:

            pass
            continue

        if not name:

            pass
            continue

        # 检查采集器类型是否已注册
        if registry.get_type(collector_type) is None:
            logger.warning(
                "Collector type '%s' not registered, skipping '%s'",
                collector_type, name,
            )
            continue

        # 构建完整配置
        full_config = {
            "name": name,
            "enabled": enabled,
            **collector_config
        }

        # 创建并注册实例
        instance = registry.create_instance(collector_type, name, full_config)
        if instance:
            registered_count += 1
            # [cleanup] logger.info(f"成功注册采集器: {name} (类型: {collector_type}, 启用: {enabled})")

    # [cleanup] logger.info(f"从配置文件注册了 {registered_count} 个采集器")
    return registered_count


def register_collector_type(
    collector_type: str,
    collector_class: type,
    registry: Optional[CollectorRegistry] = None
) -> None:
    """
    注册采集器类型的便捷函数

    Args:
        collector_type: 采集器类型标识
        collector_class: 采集器类(必须是 BaseCollector 的子类)
        registry: 采集器注册表,默认使用全局注册表
    """
    if registry is None:
        registry = get_registry()

    if not issubclass(collector_class, BaseCollector):

        pass

    registry.register_type(collector_type, collector_class)


def auto_discover_collectors(package_path: Optional[str] = None) -> None:
    """
    自动发现并注册采集器类型

    扫描 collectors 包下的所有模块,查找 BaseCollector 的子类并自动注册.
    子类必须定义类属性 `collector_type` 来指定类型标识.

    Args:
        package_path: 包路径,默认为当前包的 collectors 目录
    """
    import importlib
    import inspect
    from pathlib import Path

    if package_path is None:
        package_path = Path(__file__).parent

    package_path = Path(package_path)
    registry = get_registry()

    # 遍历包下所有 Python 文件
    for py_file in package_path.glob("*.py"):
        if py_file.name.startswith("_"):
            continue

        module_name = f"collectors.{py_file.stem}"
        try:
            module = importlib.import_module(module_name)

            # 查找所有 BaseCollector 的子类
            for name, obj in inspect.getmembers(module, inspect.isclass):
                if (
                    issubclass(obj, BaseCollector)
                    and obj is not BaseCollector
                    and hasattr(obj, "collector_type")
                ):
                    collector_type = obj.collector_type
                    registry.register_type(collector_type, obj)
                    # [cleanup] logger.info(f"自动发现并注册采集器类型: {collector_type} -> {name}")

        except Exception as e:
            logger.error("Failed to load module %s: %s", module_name, e)
