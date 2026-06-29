import json
from pathlib import Path

from pydantic import Field
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    project_name: str = "My App Backend"
    app_env: str = "local"
    api_v1_prefix: str = "/api/v1"
    docs_url: str = "/docs"
    redoc_url: str = "/redoc"
    openapi_url: str = "/openapi.json"
    dev_auth_bypass: bool = False
    dev_auth_username: str = "dev"
    dev_auth_phone: str = "13900000000"

    mysql_host: str = "127.0.0.1"
    mysql_port: int = 3306
    mysql_user: str = "root"
    mysql_password: str = "12345678"
    mysql_database: str = "my_app"
    database_url_env: str = Field(default="", validation_alias="DATABASE_URL")
    sqlite_db_filename: str = "my_app.sqlite3"

    secret_key: str = "replace-this-with-a-long-random-string"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7

    aliyun_dypns_access_key_id: str = ""
    aliyun_dypns_access_key_secret: str = ""
    aliyun_dypns_endpoint: str = "dypnsapi.aliyuncs.com"
    aliyun_sms_sign_name: str = ""
    aliyun_sms_template_register_login: str = "100001"
    aliyun_sms_template_change_phone: str = "100002"
    aliyun_sms_template_reset_password: str = "100003"
    aliyun_sms_template_bind_new_phone: str = "100004"
    aliyun_sms_template_verify_bind_phone: str = "100005"
    aliyun_sms_template_param: str = '{"code":"##code##","min":"5"}'
    aliyun_sms_code_length: int = 6
    aliyun_sms_valid_time: int = 300
    aliyun_sms_interval: int = 60
    aliyun_sms_code_type: int = 1
    sms_debug_fallback: bool = False

    cors_origins: list[str] = ["*"]
    upload_dir: str = "uploads"
    upload_max_size_mb: int = 10
    upload_allowed_extensions: list[str] = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".pdf",
        ".doc",
        ".docx",
    ]
    default_page_size: int = 10
    max_page_size: int = 100

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("cors_origins", "upload_allowed_extensions", mode="before")
    @classmethod
    def parse_str_list(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, list):
            return value
        if not value:
            return []
        value = value.strip()
        if value.startswith("["):
            return json.loads(value)
        return [item.strip() for item in value.split(",") if item.strip()]

    @property
    def backend_dir(self) -> Path:
        return BACKEND_DIR

    @property
    def upload_path(self) -> Path:
        return (self.backend_dir / self.upload_dir).resolve()

    @property
    def sqlite_path(self) -> Path:
        return (self.backend_dir / "data" / self.sqlite_db_filename).resolve()

    @property
    def use_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")

    @property
    def server_url(self) -> str:
        return (
            f"mysql+pymysql://{self.mysql_user}:{self.mysql_password}"
            f"@{self.mysql_host}:{self.mysql_port}/mysql?charset=utf8mb4"
        )

    @property
    def database_url(self) -> str:
        if self.database_url_env:
            return self.database_url_env
        return (
            f"mysql+pymysql://{self.mysql_user}:{self.mysql_password}"
            f"@{self.mysql_host}:{self.mysql_port}/{self.mysql_database}?charset=utf8mb4"
        )


settings = Settings()
