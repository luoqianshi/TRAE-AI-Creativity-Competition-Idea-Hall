"""量化平台配置

优先使用 pydantic-settings（Python 3.10+ 完整环境），
未安装时降级为简单实现以保证核心回测逻辑可独立运行。
"""
from __future__ import annotations
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
LOG_DIR = BASE_DIR / "logs"
DATA_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)


def _load_env(path: Path) -> dict[str, str]:
    """简易 .env 读取（无 python-dotenv 时备用）"""
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip("'\"")
    return env


try:
    from pydantic_settings import BaseSettings, SettingsConfigDict

    class Settings(BaseSettings):
        model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

        tiger_account_id: str = ""
        tiger_access_token: str = ""
        tiger_secret_key: str = ""
        tiger_paper_account: bool = True
        database_url: str = f"sqlite+aiosqlite:///{DATA_DIR / 'quant.db'}"
        default_initial_capital: float = 100000.0
        default_commission: float = 0.0005
        default_slippage: float = 0.001
        default_stamp_tax: float = 0.001
        api_host: str = "0.0.0.0"
        api_port: int = 8000

except ImportError:
    class Settings:
        """无 pydantic-settings 时的降级配置"""

        def __init__(self):
            env = _load_env(BASE_DIR / ".env")
            env.update({k: v for k, v in os.environ.items()})

            def _get(key: str, default: str) -> str:
                return env.get(key, default)

            def _get_bool(key: str, default: bool) -> bool:
                val = env.get(key, str(default)).lower()
                return val in ("1", "true", "yes", "on")

            def _get_float(key: str, default: float) -> float:
                try:
                    return float(env.get(key, default))
                except (TypeError, ValueError):
                    return default

            def _get_int(key: str, default: int) -> int:
                try:
                    return int(env.get(key, default))
                except (TypeError, ValueError):
                    return default

            self.tiger_account_id = _get("TIGER_ACCOUNT_ID", "")
            self.tiger_access_token = _get("TIGER_ACCESS_TOKEN", "")
            self.tiger_secret_key = _get("TIGER_SECRET_KEY", "")
            self.tiger_paper_account = _get_bool("TIGER_PAPER_ACCOUNT", True)
            self.database_url = f"sqlite+aiosqlite:///{DATA_DIR / 'quant.db'}"
            self.default_initial_capital = _get_float("DEFAULT_INITIAL_CAPITAL", 100000.0)
            self.default_commission = _get_float("DEFAULT_COMMISSION", 0.0005)
            self.default_slippage = _get_float("DEFAULT_SLIPPAGE", 0.001)
            self.default_stamp_tax = _get_float("DEFAULT_STAMP_TAX", 0.001)
            self.api_host = _get("API_HOST", "0.0.0.0")
            self.api_port = _get_int("API_PORT", 8000)


settings = Settings()
