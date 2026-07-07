"""utils/di_container.py 单元测试"""

import asyncio

import pytest

from utils.di_container import (
    DependencyContainer,
    container_scope,
    get_container,
    register_service,
    resolve_service,
)


@pytest.mark.unit
class TestDependencyContainer:
    """DependencyContainer 基础功能测试"""

    def test_register_and_resolve(self):
        """注册实例并解析"""
        container = DependencyContainer()
        container.register("service_a", "instance_a")
        assert container.resolve("service_a") == "instance_a"

    def test_resolve_unregistered_raises_key_error(self):
        """解析未注册服务抛 KeyError"""
        container = DependencyContainer()
        with pytest.raises(KeyError):
            container.resolve("nonexistent")

    def test_try_resolve_unregistered_returns_none(self):
        """try_resolve 未注册返回 None"""
        container = DependencyContainer()
        assert container.try_resolve("nonexistent") is None

    def test_try_resolve_registered_returns_instance(self):
        """try_resolve 已注册返回实例"""
        container = DependencyContainer()
        container.register("svc", "value")
        assert container.try_resolve("svc") == "value"

    def test_has_registered(self):
        """has 正确识别已注册服务"""
        container = DependencyContainer()
        container.register("svc", "value")
        assert container.has("svc") is True
        assert container.has("nonexistent") is False

    def test_has_factory_registered(self):
        """has 识别工厂注册"""
        container = DependencyContainer()
        container.register_factory("svc", lambda c: "value")
        assert container.has("svc") is True


@pytest.mark.unit
class TestFactoryRegistration:
    """工厂注册测试"""

    def test_singleton_factory_creates_once(self):
        """单例工厂只创建一次"""
        call_count = [0]

        def factory(container):
            call_count[0] += 1
            return f"instance_{call_count[0]}"

        container = DependencyContainer()
        container.register_factory("svc", factory, singleton=True)

        v1 = container.resolve("svc")
        v2 = container.resolve("svc")

        assert v1 == v2 == "instance_1"
        assert call_count[0] == 1

    def test_non_singleton_factory_creates_each_time(self):
        """非单例工厂每次 resolve 都创建"""
        call_count = [0]

        def factory(container):
            call_count[0] += 1
            return f"instance_{call_count[0]}"

        container = DependencyContainer()
        container.register_factory("svc", factory, singleton=False)

        v1 = container.resolve("svc")
        v2 = container.resolve("svc")

        assert v1 == "instance_1"
        assert v2 == "instance_2"
        assert call_count[0] == 2

    def test_factory_receives_container(self):
        """工厂函数接收容器参数"""
        container = DependencyContainer()
        container.register("dep", "dep_value")
        container.register_factory("svc", lambda c: c.resolve("dep"))
        assert container.resolve("svc") == "dep_value"


@pytest.mark.unit
class TestDisposable:
    """可释放资源测试"""

    def test_register_disposable_with_close(self):
        """注册有 close 方法的实例"""

        class Resource:
            def __init__(self):
                self.closed = False

            def close(self):
                self.closed = True

        container = DependencyContainer()
        resource = Resource()
        container.register_disposable(resource)

        asyncio.run(container.dispose_all())

        assert resource.closed is True

    def test_register_disposable_with_dispose(self):
        """注册有 dispose 方法的实例"""

        class Resource:
            def __init__(self):
                self.disposed = False

            def dispose(self):
                self.disposed = True

        container = DependencyContainer()
        resource = Resource()
        container.register_disposable(resource)

        asyncio.run(container.dispose_all())

        assert resource.disposed is True

    def test_register_non_disposable_ignored(self):
        """注册无 close/dispose 的实例被忽略"""

        class Plain:
            pass

        container = DependencyContainer()
        plain = Plain()
        # 不应抛异常
        container.register_disposable(plain)
        asyncio.run(container.dispose_all())

    def test_dispose_all_async_close(self):
        """异步 close 方法被 await"""

        class AsyncResource:
            def __init__(self):
                self.closed = False

            async def close(self):
                self.closed = True

        container = DependencyContainer()
        resource = AsyncResource()
        container.register_disposable(resource)

        asyncio.run(container.dispose_all())

        assert resource.closed is True

    def test_dispose_all_clears_state(self):
        """dispose_all 清空所有状态"""
        container = DependencyContainer()
        container.register("svc", "value")
        container.register_factory("fac", lambda c: "fac_value")

        asyncio.run(container.dispose_all())

        assert not container.has("svc")


@pytest.mark.unit
class TestGlobalContainer:
    """全局容器函数测试"""

    def test_get_container_returns_singleton(self):
        """get_container 返回同一实例"""
        c1 = get_container()
        c2 = get_container()
        assert c1 is c2

    def test_register_and_resolve_service(self):
        """register_service / resolve_service 全局函数"""
        register_service("test_global_svc", "global_value")
        assert resolve_service("test_global_svc") == "global_value"

    def test_container_scope_auto_dispose(self):
        """container_scope 退出时自动 dispose"""

        class Resource:
            def __init__(self):
                self.closed = False

            def close(self):
                self.closed = True

        resource = Resource()

        async def run():
            async with container_scope() as container:
                container.register("r", resource)
                container.register_disposable(resource)
                assert container.has("r")
            # 退出 scope 后应已 dispose

        asyncio.run(run())

        assert resource.closed is True
