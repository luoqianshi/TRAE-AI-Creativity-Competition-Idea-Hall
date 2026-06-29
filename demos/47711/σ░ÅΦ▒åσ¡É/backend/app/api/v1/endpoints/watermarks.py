from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.response import ApiResponse, success_response
from app.schemas.watermark import WatermarkPresetRead, WatermarkPresetSyncRequest
from app.services.watermark_service import (
    list_watermark_presets,
    sync_watermark_presets,
)


router = APIRouter(prefix="/watermarks", tags=["watermarks"])


@router.get("/presets", response_model=ApiResponse[list[WatermarkPresetRead]])
def get_watermark_presets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[list[WatermarkPresetRead]]:
    presets = list_watermark_presets(db, current_user)
    return success_response(presets, message="获取水印预设成功")


@router.put("/presets", response_model=ApiResponse[list[WatermarkPresetRead]])
def put_watermark_presets(
    payload: WatermarkPresetSyncRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApiResponse[list[WatermarkPresetRead]]:
    presets = sync_watermark_presets(db, current_user, payload.presets)
    return success_response(presets, message="水印预设已同步")
