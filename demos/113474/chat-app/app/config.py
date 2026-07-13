"""全局配置：从 config.yaml 加载"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONFIG_FILE = PROJECT_ROOT / "config.yaml"
DATA_DIR = PROJECT_ROOT / "data"
MEDIA_DIR = PROJECT_ROOT / "media"


class Settings(BaseSettings):
    """运行时配置（可被环境变量覆盖）"""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # 服务
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"

    # JWT
    jwt_secret: str = "change_me_to_a_random_string_at_least_32_chars"
    jwt_expire_days: int = 7

    # 数据库
    db_path: str = "data/chat.db"

    # 媒体
    media_dir: str = "media"

    @property
    def database_url(self) -> str:
        abs_path = (PROJECT_ROOT / self.db_path).resolve()
        abs_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite+aiosqlite:///{abs_path.as_posix()}"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """从环境变量 + config.yaml 加载配置"""
    settings = Settings()
    yaml_cfg = get_yaml_config()

    # 用 yaml 覆盖默认值
    server_cfg = yaml_cfg.get("server", {})
    if "host" in server_cfg:
        settings.host = server_cfg["host"]
    if "port" in server_cfg:
        settings.port = int(server_cfg["port"])

    jwt_cfg = yaml_cfg.get("jwt", {})
    if "secret" in jwt_cfg:
        settings.jwt_secret = jwt_cfg["secret"]
    if "expire_days" in jwt_cfg:
        settings.jwt_expire_days = int(jwt_cfg["expire_days"])

    return settings


@lru_cache(maxsize=1)
def get_yaml_config() -> dict[str, Any]:
    """加载 config.yaml 全部内容"""
    if not CONFIG_FILE.exists():
        return {}
    with CONFIG_FILE.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def get_default_bot_config() -> dict[str, Any]:
    """获取默认 AI bot 配置"""
    return get_yaml_config().get("default_bot", {})


def get_image_gen_config() -> dict[str, Any]:
    """获取图片生成配置"""
    return get_yaml_config().get("image_gen", {})
