from typing import Annotated, Literal

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.media import DeleteMediaResult, MediaAssetRead, MediaUploadPolicy
from app.schemas.response import ApiResponse, success_response
from app.services.media_service import (
    create_media_asset,
    delete_media_asset,
    get_media_upload_policy,
)


router = APIRouter(prefix="/media", tags=["media"])


@router.get("/policy", response_model=ApiResponse[MediaUploadPolicy])
def get_upload_policy() -> ApiResponse[MediaUploadPolicy]:
    return success_response(
        MediaUploadPolicy(**get_media_upload_policy()),
        message="获取上传策略成功",
    )


@router.post("/upload", response_model=ApiResponse[MediaAssetRead])
def upload_media(
    biz_type: Annotated[str, Form(...)],
    biz_id: Annotated[str, Form(...)],
    file_type: Annotated[Literal["image", "video"], Form(...)],
    file: UploadFile = File(...),
    mime_type: Annotated[str | None, Form()] = None,
    width: Annotated[int | None, Form()] = None,
    height: Annotated[int | None, Form()] = None,
    duration: Annotated[float | None, Form()] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[MediaAssetRead]:
    asset = create_media_asset(
        db,
        user_id=current_user.id,
        biz_type=biz_type,
        biz_id=biz_id,
        file_type=file_type,
        file=file,
        mime_type=mime_type,
        width=width,
        height=height,
        duration=duration,
    )
    return success_response(asset, message="媒体上传成功")


@router.delete("/{media_id}", response_model=ApiResponse[DeleteMediaResult])
def delete_media(
    media_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[DeleteMediaResult]:
    asset = delete_media_asset(db, user_id=current_user.id, media_id=media_id)
    return success_response(DeleteMediaResult(id=asset.id), message="媒体删除成功")
