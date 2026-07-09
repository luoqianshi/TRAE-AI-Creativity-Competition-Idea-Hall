import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import bpy
from mathutils import Vector, Euler
import math

from .conf import get_env


def get_active_camera(context: bpy.types.Context) -> Optional[bpy.types.Object]:
    if context.scene.camera:
        return context.scene.camera
    for obj in context.selected_objects:
        if obj.type == 'CAMERA':
            return obj
    for obj in context.scene.objects:
        if obj.type == 'CAMERA':
            return obj
    return None


def get_selected_or_center(context: bpy.types.Context) -> Vector:
    if context.selected_objects:
        loc = Vector((0, 0, 0))
        count = 0
        for obj in context.selected_objects:
            loc += obj.location
            count += 1
        if count > 0:
            return loc / count
    if context.active_object:
        return context.active_object.location.copy()
    return Vector((0, 0, 0))


def apply_easing(t: float, easing: str) -> float:
    if easing == "linear":
        return t
    elif easing == "ease_in":
        return t * t
    elif easing == "ease_out":
        return 1 - (1 - t) * (1 - t)
    elif easing == "ease_in_out":
        if t < 0.5:
            return 2 * t * t
        else:
            return 1 - pow(-2 * t + 2, 2) / 2
    return t


def clear_camera_animation(camera_obj: bpy.types.Object):
    if camera_obj.animation_data and camera_obj.animation_data.action:
        camera_obj.animation_data_clear()


def apply_orbit_preset(
    camera_obj: bpy.types.Object,
    camera_data: Dict,
    target_loc: Vector,
    duration: float,
    fps: float,
):
    clear_camera_animation(camera_obj)

    radius = camera_data.get("radius", 5.0)
    height = camera_data.get("height", 1.5)
    target_offset_z = camera_data.get("target_offset_z", 0.0)
    start_angle = math.radians(camera_data.get("start_angle", 0))
    end_angle = math.radians(camera_data.get("end_angle", 360))
    easing = camera_data.get("easing", "ease_in_out")

    scene = bpy.context.scene
    scene.render.fps = int(fps)
    frame_start = scene.frame_current
    frame_end = frame_start + int(duration * fps)

    center = target_loc + Vector((0, 0, target_offset_z))

    for i in range(int(duration * fps) + 1):
        t = i / (duration * fps) if (duration * fps) > 0 else 0
        eased_t = apply_easing(t, easing)
        angle = start_angle + (end_angle - start_angle) * eased_t

        x = center.x + radius * math.cos(angle)
        y = center.y + radius * math.sin(angle)
        z = center.z + height

        frame = int(frame_start + i)
        camera_obj.location = Vector((x, y, z))
        camera_obj.keyframe_insert(data_path="location", frame=frame)

        direction = center - camera_obj.location
        direction.normalize()
        rot_quat = direction.to_track_quat('-Z', 'Y')
        camera_obj.rotation_euler = rot_quat.to_euler()
        camera_obj.keyframe_insert(data_path="rotation_euler", frame=frame)

    scene.frame_end = max(scene.frame_end, frame_end)
    scene.frame_set(frame_start)


def apply_dolly_preset(
    camera_obj: bpy.types.Object,
    camera_data: Dict,
    target_loc: Vector,
    duration: float,
    fps: float,
):
    clear_camera_animation(camera_obj)

    start_distance = camera_data.get("start_distance", 15.0)
    end_distance = camera_data.get("end_distance", 2.0)
    height = camera_data.get("height", 1.5)
    easing = camera_data.get("easing", "ease_in")

    scene = bpy.context.scene
    scene.render.fps = int(fps)
    frame_start = scene.frame_current

    base_dir = (camera_obj.location - target_loc).normalized()
    if base_dir.length < 0.001:
        base_dir = Vector((0, -1, 0))

    for i in range(int(duration * fps) + 1):
        t = i / (duration * fps) if (duration * fps) > 0 else 0
        eased_t = apply_easing(t, easing)
        dist = start_distance + (end_distance - start_distance) * eased_t

        pos = target_loc + base_dir * dist
        pos.z = target_loc.z + height

        frame = int(frame_start + i)
        camera_obj.location = pos
        camera_obj.keyframe_insert(data_path="location", frame=frame)

        direction = target_loc + Vector((0, 0, 1)) - camera_obj.location
        direction.normalize()
        rot_quat = direction.to_track_quat('-Z', 'Y')
        camera_obj.rotation_euler = rot_quat.to_euler()
        camera_obj.keyframe_insert(data_path="rotation_euler", frame=frame)

    scene.frame_end = max(scene.frame_end, frame_start + int(duration * fps))


