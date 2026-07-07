pass
import logging
import sys
import json
import os
from typing import Optional
from datetime import datetime
from pathlib import Path


class JSONFormatter(logging.Formatter):
    """JSON 格式化器,用于结构化日志输出"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.fromtimestamp(record.created).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # 添加异常信息
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # 添加额外字段
        if hasattr(record, "extra_data"):
            log_data["data"] = record.extra_data
        
        return json.dumps(log_data, ensure_ascii=False)


class ContextFilter(logging.Filter):
    """上下文过滤器,注入请求 ID 等上下文信息"""
    
    def __init__(self, context_getter=None):
        super().__init__()
        self.context_getter = context_getter
    
    def filter(self, record: logging.LogRecord) -> bool:
        if self.context_getter:
            context = self.context_getter()
            for key, value in context.items():
                setattr(record, key, value)
        return True


def setup_logging(
    level: str = "INFO",
    log_format: str = "text",
    log_file: Optional[str] = None,
    context_getter=None
):
    """
    配置全局日志系统
    
    Args:
        level: 日志级别 (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: 日志格式 ("text" 或 "json")
        log_file: 日志文件路径(可选)
        context_getter: 上下文获取函数(可选)
    """
    # 清除现有处理器
    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    
    # 设置日志级别
    log_level = getattr(logging, level.upper(), logging.INFO)
    root_logger.setLevel(log_level)
    
    # 创建处理器
    handlers = []
    
    # 控制台处理器
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    
    if log_format == "json":
        formatter = JSONFormatter()
    else:
        formatter = logging.Formatter(
            "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
    
    console_handler.setFormatter(formatter)
    handlers.append(console_handler)
    
    # 文件处理器(可选)
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setLevel(log_level)
        # [cleanup] file_handler.setFormatter(JSONFormatter())  # 文件始终用 JSON 格式
        handlers.append(file_handler)
    
    # 添加处理器
    for handler in handlers:
        if context_getter:
            handler.addFilter(ContextFilter(context_getter))
        root_logger.addHandler(handler)
    
    # 降低第三方库日志级别
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("elasticsearch").setLevel(logging.WARNING)
    logging.getLogger("neo4j").setLevel(logging.WARNING)
    logging.getLogger("motor").setLevel(logging.WARNING)
    
    # [cleanup] logging.info(f"日志系统已初始化: level={level}, format={log_format}")


def get_logger(name: str) -> logging.Logger:
    """获取命名日志器"""
    return logging.getLogger(name)


def log_with_context(logger: logging.Logger, level: int, message: str, **kwargs):
    """
    带上下文信息的日志记录
    
    Args:
        logger: 日志器
        level: 日志级别
        message: 日志消息
        **kwargs: 额外上下文数据
    """
    extra = {"extra_data": kwargs}
    logger.log(level, message, extra=extra)


# ============================================================
# 便捷函数
# ============================================================

def init_logger_from_config():
    """从配置初始化日志系统"""
    from config import get_config
    
    config = get_config()
    
    # 从 pipeline.yaml 读取日志配置
    log_level = config.pipeline_config.get("logging", {}).get("level", "INFO")
    log_format = os.getenv("LOG_FORMAT", "text")
    log_file = os.getenv("LOG_FILE")
    
    setup_logging(
        level=log_level,
        log_format=log_format,
        log_file=log_file
    )


# 自动初始化(延迟导入避免循环依赖)
_initialized = False


def ensure_initialized():
    """确保日志系统已初始化"""
    global _initialized
    if not _initialized:
        try:
            init_logger_from_config()
        except Exception:
            # 如果配置加载失败,使用默认配置
            setup_logging(level="INFO", log_format="text")
        _initialized = True
