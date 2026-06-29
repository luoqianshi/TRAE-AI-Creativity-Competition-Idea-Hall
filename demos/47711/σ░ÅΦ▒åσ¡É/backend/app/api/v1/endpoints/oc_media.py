from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.media import DeleteMediaResult, MediaAssetRead, OCMediaCollection
from app.schemas.response import ApiResponse, success_response
from app.services.media_service import (
    create_media_asset,
    delete_media_asset,
    list_oc_media,
)


router = APIRouter(prefix="/ocs", tags=["oc-media"])


@router.get("/{oc_id}/media", response_model=ApiResponse[OCMediaCollection])
def get_oc_media(
    oc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[OCMediaCollection]:
    return success_response(
        list_oc_media(db, user_id=current_user.id, oc_id=oc_id),
        message="获取 OC 素材成功",
    )


@router.post("/{oc_id}/images", response_model=ApiResponse[MediaAssetRead])
def upload_oc_image(
    oc_id: str,
    file: UploadFile = File(...),
    mime_type: Annotated[str | None, Form()] = None,
    width: Annotated[int | None, Form()] = None,
    height: Annotated[int | None, Form()] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[MediaAssetRead]:
    asset = create_media_asset(
        db,
        user_id=current_user.id,
        biz_type="oc",
        biz_id=oc_id,
        file_type="image",
        file=file,
        mime_type=mime_type,
        width=width,
        height=height,
    )
    return success_response(asset, message="OC 图片上传成功")


@router.post("/{oc_id}/videos", response_model=ApiResponse[MediaAssetRead])
def upload_oc_video(
    oc_id: str,
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
        biz_type="oc",
        biz_id=oc_id,
        file_type="video",
        file=file,
        mime_type=mime_type,
        width=width,
        height=height,
        duration=duration,
    )
    return success_response(asset, message="OC 视频上传成功")


@router.delete("/{oc_id}/media/{media_id}", response_model=ApiResponse[DeleteMediaResult])
def delete_oc_media(
    oc_id: str,
    media_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[DeleteMediaResult]:
    asset = delete_media_asset(
        db,
        user_id=current_user.id,
        media_id=media_id,
        biz_type="oc",
        biz_id=oc_id,
    )
    return success_response(DeleteMediaResult(id=asset.id), message="OC 素材删除成功")