def apply_pan_preset(
    camera_obj: bpy.types.Object,
    camera_data: Dict,
    target_loc: Vector,
    duration: float,
    fps: float,
):
    clear_camera_animation(camera_obj)

    start_x = camera_data.get("start_x", -5.0)
    end_x = camera_data.get("end_x", 5.0)
    height = camera_data.get("height", 1.5)
    distance = camera_data.get("distance", 8.0)
    easing = camera_data.get("easing", "ease_in_out")

    scene = bpy.context.scene
    scene.render.fps = int(fps)
    frame_start = scene.frame_current

    for i in range(int(duration * fps) + 1):
        t = i / (duration * fps) if (duration * fps) > 0 else 0
        eased_t = apply_easing(t, easing)
        x = start_x + (end_x - start_x) * eased_t

        pos = Vector((target_loc.x + x, target_loc.y - distance, target_loc.z + height))
        frame = int(frame_start + i)
        camera_obj.location = pos
        camera_obj.keyframe_insert(data_path="location", frame=frame)

        direction = target_loc - camera_obj.location
        direction.normalize()
        rot_quat = direction.to_track_quat('-Z', 'Y')
        camera_obj.rotation_euler = rot_quat.to_euler()
        camera_obj.keyframe_insert(data_path="rotation_euler", frame=frame)

    scene.frame_end = max(scene.frame_end, frame_start + int(duration * fps))


def apply_crane_preset(
    camera_obj: bpy.types.Object,
    camera_data: Dict,
    target_loc: Vector,
    duration: float,
    fps: float,
):
    clear_camera_animation(camera_obj)

    start_z = camera_data.get("start_z", 0.5)
    end_z = camera_data.get("end_z", 8.0)
    distance = camera_data.get("distance", 10.0)
    tilt_angle = camera_data.get("tilt_angle", 0)
    easing = camera_data.get("easing", "ease_in_out")

    scene = bpy.context.scene
    scene.render.fps = int(fps)
    frame_start = scene.frame_current

    base_pos = camera_obj.location.copy()

    for i in range(int(duration * fps) + 1):
        t = i / (duration * fps) if (duration * fps) > 0 else 0
        eased_t = apply_easing(t, easing)
        z = start_z + (end_z - start_z) * eased_t

        pos = Vector((
            target_loc.x,
            target_loc.y - distance,
            target_loc.z + z,
        ))
        frame = int(frame_start + i)
        camera_obj.location = pos
        camera_obj.keyframe_insert(data_path="location", frame=frame)

        tilt = math.radians(tilt_angle * eased_t)
        look_target = target_loc + Vector((0, 0, 0))
        direction = look_target - camera_obj.location
        direction.normalize()
        rot_quat = direction.to_track_quat('-Z', 'Y')
        rot_euler = rot_quat.to_euler()
        rot_euler.x += tilt
        camera_obj.rotation_euler = rot_euler
        camera_obj.keyframe_insert(data_path="rotation_euler", frame=frame)

    scene.frame_end = max(scene.frame_end, frame_start + int(duration * fps))


