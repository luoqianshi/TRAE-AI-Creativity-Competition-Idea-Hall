import mimetypes
import re
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import BadRequestException, NotFoundException
from app.models.media_asset import MediaAsset
from app.schemas.media import OCMediaCollection


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".heic", ".heif"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv"}
MEDIA_EXTENSIONS = {
    "image": IMAGE_EXTENSIONS,
    "video": VIDEO_EXTENSIONS,
}
MEDIA_MIME_PREFIXES = {
    "image": "image/",
    "video": "video/",
}


def get_media_upload_policy() -> dict[str, object]:
    return {
        "max_size_mb": settings.upload_max_size_mb,
        "image_extensions": sorted(IMAGE_EXTENSIONS),
        "video_extensions": sorted(VIDEO_EXTENSIONS),
    }


def list_media_assets(
    db: Session,
    *,
    user_id: int,
    biz_type: str,
    biz_id: str,
    file_type: str | None = None,
) -> list[MediaAsset]:
    query = (
        db.query(MediaAsset)
        .filter(
            MediaAsset.user_id == user_id,
            MediaAsset.biz_type == biz_type,
            MediaAsset.biz_id == biz_id,
        )
        .order_by(MediaAsset.created_at.desc(), MediaAsset.id.desc())
    )
    if file_type:
        query = query.filter(MediaAsset.file_type == normalize_file_type(file_type))
    return query.all()


def list_oc_media(
    db: Session,
    *,
    user_id: int,
    oc_id: str,
) -> OCMediaCollection:
    items = list_media_assets(db, user_id=user_id, biz_type="oc", biz_id=normalize_biz_id(oc_id))
    images = [item for item in items if item.file_type == "image"]
    videos = [item for item in items if item.file_type == "video"]
    return OCMediaCollection(oc_id=normalize_biz_id(oc_id), images=images, videos=videos)


def create_media_asset(
    db: Session,
    *,
    user_id: int,
    biz_type: str,
    biz_id: str,
    file_type: str,
    file: UploadFile,
    mime_type: str | None = None,
    width: int | None = None,
    height: int | None = None,
    duration: float | None = None,
) -> MediaAsset:
    normalized_biz_type = normalize_biz_type(biz_type)
    normalized_biz_id = normalize_biz_id(biz_id)
    normalized_file_type = normalize_file_type(file_type)
    validate_media_metadata(width=width, height=height, duration=duration)
    suffix = get_validated_suffix(file, normalized_file_type)
    resolved_mime_type = resolve_mime_type(file, suffix, mime_type)
    validate_mime_type(normalized_file_type, resolved_mime_type)

    storage_key, size = save_upload_file(
        file,
        folder=build_media_folder(normalized_biz_type, normalized_biz_id, normalized_file_type),
        suffix=suffix,
    )
    public_url = build_public_url(storage_key)
    try:
        asset = MediaAsset(
            user_id=user_id,
            biz_type=normalized_biz_type,
            biz_id=normalized_biz_id,
            file_type=normalized_file_type,
            url=public_url,
            mime_type=resolved_mime_type,
            size=size,
            width=width,
            height=height,
            duration=duration,
        )
        db.add(asset)
        db.commit()
        db.refresh(asset)
        return asset
    except Exception:
        db.rollback()
        delete_local_file(public_url)
        raise


def delete_media_asset(
    db: Session,
    *,
    user_id: int,
    media_id: int,
    biz_type: str | None = None,
    biz_id: str | None = None,
) -> MediaAsset:
    query = db.query(MediaAsset).filter(
        MediaAsset.id == media_id,
        MediaAsset.user_id == user_id,
    )
    if biz_type is not None:
        query = query.filter(MediaAsset.biz_type == normalize_biz_type(biz_type))
    if biz_id is not None:
        query = query.filter(MediaAsset.biz_id == normalize_biz_id(biz_id))

    asset = query.first()
    if asset is None:
        raise NotFoundException("媒体资源不存在")

    delete_local_file(asset.url)
    db.delete(asset)
    db.commit()
    return asset


def build_media_folder(biz_type: str, biz_id: str, file_type: str) -> str:
    return f"media/{sanitize_segment(biz_type)}/{sanitize_segment(biz_id)}/{file_type}s"


def normalize_biz_type(biz_type: str) -> str:
    value = (biz_type or "").strip().lower()
    if not value:
        raise BadRequestException("biz_type 不能为空")
    return value


def normalize_biz_id(biz_id: str | int) -> str:
    value = str(biz_id).strip()
    if not value:
        raise BadRequestException("biz_id 不能为空")
    return value


def normalize_file_type(file_type: str) -> str:
    value = (file_type or "").strip().lower()
    if value not in MEDIA_EXTENSIONS:
        raise BadRequestException("file_type 仅支持 image 或 video")
    return value


def sanitize_segment(value: str) -> str:
    return re.sub(r"[^0-9A-Za-z_-]+", "_", value).strip("_") or "default"


def validate_media_metadata(
    *,
    width: int | None,
    height: int | None,
    duration: float | None,
) -> None:
    if width is not None and width <= 0:
        raise BadRequestException("width 必须大于 0")
    if height is not None and height <= 0:
        raise BadRequestException("height 必须大于 0")
    if duration is not None and duration <= 0:
        raise BadRequestException("duration 必须大于 0")


def get_validated_suffix(file: UploadFile, file_type: str) -> str:
    filename = file.filename or ""
    suffix = Path(filename).suffix.lower()
    if not suffix:
        raise BadRequestException("上传文件缺少扩展名")
    allowed_extensions = MEDIA_EXTENSIONS[file_type]
    if suffix not in allowed_extensions:
        raise BadRequestException(
            f"不支持的{file_type}类型: {suffix}，允许类型: {', '.join(sorted(allowed_extensions))}"
        )
    return suffix


def resolve_mime_type(
    file: UploadFile,
    suffix: str,
    explicit_mime_type: str | None = None,
) -> str | None:
    if explicit_mime_type:
        return explicit_mime_type.strip().lower()

    content_type = (file.content_type or "").strip().lower()
    if content_type and content_type != "application/octet-stream":
        return content_type

    guessed, _ = mimetypes.guess_type(f"file{suffix}")
    return guessed.lower() if guessed else None


def validate_mime_type(file_type: str, mime_type: str | None) -> None:
    if mime_type and not mime_type.startswith(MEDIA_MIME_PREFIXES[file_type]):
        raise BadRequestException(f"上传文件的 MIME 类型与 {file_type} 不匹配")


def save_upload_file(
    file: UploadFile,
    *,
    folder: str,
    suffix: str,
) -> tuple[str, int]:
    target_dir = (settings.upload_path / folder).resolve()
    target_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4().hex}{suffix}"
    target_path = target_dir / filename
    max_size = settings.upload_max_size_mb * 1024 * 1024
    current_size = 0

    file.file.seek(0)
    try:
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
    finally:
        file.file.seek(0)

    storage_key = f"{folder}/{filename}".replace("\\", "/")
    return storage_key, current_size


def build_public_url(storage_key: str) -> str:
    normalized = storage_key.replace("\\", "/").lstrip("/")
    return f"/uploads/{normalized}"


def delete_local_file(url: str) -> None:
    storage_key = url.replace("\\", "/").removeprefix("/uploads/").lstrip("/")
    if not storage_key:
        return

    target_path = (settings.upload_path / storage_key).resolve()
    upload_root = settings.upload_path.resolve()
    if not str(target_path).startswith(str(upload_root)):
        raise BadRequestException("非法媒体文件路径")
    if target_path.exists():
        target_path.unlink()
