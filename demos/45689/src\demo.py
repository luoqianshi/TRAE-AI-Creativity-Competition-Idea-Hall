"""
Module 6: 一键串联 Demo
读取 presets/preset_4fold.png，依次调用 sector_crop → width_detect → connectivity_detect → export_pdf。
"""
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import sector_crop
import width_detect
import connectivity_detect
import export_pdf


def generate_presets(presets_dir: str = "presets") -> None:
    """生成 3 张测试用预设线稿。"""
    os.makedirs(presets_dir, exist_ok=True)
    import cv2
    import numpy as np

    # preset_4fold.png：4 折对称花朵线稿，线条粗细有变化
    size = 600
    img = np.full((size, size, 3), 255, dtype=np.uint8)
    cx = cy = size / 2.0
    sector_canvas = np.full((size, size, 3), 255, dtype=np.uint8)
    # 花瓣（外粗内细）
    petal_pts = np.array([
        [int(cx), int(cy)],
        [int(cx + 25), int(cy - 60)],
        [int(cx + 10), int(cy - 150)],
        [int(cx), int(cy - 220)],
        [int(cx - 10), int(cy - 150)],
        [int(cx - 25), int(cy - 60)],
    ], dtype=np.int32)
    cv2.fillPoly(sector_canvas, [petal_pts], (0, 0, 0))
    # 故意画细的地方：花瓣边缘细线
    cv2.line(sector_canvas, (int(cx), int(cy - 230)), (int(cx), int(cy - 250)), (0, 0, 0), 1)
    # 花蕊圆
    cv2.circle(sector_canvas, (int(cx), int(cy - 120)), 18, (0, 0, 0), -1)
    # 旋转复制 4 份
    for i in range(4):
        rot_mat = cv2.getRotationMatrix2D((cx, cy), 90.0 * i, 1.0)
        rotated = cv2.warpAffine(sector_canvas, rot_mat, (size, size),
                                 flags=cv2.INTER_NEAREST,
                                 borderMode=cv2.BORDER_CONSTANT,
                                 borderValue=(255, 255, 255))
        non_white = np.any(rotated < 250, axis=2)
        img[non_white] = rotated[non_white]
    cv2.circle(img, (int(cx), int(cy)), 30, (0, 0, 0), -1)
    _imwrite_unicode(os.path.join(presets_dir, "preset_4fold.png"), img)

    # preset_6fold.png：6 折对称雪花线稿
    img = np.full((size, size, 3), 255, dtype=np.uint8)
    cx = cy = size / 2.0
    sector_canvas = np.full((size, size, 3), 255, dtype=np.uint8)
    # 雪花分支
    cv2.line(sector_canvas, (int(cx), int(cy)), (int(cx), int(cy - 250)), (0, 0, 0), 6)
    cv2.line(sector_canvas, (int(cx), int(cy - 80)), (int(cx + 40), int(cy - 120)), (0, 0, 0), 4)
    cv2.line(sector_canvas, (int(cx), int(cy - 80)), (int(cx - 40), int(cy - 120)), (0, 0, 0), 4)
    cv2.line(sector_canvas, (int(cx), int(cy - 160)), (int(cx + 30), int(cy - 190)), (0, 0, 0), 2)
    cv2.line(sector_canvas, (int(cx), int(cy - 160)), (int(cx - 30), int(cy - 190)), (0, 0, 0), 2)
    cv2.line(sector_canvas, (int(cx), int(cy - 220)), (int(cx), int(cy - 240)), (0, 0, 0), 1)
    for i in range(6):
        rot_mat = cv2.getRotationMatrix2D((cx, cy), 60.0 * i, 1.0)
        rotated = cv2.warpAffine(sector_canvas, rot_mat, (size, size),
                                 flags=cv2.INTER_NEAREST,
                                 borderMode=cv2.BORDER_CONSTANT,
                                 borderValue=(255, 255, 255))
        non_white = np.any(rotated < 250, axis=2)
        img[non_white] = rotated[non_white]
    cv2.circle(img, (int(cx), int(cy)), 20, (0, 0, 0), -1)
    _imwrite_unicode(os.path.join(presets_dir, "preset_6fold.png"), img)

    # preset_island.png：有孤岛的线稿
    img = np.full((size, size, 3), 255, dtype=np.uint8)
    # 主体：大花朵
    cv2.circle(img, (300, 300), 150, (0, 0, 0), 8)
    cv2.circle(img, (300, 300), 80, (0, 0, 0), 5)
    for ang in range(0, 360, 60):
        import math
        rad = math.radians(ang)
        px = int(300 + 150 * math.cos(rad))
        py = int(300 + 150 * math.sin(rad))
        cv2.circle(img, (px, py), 25, (0, 0, 0), 4)
    # 孤岛1：左上小圆
    cv2.circle(img, (70, 70), 18, (0, 0, 0), -1)
    # 孤岛2：右下小三角
    pts = np.array([[520, 520], [570, 570], [470, 570]], dtype=np.int32)
    cv2.fillPoly(img, [pts], (0, 0, 0))
    _imwrite_unicode(os.path.join(presets_dir, "preset_island.png"), img)

    print("[demo] 预设线稿已生成于 presets/")


