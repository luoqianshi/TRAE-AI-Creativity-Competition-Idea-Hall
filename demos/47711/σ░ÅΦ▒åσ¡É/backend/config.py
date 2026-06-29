from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parent


class AISettings(BaseSettings):
    ark_api_base_url: str = "https://ark.cn-beijing.volces.com/api/v3"
    ark_chat_completions_path: str = "/chat/completions"
    ark_image_generations_path: str = "/images/generations"
    ark_video_generation_tasks_path: str = "/contents/generations/tasks"
    ark_api_key: str = Field(default="")
    ark_model: str = "doubao-seed-1-8-251228"
    ark_image_model: str = "doubao-seedream-5-0-lite-260128"
    ark_video_model: str = "doubao-seedance-2-0-fast-260128"
    ark_timeout_seconds: float = 45.0
    ark_disable_thinking: bool = True

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def chat_completions_url(self) -> str:
        return f"{self.ark_api_base_url.rstrip('/')}/{self.ark_chat_completions_path.lstrip('/')}"

    @property
    def image_generations_url(self) -> str:
        return f"{self.ark_api_base_url.rstrip('/')}/{self.ark_image_generations_path.lstrip('/')}"

    @property
    def video_generation_tasks_url(self) -> str:
        return f"{self.ark_api_base_url.rstrip('/')}/{self.ark_video_generation_tasks_path.lstrip('/')}"

    def video_generation_task_url(self, task_id: str) -> str:
        return f"{self.video_generation_tasks_url.rstrip('/')}/{task_id}"


ai_settings = AISettings()
