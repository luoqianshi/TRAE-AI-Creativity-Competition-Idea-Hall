from pathlib import Path
from uuid import uuid4

from app.core.config import settings
from app.core.exceptions import BadRequestException
from app.schemas.common import FileUploadPolicy


UPLOAD_FILE_FIELD = "file"
UPLOAD_FOLDER_FIELD = "folder"
DEFAULT_UPLOAD_FOLDER = "common"


def get_upload_policy() -> FileUploadPolicy:
    return FileUploadPolicy(
        field_name=UPLOAD_FILE_FIELD,
        folder_field_name=UPLOAD_FOLDER_FIELD,
        max_size_mb=settings.upload_max_size_mb,
        allowed_extensions=settings.upload_allowed_extensions,
    )


def validate_upload_extension(filename: str) -> str:
    suffix = Path(filename).suffix.lower()
    if not suffix:
        raise BadRequestException("上传文件缺少扩展名")
    if suffix not in settings.upload_allowed_extensions:
        raise BadRequestException(
            f"不支持的文件类型: {suffix}",
            data={"allowed_extensions": settings.upload_allowed_extensions},
        )
    return suffix


def normalize_upload_folder(folder: str | None) -> str:
    raw = (folder or DEFAULT_UPLOAD_FOLDER).strip().strip("/\\")
    if not raw:
        return DEFAULT_UPLOAD_FOLDER
    sanitized = raw.replace("\\", "/")
    segments = [segment for segment in sanitized.split("/") if segment not in {"", ".", ".."}]
    if not segments:
        raise BadRequestException("非法上传目录")
    return "/".join(segments)


def build_upload_filename(original_filename: str) -> str:
    suffix = validate_upload_extension(original_filename)
    return f"{uuid4().hex}{suffix}"


def build_storage_key(folder: str, filename: str) -> str:
    normalized_folder = normalize_upload_folder(folder)
    return f"{normalized_folder}/{filename}"


def resolve_upload_path(storage_key: str) -> Path:
    normalized_key = storage_key.replace("\\", "/").lstrip("/")
    target_path = (settings.upload_path / normalized_key).resolve()
    base_path = settings.upload_path.resolve()
    if not str(target_path).startswith(str(base_path)):
        raise BadRequestException("非法文件路径")
    return target_path
