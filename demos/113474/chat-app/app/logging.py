"""日志配置"""
from __future__ import annotations

import logging
import sys

from app.config import get_settings


_configured = False


def get_logger(name: str) -> logging.Logger:
    global _configured
    if not _configured:
        settings = get_settings()
        logging.basicConfig(
            level=getattr(logging, settings.log_level.upper(), logging.INFO),
            format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
            stream=sys.stdout,
        )
        _configured = True
    return logging.getLogger(name)