def apply_track_preset(
    camera_obj: bpy.types.Object,
    camera_data: Dict,
    target_loc: Vector,
    duration: float,
    fps: float,
):
    clear_camera_animation(camera_obj)

    path_points_raw = camera_data.get("path_points", [])
    if len(path_points_raw) < 2:
        get_env().log("Track preset requires at least 2 path points")
        return

    path_points = [Vector(p) for p in path_points_raw]
    easing = camera_data.get("easing", "ease_in_out")

    scene = bpy.context.scene
    scene.render.fps = int(fps)
    frame_start = scene.frame_current

    path_points_3d = [Vector((target_loc.x + p.x, target_loc.y + p.y, target_loc.z + p.z)) for p in path_points]

    for i in range(int(duration * fps) + 1):
        t = i / (duration * fps) if (duration * fps) > 0 else 0
        eased_t = apply_easing(t, easing)

        segment_count = len(path_points_3d) - 1
        seg_t = eased_t * segment_count
        seg_index = min(int(seg_t), segment_count - 1)
        local_t = seg_t - seg_index
        local_t = max(0, min(1, local_t))

        p0 = path_points_3d[seg_index]
        p1 = path_points_3d[min(seg_index + 1, len(path_points_3d) - 1)]

        pos = p0.lerp(p1, local_t)
        frame = int(frame_start + i)
        camera_obj.location = pos
        camera_obj.keyframe_insert(data_path="location", frame=frame)

        if seg_index + 1 < len(path_points_3d):
            look_target = path_points_3d[seg_index + 1]
        else:
            look_target = path_points_3d[-1]
        direction = look_target - camera_obj.location
        if direction.length > 0.001:
            direction.normalize()
            rot_quat = direction.to_track_quat('-Z', 'Y')
            camera_obj.rotation_euler = rot_quat.to_euler()
        camera_obj.keyframe_insert(data_path="rotation_euler", frame=frame)

    scene.frame_end = max(scene.frame_end, frame_start + int(duration * fps))


def apply_handheld_preset(
    camera_obj: bpy.types.Object,
    camera_data: Dict,
    target_loc: Vector,
    duration: float,
    fps: float,
):
    clear_camera_animation(camera_obj)

    intensity = camera_data.get("intensity", 0.05)
    frequency = camera_data.get("frequency", 2.0)
    rotation_intensity = camera_data.get("rotation_intensity", 0.03)
    base_distance = camera_data.get("base_distance", 5.0)
    base_height = camera_data.get("base_height", 1.5)

    import random
    random.seed(42)

    scene = bpy.context.scene
    scene.render.fps = int(fps)
    frame_start = scene.frame_current

    base_dir = Vector((0, -base_distance, 0))
    base_pos = target_loc + Vector((0, 0, base_height)) + base_dir
    camera_obj.location = base_pos

    direction = target_loc - camera_obj.location
    if direction.length > 0.001:
        direction.normalize()
        rot_quat = direction.to_track_quat('-Z', 'Y')
        base_rot = rot_quat.to_euler()
    else:
        base_rot = Euler((0, 0, 0))

    for i in range(int(duration * fps) + 1):
        t = i / float(fps)
        frame = int(frame_start + i)

        shake_x = math.sin(t * frequency * 2.3) * intensity
        shake_y = math.cos(t * frequency * 1.7) * intensity
        shake_z = math.sin(t * frequency * 1.3) * intensity * 0.5
        pos = base_pos + Vector((shake_x, shake_y, shake_z))
        camera_obj.location = pos
        camera_obj.keyframe_insert(data_path="location", frame=frame)

        rot_x = base_rot.x + math.sin(t * frequency * 1.9) * rotation_intensity
        rot_y = base_rot.y + math.cos(t * frequency * 2.1) * rotation_intensity * 0.5
        rot_z = base_rot.z + math.sin(t * frequency * 2.5) * rotation_intensity * 0.3
        camera_obj.rotation_euler = Euler((rot_x, rot_y, rot_z))
        camera_obj.keyframe_insert(data_path="rotation_euler", frame=frame)

    scene.frame_end = max(scene.frame_end, frame_start + int(duration * fps))