def _imwrite_unicode(path: str, img) -> None:
    import cv2
    ext = os.path.splitext(path)[1]
    ok, buf = cv2.imencode(ext, img)
    if ok:
        with open(path, "wb") as f:
            f.write(buf.tobytes())
    else:
        raise IOError(f"无法编码图片: {path}")


def run_demo(preset_path: str = "presets/preset_4fold.png",
             fold_count: int = 4,
             output_dir: str = "output",
             axis: str = "vertical") -> str:
    """一键跑通全流程。"""
    os.makedirs(output_dir, exist_ok=True)
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    preset_full = os.path.join(base_dir, preset_path) if not os.path.isabs(preset_path) else preset_path

    print("=" * 60)
    print("对称剪纸底稿生成器 · Demo 全流程")
    print("=" * 60)

    # 1. 对称剖分
    print("[步骤1] 对称剖分...")
    sector_result = sector_crop.crop_sector(preset_full, fold_count, output_dir, axis=axis)
    print(f"  完成，输出文件: {sector_result['sector']}")
    print(f"  拼接还原图: {sector_result['reconstruct']}")
    print(f"  差异图: {sector_result['diff']}")
    print(f"  平均像素差异: {sector_result['mean_diff']:.4f}")

    # 2. 宽度检测
    print("[步骤2] 线条宽度检测...")
    width_result = width_detect.detect_width(preset_full, 3, 8, output_dir)
    print(f"  完成，输出文件: {width_result['annotated']}")
    print(f"  标注层: {width_result['layer']}")

    # 3. 连通性检测
    print("[步骤3] 连通性检测...")
    conn_result = connectivity_detect.detect_connectivity(preset_full, output_dir)
    print(f"  完成，输出文件: {conn_result['annotated']}")
    print(f"  标注层: {conn_result['layer']}")

    # 4. PDF 导出（纯净版 + 施工指导版）
    print("[步骤4] PDF 导出（纯净版 + 施工指导版）...")
    meta = {
        "fold_count": fold_count,
        "danger_points": width_result["danger_count"],
        "islands": conn_result["island_count"],
        "date": datetime.now().strftime("%Y-%m-%d"),
    }
    pdf_path = os.path.join(output_dir, "blueprint.pdf")
    pdf_result = export_pdf.export_pdf(
        preset_full,
        width_result["layer"],
        conn_result["layer"],
        meta,
        pdf_path,
        danger_points=width_result.get("danger_points", []),
        island_details=conn_result.get("island_details", []))
    print(f"  纯净版 PDF: {pdf_result['clean']}")
    print(f"  指导版 PDF: {pdf_result['guide']}")

    print("=" * 60)
    print(f"全流程完成")
    print(f"  纯净版 PDF（下刀用）: {pdf_result['clean']}")
    print(f"  指导版 PDF（参考用）: {pdf_result['guide']}")
    print("=" * 60)
    return pdf_result["guide"]


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(base_dir)
    # 生成预设
    generate_presets(os.path.join(base_dir, "presets"))
    # 跑全流程
    run_demo()
