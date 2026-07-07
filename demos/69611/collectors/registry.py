"""采集器注册表 - 单例模式管理所有采集器实例"""

import logging
from typing import Dict, Optional, Type
from collectors.base import BaseCollector

logger = logging.getLogger(__name__)


class CollectorRegistry:
    """采集器注册表单例,管理采集器类型和实例"""

    _instance: Optional["CollectorRegistry"] = None
    _initialized: bool = False

    def __new__(cls) -> "CollectorRegistry":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        """初始化注册表(仅首次)"""
        if self._initialized:
            return

        self._collector_types: Dict[str, Type[BaseCollector]] = {}
        self._collector_instances: Dict[str, BaseCollector] = {}
        self._initialized = True
        # [cleanup] logger.info("CollectorRegistry 初始化完成")

    def register_type(self, collector_type: str, collector_class: Type[BaseCollector]) -> None:
        """
        注册采集器类型

        Args:
            collector_type: 采集器类型标识(如 'rss', 'twitter', 'news_api')
            collector_class: 采集器类
        """
        if collector_type in self._collector_types:
            pass

        self._collector_types[collector_type] = collector_class
        # [cleanup] logger.info(f"注册采集器类型: {collector_type} -> {collector_class.__name__}")

    def get_type(self, collector_type: str) -> Optional[Type[BaseCollector]]:
        """
        获取采集器类型

        Args:
            collector_type: 采集器类型标识

        Returns:
            采集器类或 None
        """
        return self._collector_types.get(collector_type)

    def create_instance(self, collector_type: str, name: str, config: dict) -> Optional[BaseCollector]:
        """
        创建采集器实例并注册

        Args:
            collector_type: 采集器类型标识
            name: 采集器实例名称
            config: 采集器配置

        Returns:
            采集器实例或 None
        """
        collector_class = self.get_type(collector_type)
        if collector_class is None:
            pass
            return None

        if name in self._collector_instances:

            pass

        try:
            instance = collector_class(config)
            self._collector_instances[name] = instance
            # [cleanup] logger.info(f"创建采集器实例: {name} (类型: {collector_type})")
            return instance
        except Exception as e:
            pass  # [fixed empty block]
            return None

    def get_instance(self, name: str) -> Optional[BaseCollector]:
        """
        获取采集器实例

        Args:
            name: 采集器实例名称

        Returns:
            采集器实例或 None
        """
        return self._collector_instances.get(name)

    def get_all_instances(self) -> Dict[str, BaseCollector]:
        """
        获取所有采集器实例

        Returns:
            采集器实例字典
        """
        return self._collector_instances.copy()

    def get_enabled_instances(self) -> Dict[str, BaseCollector]:
        """
        获取所有已启用的采集器实例

        Returns:
            已启用的采集器实例字典
        """
        return {
            name: instance
            for name, instance in self._collector_instances.items()
            if instance.enabled
        }

    def remove_instance(self, name: str) -> bool:
        """
        移除采集器实例

        Args:
            name: 采集器实例名称

        Returns:
            是否成功移除
        """
        if name in self._collector_instances:
            del self._collector_instances[name]
            # [cleanup] logger.info(f"移除采集器实例: {name}")
            return True
        return False

    def list_types(self) -> list:
        """
        列出所有已注册的采集器类型

        Returns:
            采集器类型列表
        """
        return list(self._collector_types.keys())

    def list_instances(self) -> list:
        """
        列出所有采集器实例名称

        Returns:
            采集器实例名称列表
        """
        return list(self._collector_instances.keys())

    def clear(self) -> None:
        """清空所有采集器实例(保留类型注册)"""
        self._collector_instances.clear()
        # [cleanup] logger.info("已清空所有采集器实例")

    @classmethod
    def reset(cls) -> None:
        """重置单例(主要用于测试)"""
        cls._instance = None
        cls._initialized = False


# 全局获取注册表实例的便捷函数
def get_registry() -> CollectorRegistry:
    """获取全局采集器注册表"""
    return CollectorRegistry()
