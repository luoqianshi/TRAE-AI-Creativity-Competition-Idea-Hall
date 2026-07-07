pass
import asyncio
import time
import logging
from typing import Dict, Any, List, Optional, Callable, Awaitable, Union
from dataclasses import dataclass, field
from enum import Enum
from collections import deque

logger = logging.getLogger(__name__)


class AlertLevel(Enum):
    """告警级别"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class AlertStatus(Enum):
    """告警状态"""
    ACTIVE = "active"
    RESOLVED = "resolved"
    ACKNOWLEDGED = "acknowledged"


@dataclass
class MetricPoint:
    """指标数据点"""
    name: str
    value: float
    timestamp: float = field(default_factory=time.time)
    labels: Dict[str, str] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "name": self.name,
            "value": self.value,
            "timestamp": self.timestamp,
            "labels": self.labels
        }


@dataclass
class Alert:
    """告警"""
    id: str
    rule_name: str
    level: AlertLevel
    message: str
    timestamp: float = field(default_factory=time.time)
    status: AlertStatus = AlertStatus.ACTIVE
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "id": self.id,
            "rule_name": self.rule_name,
            "level": self.level.value,
            "message": self.message,
            "timestamp": self.timestamp,
            "status": self.status.value,
            "metadata": self.metadata
        }


class MetricCollector:
    """指标收集器(async 安全)"""

    def __init__(self, max_points: int = 10000):
        self.max_points = max_points
        self._metrics: Dict[str, deque] = {}
        self._lock = asyncio.Lock()

    async def record(self, name: str, value: float, labels: Dict[str, str] = None):
        """
        记录指标

        Args:
            name: 指标名称
            value: 指标值
            labels: 标签
        """
        point = MetricPoint(
            name=name,
            value=value,
            labels=labels or {}
        )

        async with self._lock:
            if name not in self._metrics:
                self._metrics[name] = deque(maxlen=self.max_points)

            self._metrics[name].append(point)

    async def get_latest(self, name: str) -> Optional[MetricPoint]:
        """获取最新指标点"""
        async with self._lock:
            if name not in self._metrics or not self._metrics[name]:
                return None
            return self._metrics[name][-1]

    async def get_history(self, name: str, count: int = 100) -> List[MetricPoint]:
        """获取指标历史"""
        async with self._lock:
            if name not in self._metrics:
                return []

            points = list(self._metrics[name])
            return points[-count:]

    async def get_average(self, name: str, window: int = 100) -> Optional[float]:
        """获取指标平均值"""
        points = await self.get_history(name, window)
        if not points:
            return None
        return sum(p.value for p in points) / len(points)

    async def get_all_metrics(self) -> Dict[str, List[Dict]]:
        """获取所有指标"""
        async with self._lock:
            result = {}
            for name, points in self._metrics.items():
                result[name] = [p.to_dict() for p in list(points)]
            return result


class AlertRule:
    """告警规则"""
    
    def __init__(
        self,
        name: str,
        metric_name: str,
        condition: Callable[[float], bool],
        level: AlertLevel,
        message_template: str,
        cooldown_seconds: int = 300
    ):
        self.name = name
        self.metric_name = metric_name
        self.condition = condition
        self.level = level
        self.message_template = message_template
        self.cooldown_seconds = cooldown_seconds
        
        self._last_alert_time: Optional[float] = None
        self._is_active = False
    
    def evaluate(self, value: float) -> Optional[Alert]:
        """
        评估规则
        
        Args:
            value: 指标值
            
        Returns:
            如果触发告警,返回 Alert 对象;否则返回 None
        """
        should_alert = self.condition(value)
        
        # 检查冷却时间
        if should_alert and self._last_alert_time:
            elapsed = time.time() - self._last_alert_time
            if elapsed < self.cooldown_seconds:
                return None
        
        if should_alert:
            self._is_active = True
            self._last_alert_time = time.time()
            
            message = self.message_template.format(
                metric_name=self.metric_name,
                value=value,
                threshold=self.condition.__name__
            )
            
            return Alert(
                id=f"{self.name}_{int(time.time())}",
                rule_name=self.name,
                level=self.level,
                message=message,
                metadata={
                    "metric_name": self.metric_name,
                    "value": value
                }
            )
        
        return None


# 支持同步或异步 notifier
AlertNotifier = Union[Callable[[Alert], None], Callable[[Alert], Awaitable[None]]]


class AlertManager:
    """告警管理器(async 安全)"""

    def __init__(self):
        self._rules: Dict[str, AlertRule] = {}
        self._alerts: deque = deque(maxlen=1000)
        self._active_alerts: Dict[str, Alert] = {}
        self._lock = asyncio.Lock()
        self._notifiers: List[AlertNotifier] = []

    def add_rule(self, rule: AlertRule):
        """添加告警规则"""
        self._rules[rule.name] = rule
        # [cleanup] logger.info(f"告警规则已添加: {rule.name}")

    def remove_rule(self, name: str):
        """移除告警规则"""
        if name in self._rules:
            del self._rules[name]
            # [cleanup] logger.info(f"告警规则已移除: {name}")

    def add_notifier(self, notifier: AlertNotifier):
        """添加告警通知器(支持同步或 async 函数)"""
        self._notifiers.append(notifier)

    async def evaluate_rules(self, metric_collector: MetricCollector):
        """评估所有规则"""
        for rule_name, rule in self._rules.items():
            latest = await metric_collector.get_latest(rule.metric_name)

            if latest:
                alert = rule.evaluate(latest.value)

                if alert:
                    await self._trigger_alert(alert)

    async def _trigger_alert(self, alert: Alert):
        """触发告警"""
        async with self._lock:
            self._alerts.append(alert)
            self._active_alerts[alert.id] = alert

            # [cleanup] logger.warning(f"告警触发: [{alert.level.value}] {alert.message}")

            # 通知所有监听器(支持 async notifier)
            for notifier in self._notifiers:
                try:
                    result = notifier(alert)
                    if asyncio.iscoroutine(result):
                        await result
                except Exception as e:
                    pass  # [fixed empty block]

    async def resolve_alert(self, alert_id: str):
        """解决告警"""
        async with self._lock:
            if alert_id in self._active_alerts:
                alert = self._active_alerts[alert_id]
                alert.status = AlertStatus.RESOLVED
                del self._active_alerts[alert_id]
                # [cleanup] logger.info(f"告警已解决: {alert_id}")

    async def acknowledge_alert(self, alert_id: str):
        """确认告警"""
        async with self._lock:
            if alert_id in self._active_alerts:
                alert = self._active_alerts[alert_id]
                alert.status = AlertStatus.ACKNOWLEDGED
                # [cleanup] logger.info(f"告警已确认: {alert_id}")

    async def get_active_alerts(self) -> List[Alert]:
        """获取活跃告警"""
        async with self._lock:
            return list(self._active_alerts.values())

    async def get_alert_history(self, count: int = 100) -> List[Alert]:
        """获取告警历史"""
        async with self._lock:
            return list(self._alerts)[-count:]


class LogNotifier:
    """日志通知器"""
    
    def __init__(self, logger_name: str = "alerts"):
        self.logger = logging.getLogger(logger_name)
    
    def __call__(self, alert: Alert):
        """发送通知"""
        level_map = {
            AlertLevel.INFO: self.logger.info,
            AlertLevel.WARNING: self.logger.warning,
            AlertLevel.ERROR: self.logger.error,
            AlertLevel.CRITICAL: self.logger.critical
        }
        
        log_func = level_map.get(alert.level, self.logger.warning)
        log_func(f"[ALERT] {alert.message}")


class WebhookNotifier:
    """Webhook 通知器"""
    
    def __init__(self, webhook_url: str, timeout: int = 10):
        self.webhook_url = webhook_url
        self.timeout = timeout
    
    def __call__(self, alert: Alert):
        """发送通知"""
        try:
            import requests
            
            payload = alert.to_dict()
            
            response = requests.post(
                self.webhook_url,
                json=payload,
                timeout=self.timeout
            )
            
            if response.status_code != 200:
            
                pass
        
        except Exception as e:
        
            pass  # [fixed empty block]


def _monitor_task_done_callback(task: asyncio.Task) -> None:
    """Monitor task done callback — logs exceptions raised by the monitor loop."""
    try:
        exc = task.exception()
    except asyncio.CancelledError:
        return
    if exc is not None:
        logger.error("Metrics monitor task crashed: %s", exc, exc_info=exc)


class MetricsMonitor:
    """指标监控器(async 安全)"""

    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}

        self.collector = MetricCollector(
            max_points=self.config.get("max_points", 10000)
        )

        self.alert_manager = AlertManager()

        # 添加默认通知器
        self.alert_manager.add_notifier(LogNotifier())

        # 配置 Webhook(如果有)
        webhook_url = self.config.get("webhook_url")
        if webhook_url:
            self.alert_manager.add_notifier(WebhookNotifier(webhook_url))

        self._running = False
        self._monitor_task: Optional[asyncio.Task] = None
        self._check_interval = self.config.get("check_interval", 60)
        # 修复: 在 __init__ 中直接创建 stop_event, 移除易出错的 property
        self._stop_event: asyncio.Event = asyncio.Event()

    async def start(self):
        """启动监控"""
        if self._running:
            return

        self._running = True
        # 重置 stop_event,避免重复启动时循环立即退出
        self._stop_event.clear()
        self._monitor_task = asyncio.create_task(
            self._monitor_loop(),
            name="metrics-monitor"
        )
        self._monitor_task.add_done_callback(_monitor_task_done_callback)

        logger.info("Metrics monitor started")

    async def stop(self):
        """停止监控"""
        self._running = False
        self._stop_event.set()

        if self._monitor_task and not self._monitor_task.done():
            self._monitor_task.cancel()
            try:
                await self._monitor_task
            except asyncio.CancelledError:
                pass

        self._monitor_task = None
        logger.info("Metrics monitor stopped")

    async def _monitor_loop(self):
        """监控循环"""
        while self._running:
            try:
                await self.alert_manager.evaluate_rules(self.collector)
            except Exception as e:
                logger.warning("Monitor evaluate_rules failed: %s", e, exc_info=True)

            try:
                await asyncio.wait_for(
                    self._stop_event.wait(),
                    timeout=self._check_interval
                )
            except asyncio.TimeoutError:
                pass
            except asyncio.CancelledError:
                break

    async def record_metric(self, name: str, value: float, labels: Dict[str, str] = None):
        """记录指标"""
        await self.collector.record(name, value, labels)

    def add_alert_rule(self, rule: AlertRule):
        """添加告警规则"""
        self.alert_manager.add_rule(rule)

    async def get_metrics(self) -> Dict[str, Any]:
        """获取所有指标"""
        return {
            "metrics": await self.collector.get_all_metrics(),
            "active_alerts": [a.to_dict() for a in await self.alert_manager.get_active_alerts()],
            "alert_history": [a.to_dict() for a in await self.alert_manager.get_alert_history(10)]
        }


# 全局监控实例
_monitor: Optional[MetricsMonitor] = None


def get_monitor() -> MetricsMonitor:
    """获取全局监控实例

    使用双路径解析:优先从 DI 容器获取已注册的 ``monitor`` 服务,
    否则创建新的单例.
    """
    global _monitor
    if _monitor is None:
        from utils.di_container import try_resolve
        container_monitor = try_resolve("monitor")
        if container_monitor is not None:
            _monitor = container_monitor
            return _monitor
        _monitor = MetricsMonitor()
    return _monitor


def init_monitor(config: Optional[Dict] = None):
    """初始化监控"""
    global _monitor
    _monitor = MetricsMonitor(config)
    return _monitor
