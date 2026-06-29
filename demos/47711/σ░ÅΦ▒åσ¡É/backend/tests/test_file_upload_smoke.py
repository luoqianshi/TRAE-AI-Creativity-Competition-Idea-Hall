import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.api.deps import get_current_user  # noqa: E402
from app.api.v1.endpoints.file import router as file_router  # noqa: E402
from app.core.exception_handlers import register_exception_handlers  # noqa: E402
from app.services.file_service import file_storage_service  # noqa: E402


class FileUploadSmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.temp_dir = tempfile.TemporaryDirectory()
        file_storage_service.base_path = Path(cls.temp_dir.name)

        app = FastAPI()
        register_exception_handlers(app)
        app.include_router(file_router, prefix="/api/v1")

        def override_get_current_user():
            return SimpleNamespace(id=1)

        app.dependency_overrides[get_current_user] = override_get_current_user
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.temp_dir.cleanup()

    def test_get_policy_returns_upload_limits(self) -> None:
        response = self.client.get("/api/v1/file/policy")

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["code"], 0)
        self.assertIn(".png", body["data"]["allowed_extensions"])

    def test_upload_file_saves_to_folder(self) -> None:
        response = self.client.post(
            "/api/v1/file/upload",
            data={"folder": "avatars"},
            files={"file": ("demo.png", b"png-bytes", "image/png")},
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["code"], 0)
        self.assertEqual(body["data"]["original_filename"], "demo.png")
        storage_key = body["data"]["storage_key"]
        self.assertTrue(storage_key.startswith("avatars/"))
        self.assertTrue((Path(self.temp_dir.name) / storage_key).exists())


if __name__ == "__main__":
    unittest.main()
