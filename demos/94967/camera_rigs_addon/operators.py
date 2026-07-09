import json

import bpy
from mathutils import Vector

from .conf import get_env
from . import utils


class CAMERARIGS_OT_apply_preset(bpy.types.Operator):
    """将选中的运镜预设应用到当前场景的相机"""
    bl_idname = "camera_rigs.apply_preset"
    bl_label = "应用运镜方案"
    bl_options = {'REGISTER', 'UNDO'}

    preset_name: bpy.props.StringProperty(
        name="预设名称",
        default="",
    )

    @classmethod
    def poll(cls, context):
        return context.mode == 'OBJECT'

    def execute(self, context):
        all_presets = get_env().get_all_presets()
        preset = None
        for p in all_presets:
            if p.get("name") == self.preset_name:
                preset = p
                break
        if not preset:
            self.report({'ERROR'}, "未找到运镜预设")
            return {'CANCELLED'}

        success, message = utils.apply_preset(preset, context)
        if success:
            self.report({'INFO'}, message)
            return {'FINISHED'}
        else:
            self.report({'ERROR'}, message)
            return {'CANCELLED'}


class CAMERARIGS_OT_preview_preset(bpy.types.Operator):
    """预览运镜效果（播放动画）"""
    bl_idname = "camera_rigs.preview_preset"
    bl_label = "预览运镜"
    bl_options = {'REGISTER', 'UNDO'}

    preset_name: bpy.props.StringProperty(
        name="预设名称",
        default="",
    )

    @classmethod
    def poll(cls, context):
        return context.mode == 'OBJECT'

    def execute(self, context):
        all_presets = get_env().get_all_presets()
        preset = None
        for p in all_presets:
            if p.get("name") == self.preset_name:
                preset = p
                break
        if not preset:
            self.report({'ERROR'}, "未找到运镜预设")
            return {'CANCELLED'}

        success, message = utils.apply_preset(preset, context)
        if not success:
            self.report({'ERROR'}, message)
            return {'CANCELLED'}

        if not context.screen:
            return {'CANCELLED'}
        for area in context.screen.areas:
            if area.type == 'VIEW_3D':
                for space in area.spaces:
                    if space.type == 'VIEW_3D':
                        if space.region_3d:
                            space.region_3d.view_perspective = 'CAMERA'
        context.scene.frame_set(context.scene.frame_current)
        bpy.ops.screen.animation_play()
        return {'FINISHED'}


class CAMERARIGS_OT_create_camera(bpy.types.Operator):
    """在场景中创建新的相机对象"""
    bl_idname = "camera_rigs.create_camera"
    bl_label = "创建相机"
    bl_options = {'REGISTER', 'UNDO'}

    @classmethod
    def poll(cls, context):
        return context.mode == 'OBJECT'

    def execute(self, context):
        cam_data = bpy.data.cameras.new("CameraRig_Camera")
        cam_obj = bpy.data.objects.new("CameraRig_Camera", cam_data)
        context.collection.objects.link(cam_obj)
        target_loc = utils.get_selected_or_center(context)
        if target_loc.length > 0:
            cam_obj.location = target_loc + Vector((0, -5, 1.5))
        else:
            cam_obj.location = Vector((0, -5, 1.5))
        context.scene.camera = cam_obj
        bpy.ops.object.select_all(action='DESELECT')
        cam_obj.select_set(True)
        context.view_layer.objects.active = cam_obj
        self.report({'INFO'}, "已创建相机")
        return {'FINISHED'}


class CAMERARIGS_OT_clear_animation(bpy.types.Operator):
    """清除当前相机的所有动画关键帧"""
    bl_idname = "camera_rigs.clear_animation"
    bl_label = "清除动画"
    bl_options = {'REGISTER', 'UNDO'}

    @classmethod
    def poll(cls, context):
        return context.mode == 'OBJECT'

    def execute(self, context):
        cam = utils.get_active_camera(context)
        if not cam:
            self.report({'ERROR'}, "未找到相机")
            return {'CANCELLED'}
        utils.clear_camera_animation(cam)
        self.report({'INFO'}, "已清除相机动画")
        return {'FINISHED'}


class CAMERARIGS_OT_import_preset(bpy.types.Operator):
    """从JSON文件导入运镜预设"""
    bl_idname = "camera_rigs.import_preset"
    bl_label = "导入预设"
    bl_options = {'REGISTER', 'UNDO'}

    filepath: bpy.props.StringProperty(
        name="文件路径",
        subtype='FILE_PATH',
    )
    directory: bpy.props.StringProperty(subtype='DIR_PATH')
    files: bpy.props.CollectionProperty(
        type=bpy.types.OperatorFileListElement,
    )
    filter_glob: bpy.props.StringProperty(
        default="*.json",
        options={'HIDDEN'},
    )

    def execute(self, context):
        if not self.filepath and self.files:
            self.filepath = self.files[0].name
            if self.directory:
                self.filepath = self.directory + self.filepath
            else:
                self.filepath = self.files[0].name

        success, message, presets = utils.import_preset_from_file(self.filepath)
        if success and presets:
            for preset in presets:
                save_success, save_msg = utils.save_user_preset(preset)
                if not save_success:
                    self.report({'WARNING'}, f"部分预设导入失败: {save_msg}")
            self.report({'INFO'}, message)
            return {'FINISHED'}
        else:
            self.report({'ERROR'}, message)
            return {'CANCELLED'}

    def invoke(self, context, event):
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}


