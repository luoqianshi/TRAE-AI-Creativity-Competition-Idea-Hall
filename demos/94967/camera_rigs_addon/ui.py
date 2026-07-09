import os
import bpy
from bpy.types import Context

from .conf import get_env, CATEGORY_ITEMS
from . import utils


# -----------------------------------------------------------------------------
# PropertyGroup 自定义类型
# -----------------------------------------------------------------------------

class CameraRigsPresetItem(bpy.types.PropertyGroup):
    name: bpy.props.StringProperty(name="方案名称")
    category: bpy.props.StringProperty(name="分类")
    description: bpy.props.StringProperty(name="描述")
    author: bpy.props.StringProperty(name="作者")
    duration: bpy.props.FloatProperty(name="时长")
    fps: bpy.props.FloatProperty(name="帧率")


class CameraRigsSceneProps(bpy.types.PropertyGroup):
    show_settings: bpy.props.BoolProperty(
        name="显示高级设置",
        description="显示高级设置选项",
        default=False,
    )


# -----------------------------------------------------------------------------
# AddonPreferences
# -----------------------------------------------------------------------------

class CameraRigsPreferences(bpy.types.AddonPreferences):
    bl_idname = __package__

    preferences_tab: bpy.props.EnumProperty(
        items=[
            ('general', '通用', '通用设置'),
            ('presets', '预设管理', '管理运镜预设'),
            ('about', '关于', '关于插件'),
        ],
        name="标签页",
    )

    user_presets_path: bpy.props.StringProperty(
        name="用户预设路径",
        description="存放用户自定义运镜预设的文件夹",
        subtype='DIR_PATH',
        default=os.path.join(os.path.dirname(__file__), "data", "user_presets"),
    )

    verbose: bpy.props.BoolProperty(
        name="详细日志",
        description="在控制台输出更多信息",
        default=False,
    )

    def draw(self, context):
        layout = self.layout
        row = layout.row()
        row.prop(self, "preferences_tab", expand=True)

        if self.preferences_tab == "general":
            box = layout.box()
            box.label(text="Camera Rigs - 3D运镜方案辅助", icon='CAMERA_DATA')
            box.label(text="版本: 1.0.0")
            box.label(text="兼容: Blender 2.80+")
            box.separator()
            box.label(text="适用于:")
            box.label(text="  • Blender")
            box.label(text="  • 3DSMAX（导出JSON格式）")
            box.label(text="  • Cinema 4D（导出JSON格式）")
            box.separator()
            box.prop(self, "verbose")

        elif self.preferences_tab == "presets":
            box = layout.box()
            box.label(text="预设管理", icon='FILE_FOLDER')
            box.prop(self, "user_presets_path", text="用户预设文件夹")
            row = box.row()
            row.operator("camera_rigs.refresh_presets", icon='FILE_REFRESH')
            row.operator("camera_rigs.import_preset", icon='IMPORT')

        elif self.preferences_tab == "about":
            box = layout.box()
            box.label(text="关于 Camera Rigs", icon='INFO')
            box.label(text="专业的3D运镜方案辅助工具")
            box.separator()
            box.label(text="7种运镜类型:")
            box.label(text="  • 环绕镜头 - 围绕目标旋转")
            box.label(text="  • 推拉镜头 - 推近拉远")
            box.label(text="  • 摇镜头   - 水平摇动")
            box.label(text="  • 升降镜头 - 垂直升降")
            box.label(text="  • 轨道镜头 - 沿路径运动")
            box.label(text="  • 手持镜头 - 模拟手持")
            box.label(text="  • 螺旋上升 - 螺旋爬升")


# -----------------------------------------------------------------------------
# UI: Main Panel
# -----------------------------------------------------------------------------

class CAMERARIGS_PT_main(bpy.types.Panel):
    bl_label = "Camera Rigs"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "Camera Rigs"
    bl_options = {'DEFAULT_CLOSED'}

    def draw(self, context):
        layout = self.layout

        box = layout.box()
        box.scale_y = 0.8
        col = box.column(align=True)
        col.label(text="3D运镜方案辅助工具", icon='CAMERA_DATA')
        col.label(text="为动画师提供专业的相机运动预设")

        box = layout.box()
        col = box.column(align=True)
        col.label(text="快速操作", icon='TOOL_SETTINGS')
        col.separator()
        col.operator("camera_rigs.create_camera", icon='ADD')
        cam = utils.get_active_camera(context)
        if cam:
            col.label(text=f"当前相机: {cam.name}")
        else:
            col.label(text="无活动相机", icon='ERROR')
            col = box.column(align=True)
            col.label(text="请选择相机或创建新相机")

    def draw_header(self, context):
        layout = self.layout
        if get_env().use_icons and get_env().preview_collections['main'] != "":
            icon = get_env().preview_collections['main'].get("camera_icon")
            if icon:
                layout.label(text="", icon_value=icon.icon_id)


# -----------------------------------------------------------------------------
# UI: Presets Sub-panel
# -----------------------------------------------------------------------------

