"""
Module 4: 分层 PDF 导出（施工指导版）
生成两个 PDF：
  - blueprint_clean.pdf：纯净线稿（无标注，直接打印下刀用）
  - blueprint_guide.pdf：施工指导版（▲标记危险区 + 虚线圆圈标孤岛 + 图例）
线稿本身保持纯黑白，标注用灰色（#888888）符号/文字，不改变线条颜色。
"""
import os
from datetime import datetime

import cv2
import numpy as np
from PIL import Image
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color, HexColor

from image_utils import imread_color_unicode, imwrite_unicode

# 灰色标注颜色 #888888
GRAY = HexColor("#888888")
BLACK = HexColor("#000000")


def export_pdf(lineart_path: str,
               width_layer_path: str,
               connectivity_layer_path: str,
               meta_info: dict,
               output_path: str = "output/blueprint.pdf",
               danger_points: list = None,
               island_details: list = None) -> dict:
    """
    生成两个 PDF：纯净版 + 施工指导版。

    参数:
        lineart_path: 线稿图路径（黑白 PNG）
        width_layer_path: 宽度标注层路径（保留兼容，本版本不使用彩色叠加）
        connectivity_layer_path: 连通性标注层路径（保留兼容）
        meta_info: {"fold_count", "danger_points", "islands", "date"}
        output_path: 基准输出路径（纯净版用 _clean 后缀，指导版用 _guide 后缀）
        danger_points: 危险点坐标列表 [(x,y), ...]（来自 width_detect）
        island_details: 孤岛信息列表 [{"center":(x,y), "radius":r, "area":a}, ...]

    返回:
        dict: {"clean": 纯净版PDF路径, "guide": 指导版PDF路径}
    """
    out_dir = os.path.dirname(output_path) or "."
    os.makedirs(out_dir, exist_ok=True)

    base = os.path.splitext(output_path)[0]
    clean_path = base + "_clean.pdf"
    guide_path = base + "_guide.pdf"

    # 读取线稿
    lineart = imread_color_unicode(lineart_path)
    if lineart is None:
        raise FileNotFoundError(f"无法读取线稿: {lineart_path}")

    # 保存线稿为临时 PNG（PDF 嵌入用）
    lineart_png = os.path.join(out_dir, "_lineart_for_pdf.png")
    imwrite_unicode(lineart_png, lineart)

    img_h, img_w = lineart.shape[:2]

    # 页面参数
    page_w, page_h = 210 * mm, 297 * mm
    max_w = 180 * mm
    max_h = 230 * mm
    scale = min(max_w / img_w, max_h / img_h)
    draw_w = img_w * scale
    draw_h = img_h * scale
    x0 = (page_w - draw_w) / 2
    y0 = (page_h - draw_h) / 2 + 15 * mm  # 留底部空间给图例

    # 像素到 PDF 点的转换比例
    px_to_pt = scale

    # ===== 1. 生成纯净版 PDF =====
    _draw_clean_pdf(clean_path, lineart_png, x0, y0, draw_w, draw_h, page_w, page_h, meta_info)

    # ===== 2. 生成施工指导版 PDF =====
    _draw_guide_pdf(
        guide_path, lineart_png, x0, y0, draw_w, draw_h, page_w, page_h,
        meta_info, danger_points or [], island_details or [], img_w, img_h, px_to_pt
    )

    # 清理临时文件
    try:
        os.remove(lineart_png)
    except OSError:
        pass

    print(f"[export_pdf] 纯净版: {clean_path}")
    print(f"[export_pdf] 指导版: {guide_path}")
    return {"clean": clean_path, "guide": guide_path}


def _draw_clean_pdf(path, lineart_png, x0, y0, draw_w, draw_h, page_w, page_h, meta_info):
    """纯净版：只有线稿 + 底部基本信息。"""
    c = canvas.Canvas(path, pagesize=(page_w, page_h))

    # 线稿
    c.drawImage(lineart_png, x0, y0, width=draw_w, height=draw_h,
                preserveAspectRatio=True, mask='auto')

    # 底部基本信息（小字，不干扰）
    c.setFont("Helvetica", 8)
    c.setFillColor(GRAY)
    fold = meta_info.get("fold_count", "?")
    date_str = meta_info.get("date", datetime.now().strftime("%Y-%m-%d"))
    info = f"折数: {fold}折  |  日期: {date_str}  |  纯净底稿（直接打印下刀用）"
    tw = c.stringWidth(info, "Helvetica", 8)
    c.drawString((page_w - tw) / 2, 8 * mm, info)

    c.showPage()
    c.save()


