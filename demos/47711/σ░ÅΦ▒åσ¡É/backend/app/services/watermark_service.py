from sqlalchemy.orm import Session

from app.models.user import User
from app.models.watermark_preset import WatermarkPreset
from app.schemas.watermark import WatermarkPresetPayload, WatermarkPresetRead


def list_watermark_presets(db: Session, current_user: User) -> list[WatermarkPresetRead]:
    presets = (
        db.query(WatermarkPreset)
        .filter(WatermarkPreset.user_id == current_user.id)
        .order_by(WatermarkPreset.sort_order.asc(), WatermarkPreset.id.asc())
        .all()
    )
    return [WatermarkPresetRead.model_validate(item) for item in presets]


def sync_watermark_presets(
    db: Session,
    current_user: User,
    presets: list[WatermarkPresetPayload],
) -> list[WatermarkPresetRead]:
    (
        db.query(WatermarkPreset)
        .filter(WatermarkPreset.user_id == current_user.id)
        .delete(synchronize_session=False)
    )

    db.add_all(
        [
            WatermarkPreset(
                user_id=current_user.id,
                sort_order=index,
                type=item.type,
                mode=item.mode,
                text_content=item.text_content,
                font_size=item.font_size,
                color=item.color,
                opacity=item.opacity,
                angle=item.angle,
                spacing=item.spacing,
                position=item.position,
                scale=item.scale,
            )
            for index, item in enumerate(presets)
        ]
    )
    db.commit()
    return list_watermark_presets(db, current_user)
