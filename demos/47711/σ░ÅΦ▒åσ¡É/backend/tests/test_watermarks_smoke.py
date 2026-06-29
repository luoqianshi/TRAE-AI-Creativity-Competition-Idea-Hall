import sys
import unittest
from pathlib import Path
from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.api.deps import get_current_user, get_db  # noqa: E402
from app.api.v1.endpoints.watermarks import router as watermarks_router  # noqa: E402
from app.core.exception_handlers import register_exception_handlers  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.watermark_preset import WatermarkPreset  # noqa: E402,F401


class WatermarkPresetSmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        cls.SessionLocal = sessionmaker(
            bind=cls.engine,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
        )
        Base.metadata.create_all(bind=cls.engine)

        with cls.SessionLocal() as db:
            db.add(User(username="tester", phone="13800000000", password_hash="hashed"))
            db.commit()

        app = FastAPI()
        register_exception_handlers(app)
        app.include_router(watermarks_router, prefix="/api/v1")

        def override_get_db():
            db = cls.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        def override_get_current_user():
            return SimpleNamespace(id=1)

        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_user] = override_get_current_user
        cls.client = TestClient(app)

    def setUp(self) -> None:
        with self.SessionLocal() as db:
            db.query(WatermarkPreset).delete()
            db.commit()

    def test_get_presets_returns_empty_list_by_default(self) -> None:
        response = self.client.get("/api/v1/watermarks/presets")

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["code"], 0)
        self.assertEqual(body["data"], [])

    def test_put_presets_then_get_returns_synced_order(self) -> None:
        payload = {
            "presets": [
                {
                    "type": "text",
                    "mode": "tile",
                    "text_content": "仅供展示",
                    "font_size": 24,
                    "color": "rgba(255,255,255,0.8)",
                    "opacity": 0.35,
                    "angle": -45,
                    "spacing": "medium",
                    "position": "bottom-right",
                    "scale": 0.5,
                },
                {
                    "type": "image",
                    "mode": "fixed",
                    "text_content": None,
                    "font_size": 24,
                    "color": "rgba(255,255,255,0.8)",
                    "opacity": 0.4,
                    "angle": -15,
                    "spacing": "sparse",
                    "position": "top-left",
                    "scale": 0.8,
                },
            ]
        }

        put_response = self.client.put("/api/v1/watermarks/presets", json=payload)
        get_response = self.client.get("/api/v1/watermarks/presets")

        self.assertEqual(put_response.status_code, 200)
        put_body = put_response.json()
        self.assertEqual(put_body["code"], 0)
        self.assertEqual(len(put_body["data"]), 2)
        self.assertEqual(put_body["data"][0]["sort_order"], 0)
        self.assertEqual(put_body["data"][0]["text_content"], "仅供展示")
        self.assertEqual(put_body["data"][1]["sort_order"], 1)
        self.assertEqual(put_body["data"][1]["type"], "image")
        self.assertIsNone(put_body["data"][1]["text_content"])

        self.assertEqual(get_response.status_code, 200)
        get_body = get_response.json()
        self.assertEqual([item["sort_order"] for item in get_body["data"]], [0, 1])
        self.assertEqual(
            [item["mode"] for item in get_body["data"]],
            ["tile", "fixed"],
        )


if __name__ == "__main__":
    unittest.main()