def apply_spiral_preset(
    camera_obj: bpy.types.Object,
    camera_data: Dict,
    target_loc: Vector,
    duration: float,
    fps: float,
):
    clear_camera_animation(camera_obj)

    radius = camera_data.get("radius", 4.0)
    start_z = camera_data.get("start_z", 0.5)
    end_z = camera_data.get("end_z", 6.0)
    rotations = camera_data.get("rotations", 1.5)
    easing = camera_data.get("easing", "ease_in_out")

    scene = bpy.context.scene
    scene.render.fps = int(fps)
    frame_start = scene.frame_current

    for i in range(int(duration * fps) + 1):
        t = i / (duration * fps) if (duration * fps) > 0 else 0
        eased_t = apply_easing(t, easing)

        angle = eased_t * rotations * 2 * math.pi
        x = target_loc.x + radius * math.cos(angle)
        y = target_loc.y + radius * math.sin(angle)
        z = target_loc.z + start_z + (end_z - start_z) * eased_t

        frame = int(frame_start + i)
        camera_obj.location = Vector((x, y, z))
        camera_obj.keyframe_insert(data_path="location", frame=frame)

        direction = target_loc - camera_obj.location
        direction.normalize()
        rot_quat = direction.to_track_quat('-Z', 'Y')
        camera_obj.rotation_euler = rot_quat.to_euler()
        camera_obj.keyframe_insert(data_path="rotation_euler", frame=frame)

    scene.frame_end = max(scene.frame_end, frame_start + int(duration * fps))


PRESET_APPLIERS = {
    "orbit": apply_orbit_preset,
    "dolly": apply_dolly_preset,
    "pan": apply_pan_preset,
    "crane": apply_crane_preset,
    "track": apply_track_preset,
    "handheld": apply_handheld_preset,
    "spiral": apply_spiral_preset,
}


def apply_preset(preset: Dict, context: bpy.types.Context) -> Tuple[bool, str]:
    camera_obj = get_active_camera(context)
    if not camera_obj:
        return False, "未找到相机对象，请先选择或创建相机"

    camera_data = preset.get("camera_data", {})
    preset_type = camera_data.get("type", "orbit")
    duration = preset.get("duration", 10.0)
    fps = preset.get("fps", 30.0)

    target_loc = get_selected_or_center(context)

    applier = PRESET_APPLIERS.get(preset_type)
    if not applier:
        return False, f"不支持的运镜类型: {preset_type}"

    try:
        applier(camera_obj, camera_data, target_loc, duration, fps)
        return True, f"已应用运镜方案: {preset['name']}"
    except Exception as e:
        get_env().log(f"Failed to apply preset: {e}")
        return False, f"应用失败: {str(e)}"


def import_preset_from_file(filepath: str) -> Tuple[bool, str, Optional[List[Dict]]]:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if isinstance(data, dict) and "presets" in data:
            presets = data["presets"]
        elif isinstance(data, list):
            presets = data
        elif isinstance(data, dict):
            presets = [data]
        else:
            return False, "无效的预设文件格式", None
        return True, f"成功导入 {len(presets)} 个预设", presets
    except Exception as e:
        return False, f"导入失败: {str(e)}", None


def export_preset_to_file(preset: Dict, filepath: str) -> Tuple[bool, str]:
    try:
        export_data = {
            "version": "1.0",
            "presets": [preset],
        }
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)
        return True, f"已导出到: {filepath}"
    except Exception as e:
        return False, f"导出失败: {str(e)}"


def save_user_preset(preset: Dict) -> Tuple[bool, str]:
    user_path = get_env().get_user_presets_path()
    if not user_path.exists():
        user_path.mkdir(parents=True, exist_ok=True)
    filename = preset.get("name", "untitled").replace(" ", "_").replace("/", "_") + ".json"
    filepath = user_path / filename
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(preset, f, ensure_ascii=False, indent=2)
        get_env().refresh_presets()
        return True, f"已保存到: {filepath}"
    except Exception as e:
        return False, f"保存失败: {str(e)}"


def register():
    pass


def unregister():
    pass
