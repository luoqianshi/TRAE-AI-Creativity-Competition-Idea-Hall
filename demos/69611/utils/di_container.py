pass
from typing import Dict, Any, Callable, Optional
from contextlib import asynccontextmanager
import asyncio


class DependencyContainer:
    """依赖注入容器"""
    
    def __init__(self):
        self._services: Dict[str, Any] = {}
        self._factories: Dict[str, Callable] = {}
        self._singletons: Dict[str, Any] = {}
        self._disposables: list = []
    
    def register(self, name: str, instance: Any):
        """
        注册服务实例
        
        Args:
            name: 服务名称
            instance: 服务实例
        """
        self._services[name] = instance
    
    def register_factory(self, name: str, factory: Callable, singleton: bool = True):
        """
        注册服务工厂
        
        Args:
            name: 服务名称
            factory: 工厂函数
            singleton: 是否为单例
        """
        self._factories[name] = {
            "factory": factory,
            "singleton": singleton
        }
    
    def register_disposable(self, instance: Any):
        """
        注册可释放资源
        
        Args:
            instance: 可释放资源实例
        """
        if hasattr(instance, 'close') or hasattr(instance, 'dispose'):
            self._disposables.append(instance)
    
    def resolve(self, name: str) -> Any:
        """
        解析服务

        Args:
            name: 服务名称

        Returns:
            服务实例

        Raises:
            KeyError: 服务未注册
        """
        # 检查已注册实例
        if name in self._services:
            return self._services[name]

        # 检查工厂
        if name in self._factories:
            factory_info = self._factories[name]

            # 如果是单例且已创建,直接返回
            if factory_info["singleton"] and name in self._singletons:
                return self._singletons[name]

            # 创建实例
            instance = factory_info["factory"](self)

            # 如果是单例,缓存实例
            if factory_info["singleton"]:
                self._singletons[name] = instance

            return instance

        # 修复: 恢复 raise KeyError.
        # 原代码注释掉 raise 后, 未注册服务隐式返回 None.
        # 这破坏了文档字符串声明的契约 (Raises: KeyError),
        # 也使 try_resolve (依赖 KeyError 判断失败) 永远返回 None 而非触发回退逻辑.
        # 同时, reports.py / health.py 等处的 except (KeyError, ...) 也永远无法捕获.
        raise KeyError(f"服务未注册: {name}")
    
    def try_resolve(self, name: str) -> Optional[Any]:
        """
        尝试解析服务
        
        Args:
            name: 服务名称
            
        Returns:
            服务实例或 None
        """
        try:
            return self.resolve(name)
        except KeyError:
            return None
    
    def has(self, name: str) -> bool:
        """
        检查服务是否已注册
        
        Args:
            name: 服务名称
            
        Returns:
            bool: 是否已注册
        """
        return name in self._services or name in self._factories
    
    async def dispose_all(self):
        """释放所有资源"""
        for instance in self._disposables:
            try:
                if hasattr(instance, 'close'):
                    if asyncio.iscoroutinefunction(instance.close):
                        await instance.close()
                    else:
                        instance.close()
                elif hasattr(instance, 'dispose'):
                    if asyncio.iscoroutinefunction(instance.dispose):
                        await instance.dispose()
                    else:
                        instance.dispose()
            except Exception as e:
                # 修复: 恢复日志记录 (原被注释, 释放失败无法排查)
                import logging
                logging.getLogger(__name__).error(
                    "释放资源失败: %s", e, exc_info=True
                )

        self._disposables.clear()
        self._services.clear()
        self._singletons.clear()
        # 修复: 也清理 _factories (原未清理, 重启容器后旧工厂仍可被解析,
        # 引用已关闭的资源)
        self._factories.clear()


# 全局容器实例
_container: Optional[DependencyContainer] = None


def get_container() -> DependencyContainer:
    """获取全局依赖容器"""
    global _container
    if _container is None:
        _container = DependencyContainer()
    return _container


def register_service(name: str, instance: Any):
    """注册服务到全局容器"""
    get_container().register(name, instance)


def resolve_service(name: str) -> Any:
    """从全局容器解析服务"""
    return get_container().resolve(name)


@asynccontextmanager
async def container_scope():
    """容器作用域管理器"""
    container = get_container()
    try:
        yield container
    finally:
        await container.dispose_all()
