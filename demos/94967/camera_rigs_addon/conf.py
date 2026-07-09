import os
from pathlib import Path
from typing import Dict, List, Optional
import json

import bpy
from bpy.utils.previews import ImagePreviewCollection


MCPREP_RESOURCES: Path = Path(os.path.dirname(__file__), "resources")
DATA_DIR: Path = Path(os.path.dirname(__file__), "data")
DEFAULT_PRESETS_PATH: Path = Path(DATA_DIR, "presets.json")

CATEGORY_ITEMS = [
    ("ALL", "全部", "所有运镜方案"),
    ("orbit", "环绕镜头", "环绕目标的运镜方案"),
    ("dolly", "推拉镜头", "推近拉远的运镜方案"),
    ("pan", "摇镜头", "水平摇动的运镜方案"),
    ("crane", "升降镜头", "垂直升降的运镜方案"),
    ("track", "轨道镜头", "沿轨道运动的运镜方案"),
    ("handheld", "手持镜头", "模拟手持拍摄的运镜方案"),
]

EASING_ITEMS = [
    ("linear", "线性", "匀速运动"),
    ("ease_in", "缓入", "慢速开始，加速结束"),
    ("ease_out", "缓出", "快速开始，减速结束"),
    ("ease_in_out", "缓入缓出", "慢速开始，中间加速，减速结束"),
]


class CameraRigsEnv:
    def __init__(self):
        self.verbose: bool = True

        dev_file: Path = Path(os.path.dirname(__file__), "dev.txt")
        if dev_file.exists():
            self.verbose = True

        self._presets_cache: Optional[List[Dict]] = None
        self._user_presets_cache: Optional[List[Dict]] = None

        self.use_icons: bool = True
        self.preview_collections: Dict[str, ImagePreviewCollection] = {}

    def icons_init(self):
        self.clear_previews()
        collection_sets = ["main"]
        try:
            for iconset in collection_sets:
                self.preview_collections[iconset] = bpy.utils.previews.new()
            icons_dir = os.path.join(os.path.dirname(__file__), "icons")
            if os.path.isdir(icons_dir):
                for fname in os.listdir(icons_dir):
                    if fname.endswith(".png"):
                        name = fname[:-4]
                        self.preview_collections["main"].load(
                            name,
                            os.path.join(icons_dir, fname),
                            'IMAGE')
        except Exception as e:
            self.log(f"Icons not available: {e}")
            self.use_icons = False
            for iconset in collection_sets:
                self.preview_collections[iconset] = ""

    def clear_previews(self):
        for pcoll in self.preview_collections.values():
            try:
                bpy.utils.previews.remove(pcoll)
            except Exception:
                pass
        self.preview_collections.clear()

    def log(self, statement: str):
        if self.verbose:
            print(f"[Camera Rigs] {statement}")

    def get_default_presets(self) -> List[Dict]:
        if self._presets_cache is not None:
            return self._presets_cache
        if not DEFAULT_PRESETS_PATH.exists():
            self.log(f"Presets file not found: {DEFAULT_PRESETS_PATH}")
            self._presets_cache = []
            return self._presets_cache
        with open(DEFAULT_PRESETS_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        self._presets_cache = data.get("presets", [])
        return self._presets_cache

    def get_user_presets_path(self) -> Path:
        addon_prefs = get_addon_preferences()
        if addon_prefs and addon_prefs.user_presets_path:
            path = Path(bpy.path.abspath(addon_prefs.user_presets_path))
        else:
            path = Path(DATA_DIR, "user_presets")
        if not path.exists():
            path.mkdir(parents=True, exist_ok=True)
        return path

    def get_user_presets(self) -> List[Dict]:
        self._user_presets_cache = []
        user_path = self.get_user_presets_path()
        if not user_path.exists():
            return []
        for f in sorted(user_path.glob("*.json")):
            try:
                with open(f, 'r', encoding='utf-8') as fh:
                    data = json.load(fh)
                if isinstance(data, list):
                    self._user_presets_cache.extend(data)
                elif isinstance(data, dict) and "presets" in data:
                    self._user_presets_cache.extend(data["presets"])
                elif isinstance(data, dict):
                    self._user_presets_cache.append(data)
            except Exception as e:
                self.log(f"Failed to load user preset: {f} - {e}")
        return self._user_presets_cache

    def get_all_presets(self) -> List[Dict]:
        return self.get_default_presets() + self.get_user_presets()

    def refresh_presets(self):
        self._presets_cache = None
        self._user_presets_cache = None


env = None


def get_env():
    global env
    if env is None:
        env = CameraRigsEnv()
    return env


def get_addon_preferences():
    addon_name = os.path.basename(os.path.dirname(__file__))
    try:
        return bpy.context.preferences.addons[addon_name].preferences
    except (KeyError, AttributeError):
        return None


def register():
    try:
        get_env().icons_init()
    except Exception as e:
        print(f"[Camera Rigs] Failed to init icons during register: {e}")


def unregister():
    if env is not None:
        env.clear_previews()
