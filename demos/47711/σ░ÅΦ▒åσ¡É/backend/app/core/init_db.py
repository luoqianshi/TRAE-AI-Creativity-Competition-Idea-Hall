from sqlalchemy import create_engine, text

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import SessionLocal, engine


def create_database_if_not_exists() -> None:
    if settings.use_sqlite:
        return

    server_engine = create_engine(
        settings.server_url,
        pool_pre_ping=True,
        isolation_level="AUTOCOMMIT",
    )
    create_database_sql = text(
        f"CREATE DATABASE IF NOT EXISTS `{settings.mysql_database}` "
        "DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    )
    with server_engine.connect() as connection:
        connection.execute(create_database_sql)
    server_engine.dispose()


def init_db() -> None:
    settings.upload_path.mkdir(parents=True, exist_ok=True)
    settings.sqlite_path.parent.mkdir(parents=True, exist_ok=True)
    create_database_if_not_exists()
    Base.metadata.create_all(bind=engine)
    seed_reference_data()
    seed_demo_local_account()


def seed_reference_data() -> None:
    from app.services.activity_service import ensure_activity_seed_data
    from app.services.shop_service import ensure_default_products

    with SessionLocal() as db:
        ensure_default_products(db)
        ensure_activity_seed_data(db)


def seed_demo_local_account() -> None:
    if settings.app_env.lower() != "local":
        return

    from app.models.oc import OC
    from app.models.user import User
    from app.models.user_profile import UserProfile

    with SessionLocal() as db:
        if db.query(User).count() > 0:
            return

        demo_user = User(
            username="demo",
            phone="13800000000",
            password_hash=get_password_hash("demo123456"),
        )
        db.add(demo_user)
        db.flush()

        db.add(
            UserProfile(
                user_id=demo_user.id,
                nickname="艾薇拉",
                mood="准备出发",
                avatar="",
                phone_verified=True,
            )
        )
        db.add(
            OC(
                user_id=demo_user.id,
                name="艾薇拉",
                title="旅人",
                emoji="⚔️",
                avatar="",
                gradient="linear-gradient(135deg, #f9a8d4, #c084fc)",
                bar_color="#c084fc",
                story="行走在旧世界边缘的双刃剑使，擅长在废墟与星火之间寻找答案。",
                tags=["角色卡", "战斗", "风格"],
                voice_lines=["我会把答案带回来。", "别眨眼，战斗要开始了。"],
                height="168cm",
                weight="48kg",
                personality=["冷静", "可靠", "略带倔强"],
                alignment="中立善良",
                skills=["双刃剑术", "火焰冲刺", "高速回避"],
                weaknesses=["近战受限", "过度专注"],
                catchphrases=["出发。", "别挡路。"],
                timeline=["在废墟中醒来", "踏上寻找真相的旅程"],
                level=12,
                stats={"intimacy": 72, "combat": 88, "emotion": 64},
            )
        )
        db.commit()