class CAMERARIGS_OT_export_preset(bpy.types.Operator):
    """将当前预设导出为JSON文件"""
    bl_idname = "camera_rigs.export_preset"
    bl_label = "导出预设"
    bl_options = {'REGISTER', 'UNDO'}

    filepath: bpy.props.StringProperty(
        name="文件路径",
        subtype='FILE_PATH',
    )
    filter_glob: bpy.props.StringProperty(
        default="*.json",
        options={'HIDDEN'},
    )
    preset_name: bpy.props.StringProperty(
        name="预设名称",
        default="",
    )

    def execute(self, context):
        all_presets = get_env().get_all_presets()
        preset = None
        for p in all_presets:
            if p.get("name") == self.preset_name:
                preset = p
                break
        if not preset:
            self.report({'ERROR'}, "未找到运镜预设")
            return {'CANCELLED'}
        if not self.filepath:
            self.report({'ERROR'}, "请选择保存路径")
            return {'CANCELLED'}
        success, message = utils.export_preset_to_file(preset, self.filepath)
        if success:
            self.report({'INFO'}, message)
            return {'FINISHED'}
        else:
            self.report({'ERROR'}, message)
            return {'CANCELLED'}

    def invoke(self, context, event):
        self.filepath = f"{self.preset_name}.json"
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}


class CAMERARIGS_OT_save_user_preset(bpy.types.Operator):
    """保存当前相机设置作为自定义运镜预设"""
    bl_idname = "camera_rigs.save_user_preset"
    bl_label = "保存为预设"
    bl_options = {'REGISTER', 'UNDO'}

    name: bpy.props.StringProperty(
        name="预设名称",
        default="我的运镜方案",
    )
    preset_type: bpy.props.EnumProperty(
        name="运镜类型",
        items=[
            ("orbit", "环绕镜头", ""),
            ("dolly", "推拉镜头", ""),
            ("pan", "摇镜头", ""),
            ("crane", "升降镜头", ""),
            ("track", "轨道镜头", ""),
            ("handheld", "手持镜头", ""),
            ("spiral", "螺旋上升", ""),
        ],
    )
    description: bpy.props.StringProperty(
        name="描述",
        default="自定义运镜方案",
    )
    category: bpy.props.StringProperty(
        name="分类",
        default="自定义",
    )
    duration: bpy.props.FloatProperty(
        name="持续时间（秒）",
        default=10.0,
        min=1.0,
        max=120.0,
    )
    fps: bpy.props.FloatProperty(
        name="帧率",
        default=30.0,
        min=12.0,
        max=120.0,
    )

    def execute(self, context):
        user_preset = {
            "name": self.name,
            "type": self.preset_type,
            "category": self.category,
            "tags": ["自定义", "用户上传"],
            "duration": self.duration,
            "fps": self.fps,
            "description": self.description,
            "camera_data": {
                "type": self.preset_type,
                "easing": "ease_in_out",
            },
            "compatible_software": ["Blender"],
            "author": "用户自定义",
            "downloads": 0,
        }
        success, message = utils.save_user_preset(user_preset)
        if success:
            self.report({'INFO'}, message)
            return {'FINISHED'}
        else:
            self.report({'ERROR'}, message)
            return {'CANCELLED'}

    def invoke(self, context, event):
        return context.window_manager.invoke_props_dialog(self)


class CAMERARIGS_OT_refresh_presets(bpy.types.Operator):
    """刷新运镜预设列表"""
    bl_idname = "camera_rigs.refresh_presets"
    bl_label = "刷新预设"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        get_env().refresh_presets()
        self.report({'INFO'}, "预设列表已刷新")
        return {'FINISHED'}


class CAMERARIGS_OT_open_preferences(bpy.types.Operator):
    """打开插件首选项"""
    bl_idname = "camera_rigs.open_preferences"
    bl_label = "打开首选项"

    def execute(self, context):
        bpy.ops.screen.userpref_show('INVOKE_AREA')
        context.preferences.active_section = "ADDONS"
        bpy.data.window_managers["WinMan"].addon_search = "Camera Rigs"
        return {'FINISHED'}


classes = (
    CAMERARIGS_OT_apply_preset,
    CAMERARIGS_OT_preview_preset,
    CAMERARIGS_OT_create_camera,
    CAMERARIGS_OT_clear_animation,
    CAMERARIGS_OT_import_preset,
    CAMERARIGS_OT_export_preset,
    CAMERARIGS_OT_save_user_preset,
    CAMERARIGS_OT_refresh_presets,
    CAMERARIGS_OT_open_preferences,
)


def register():
    for cls in classes:
        bpy.utils.register_class(cls)


def unregister():
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