class CAMERARIGS_PT_presets(bpy.types.Panel):
    bl_label = "运镜方案库"
    bl_parent_id = "CAMERARIGS_PT_main"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "Camera Rigs"

    def draw(self, context):
        layout = self.layout
        props = context.scene.camera_rigs_props

        cam = utils.get_active_camera(context)
        if not cam:
            box = layout.box()
            col = box.column(align=True)
            col.label(text="请先选择或创建相机", icon='ERROR')
            col.operator("camera_rigs.create_camera", icon='ADD')
            return

        col = layout.column(align=True)
        col.label(text="分类筛选", icon='FILTER')
        col.prop(context.scene, "camera_rigs_category", text="")

        all_presets = get_env().get_all_presets()
        selected_category = context.scene.camera_rigs_category
        if selected_category != "ALL":
            filtered = [p for p in all_presets if p.get("type") == selected_category]
        else:
            filtered = all_presets

        if not filtered:
            col = layout.column(align=True)
            col.label(text="当前分类无预设", icon='INFO')
            col.operator("camera_rigs.refresh_presets", icon='FILE_REFRESH')
            return

        col = layout.column(align=True)
        col.label(text=f"共 {len(filtered)} 个方案", icon='PRESET')

        for preset in filtered:
            box = layout.box()
            col = box.column(align=True)

            row = col.row()
            row.label(text=preset.get("name", "未命名"), icon='OUTLINER_OB_CAMERA')
            row = col.row()
            row.label(text=f"  时长: {preset.get('duration', '-')}s | FPS: {preset.get('fps', '-')}")

            if preset.get("description"):
                sub = col.row()
                sub.scale_y = 0.6
                sub.label(text=f"  {preset['description'][:60]}")

            if preset.get("author"):
                sub = col.row()
                sub.scale_y = 0.6
                sub.label(text=f"  作者: {preset['author']}")

            row = col.row(align=True)
            op = row.operator("camera_rigs.apply_preset", text="应用", icon='CHECKMARK')
            op.preset_name = preset.get("name", "")
            op = row.operator("camera_rigs.preview_preset", text="预览", icon='PLAY')
            op.preset_name = preset.get("name", "")

        col.separator()
        row = col.row(align=True)
        row.operator("camera_rigs.import_preset", icon='IMPORT')
        row.operator("camera_rigs.refresh_presets", icon='FILE_REFRESH')


# -----------------------------------------------------------------------------
# UI: Custom Preset Sub-panel
# -----------------------------------------------------------------------------

class CAMERARIGS_PT_custom(bpy.types.Panel):
    bl_label = "上传自定义方案"
    bl_parent_id = "CAMERARIGS_PT_main"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "Camera Rigs"
    bl_options = {'DEFAULT_CLOSED'}

    def draw(self, context):
        layout = self.layout
        props = context.scene.camera_rigs_props

        box = layout.box()
        col = box.column(align=True)
        col.label(text="分享您的运镜创作", icon='EXPORT')
        col.label(text="将当前相机设置保存为预设")

        col = box.column(align=True)
        col.operator("camera_rigs.save_user_preset", icon='ADD')

        box = layout.box()
        col = box.column(align=True)
        col.label(text="从文件导入预设", icon='IMPORT')
        col.label(text="支持从其他软件导出的JSON格式")
        col.operator("camera_rigs.import_preset", icon='FILE_FOLDER')

        box = layout.box()
        col = box.column(align=True)
        col.label(text="管理用户预设", icon='FILEBROWSER')
        col.operator("camera_rigs.open_preferences", icon='PREFERENCES').tab = "presets"


# -----------------------------------------------------------------------------
# UI: Settings Sub-panel
# -----------------------------------------------------------------------------

class CAMERARIGS_PT_settings(bpy.types.Panel):
    bl_label = "高级设置"
    bl_parent_id = "CAMERARIGS_PT_main"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "Camera Rigs"
    bl_options = {'DEFAULT_CLOSED'}

    def draw(self, context):
        layout = self.layout
        props = context.scene.camera_rigs_props

        cam = utils.get_active_camera(context)
        if cam:
            box = layout.box()
            col = box.column(align=True)
            col.label(text="相机操作", icon='CAMERA_DATA')
            col.operator("camera_rigs.clear_animation", icon='X')
            if cam.animation_data and cam.animation_data.action:
                col.label(text=f"动画: {cam.animation_data.action.name}")
            else:
                col.label(text="当前相机无动画")

        box = layout.box()
        col = box.column(align=True)
        col.label(text="全局设置", icon='SETTINGS')
        col.operator("camera_rigs.open_preferences", icon='PREFERENCES')
        col.operator("camera_rigs.refresh_presets", icon='FILE_REFRESH')


# -----------------------------------------------------------------------------
# Registration
# -----------------------------------------------------------------------------

classes = (
    CameraRigsPresetItem,
    CameraRigsSceneProps,
    CameraRigsPreferences,
    CAMERARIGS_PT_main,
    CAMERARIGS_PT_presets,
    CAMERARIGS_PT_custom,
    CAMERARIGS_PT_settings,
)


def register():
    for cls in classes:
        bpy.utils.register_class(cls)

    bpy.types.Scene.camera_rigs_props = bpy.props.PointerProperty(
        type=CameraRigsSceneProps)

    bpy.types.Scene.camera_rigs_category = bpy.props.EnumProperty(
        name="运镜分类",
        items=CATEGORY_ITEMS,
        default="ALL",
    )


def unregister():
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)

    del bpy.types.Scene.camera_rigs_props
    del bpy.types.Scene.camera_rigs_category
