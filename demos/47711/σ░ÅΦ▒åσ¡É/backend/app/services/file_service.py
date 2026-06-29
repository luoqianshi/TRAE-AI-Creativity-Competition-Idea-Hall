from abc import ABC, abstractmethod
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings
from app.core.exceptions import BadRequestException, NotFoundException
from app.schemas.file import DeleteFileResult, FileUploadPolicy, StoredFile


class FileStorageService(ABC):
    @abstractmethod
    def save(self, file: UploadFile, *, folder: str = "common") -> StoredFile:
        raise NotImplementedError

    @abstractmethod
    def delete(self, storage_key: str) -> DeleteFileResult:
        raise NotImplementedError

    @abstractmethod
    def get_public_url(self, storage_key: str) -> str:
        raise NotImplementedError


class LocalFileStorageService(FileStorageService):
    def __init__(self, base_path: Path | None = None) -> None:
        self.base_path = base_path or settings.upload_path

    def save(self, file: UploadFile, *, folder: str = "common") -> StoredFile:
        original_filename = file.filename or "unnamed"
        suffix = Path(original_filename).suffix.lower()
        if not suffix:
            raise BadRequestException("上传文件缺少扩展名")
        if suffix not in settings.upload_allowed_extensions:
            raise BadRequestException(
                f"不支持的文件类型: {suffix}，允许类型: {', '.join(settings.upload_allowed_extensions)}"
            )

        target_dir = (self.base_path / folder).resolve()
        target_dir.mkdir(parents=True, exist_ok=True)

        filename = f"{uuid4().hex}{suffix}"
        target_path = target_dir / filename

        current_size = 0
        max_size = settings.upload_max_size_mb * 1024 * 1024
        with target_path.open("wb") as output:
            while True:
                chunk = file.file.read(1024 * 1024)
                if not chunk:
                    break
                current_size += len(chunk)
                if current_size > max_size:
                    output.close()
                    target_path.unlink(missing_ok=True)
                    raise BadRequestException(
                        f"文件大小超过限制，最大允许 {settings.upload_max_size_mb}MB"
                    )
                output.write(chunk)

        storage_key = f"{folder}/{filename}".replace("\\", "/")
        return StoredFile(
            filename=filename,
            original_filename=original_filename,
            storage_key=storage_key,
            url=self.get_public_url(storage_key),
            content_type=file.content_type,
            size=current_size,
        )

    def delete(self, storage_key: str) -> DeleteFileResult:
        target_path = (self.base_path / storage_key).resolve()
        if not str(target_path).startswith(str(self.base_path.resolve())):
            raise BadRequestException("非法文件路径")
        if not target_path.exists():
            raise NotFoundException("文件不存在")
        target_path.unlink()
        return DeleteFileResult(storage_key=storage_key)

    def get_public_url(self, storage_key: str) -> str:
        normalized = storage_key.replace("\\", "/").lstrip("/")
        return f"/uploads/{normalized}"


file_storage_service = LocalFileStorageService()


def get_upload_policy() -> FileUploadPolicy:
    return FileUploadPolicy(
        max_size_mb=settings.upload_max_size_mb,
        allowed_extensions=settings.upload_allowed_extensions,
    )