def _draw_guide_pdf(path, lineart_png, x0, y0, draw_w, draw_h, page_w, page_h,
                    meta_info, danger_points, island_details, img_w, img_h, px_to_pt):
    """施工指导版：线稿 + ▲危险标记 + 虚线圆圈孤岛 + 图例。"""
    c = canvas.Canvas(path, pagesize=(page_w, page_h))

    # ===== 线稿（纯黑白，不改变颜色） =====
    c.drawImage(lineart_png, x0, y0, width=draw_w, height=draw_h,
                preserveAspectRatio=True, mask='auto')

    # ===== ▲ 危险点标记 =====
    # 坐标转换：图片像素 (px, py) -> PDF 坐标
    # 图片原点在左上，PDF 原点在左下
    # pdf_x = x0 + px * px_to_pt
    # pdf_y = y0 + (img_h - py) * px_to_pt
    c.setFillColor(GRAY)
    c.setStrokeColor(GRAY)
    font_size = 7
    c.setFont("Helvetica", font_size)
    offset_pt = 5 * px_to_pt  # 线条外侧约5px（按用户要求）

    for (px, py) in danger_points:
        pdf_x = x0 + px * px_to_pt
        pdf_y = y0 + (img_h - py) * px_to_pt
        # ▲ 符号放在线条外侧（向上偏移）
        # 用三角形绘制
        tri_size = 3 * px_to_pt
        cx = pdf_x
        cy = pdf_y + offset_pt + tri_size
        tri = [
            (cx, cy + tri_size),           # 顶点
            (cx - tri_size, cy),           # 左下
            (cx + tri_size, cy),           # 右下
        ]
        p = c.beginPath()
        p.moveTo(*tri[0])
        p.lineTo(*tri[1])
        p.lineTo(*tri[2])
        p.close()
        c.drawPath(p, fill=1, stroke=0)

    # ===== 虚线圆圈孤岛标注 =====
    for isl in island_details:
        cx_px, cy_px = isl["center"]
        r_px = isl["radius"]
        pdf_cx = x0 + cx_px * px_to_pt
        pdf_cy = y0 + (img_h - cy_px) * px_to_pt
        pdf_r = r_px * px_to_pt

        # 虚线圆圈（灰色）
        c.setDash(3, 2)  # 3pt 实线, 2pt 间隔
        c.setStrokeColor(GRAY)
        c.setLineWidth(0.6)
        c.circle(pdf_cx, pdf_cy, pdf_r, stroke=1, fill=0)
        c.setDash()  # 重置

        # 圆圈外侧文字"注意：此处会脱落"
        c.setFillColor(GRAY)
        c.setFont("Helvetica", 6)
        label = "注意：此处会脱落"
        # 文字放在圆圈右侧
        tx = pdf_cx + pdf_r + 2
        ty = pdf_cy
        c.drawString(tx, ty, label)

    # ===== 底部图例说明框 =====
    _draw_legend(c, page_w, page_h, meta_info)

    c.showPage()
    c.save()


def _draw_legend(c, page_w, page_h, meta_info):
    """在 PDF 底部绘制图例说明框。"""
    box_w = 160 * mm
    box_h = 35 * mm
    box_x = (page_w - box_w) / 2
    box_y = 10 * mm

    # 边框
    c.setStrokeColor(GRAY)
    c.setLineWidth(0.5)
    c.rect(box_x, box_y, box_w, box_h, stroke=1, fill=0)

    # 标题
    c.setFillColor(BLACK)
    c.setFont("Helvetica-Bold", 9)
    title = "图例说明"
    tw = c.stringWidth(title, "Helvetica-Bold", 9)
    c.drawString(box_x + (box_w - tw) / 2, box_y + box_h - 6 * mm, title)

    # 图例项
    c.setFont("Helvetica", 8)
    line_y = box_y + box_h - 12 * mm
    line_h = 5 * mm

    # ▲ = 建议刻刀处理
    c.setFillColor(GRAY)
    tri_size = 2.5
    cx = box_x + 8 * mm
    cy = line_y
    p = c.beginPath()
    p.moveTo(cx, cy + tri_size)
    p.lineTo(cx - tri_size, cy - tri_size)
    p.lineTo(cx + tri_size, cy - tri_size)
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    c.setFillColor(BLACK)
    c.drawString(cx + 6 * mm, cy - 1.5, "= 建议刻刀处理（线条偏细）")

    # 虚线圆圈 = 孤立区域
    line_y -= line_h
    c.setDash(3, 2)
    c.setStrokeColor(GRAY)
    c.setLineWidth(0.6)
    c.circle(box_x + 8 * mm, line_y, 2.5, stroke=1, fill=0)
    c.setDash()
    c.setFillColor(BLACK)
    c.drawString(box_x + 8 * mm + 6 * mm, line_y - 1.5, "= 孤立区域，需连笔")

    # 无标注 = 可直接剪
    line_y -= line_h
    c.setFillColor(BLACK)
    c.drawString(box_x + 8 * mm, line_y - 1.5, "无标注区域 = 可直接剪")

    # 元信息
    line_y -= line_h
    c.setFont("Helvetica", 7)
    c.setFillColor(GRAY)
    fold = meta_info.get("fold_count", "?")
    danger = meta_info.get("danger_points", "?")
    islands = meta_info.get("islands", "?")
    date_str = meta_info.get("date", datetime.now().strftime("%Y-%m-%d"))
    info = f"折数: {fold}折  |  危险点: {danger}  |  孤岛: {islands}  |  日期: {date_str}"
    c.drawString(box_x + 4 * mm, line_y - 1.5, info)


if __name__ == "__main__":
    os.makedirs("output", exist_ok=True)
    # 生成简单测试线稿
    lineart = np.full((400, 400, 3), 255, dtype=np.uint8)
    cv2.rectangle(lineart, (50, 50), (350, 350), (0, 0, 0), 5)
    cv2.circle(lineart, (200, 200), 100, (0, 0, 0), 2)  # 细线（危险）
    lineart_path = "output/_test_lineart.png"
    imwrite_unicode(lineart_path, lineart)

    # 模拟危险点和孤岛
    danger_points = [(200, 100), (200, 300), (100, 200), (300, 200)]
    island_details = [
        {"center": (350, 50), "radius": 20, "area": 100},
    ]

    meta = {"fold_count": 4, "danger_points": 4, "islands": 1, "date": "2026-06-18"}
    result = export_pdf(
        lineart_path, None, None, meta,
        "output/_test_blueprint.pdf",
        danger_points=danger_points,
        island_details=island_details
    )
    print(f"[test] 纯净版: {result['clean']}")
    print(f"[test] 指导版: {result['guide']}")
