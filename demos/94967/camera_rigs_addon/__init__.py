bl_info = {
    "name": "Camera Rigs - 3D运镜方案辅助",
    "category": "Camera",
    "version": (1, 0, 0),
    "blender": (2, 80, 3),
    "location": "3D视图 > 侧边栏 > Camera Rigs",
    "description": "专业的3D运镜方案库，支持浏览/应用/分享相机运动预设",
    "warning": "",
    "wiki_url": "",
    "author": "Camera Rigs Team",
    "tracker_url": "",
}

import importlib

if "load_modules" in locals():
    importlib.reload(load_modules)
else:
    from . import load_modules

import bpy


def register():
    load_modules.register(bl_info)


def unregister():
    load_modules.unregister(bl_info)


if __name__ == "__main__":
    register()
