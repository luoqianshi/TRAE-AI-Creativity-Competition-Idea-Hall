"""
Module: 线稿彩色染色
将黑白线稿的线条按宽度等级染成不同颜色，生成彩色施工指导图。

颜色规则：
  细线（距离变换 < 3px）   → 红色 #E53935（建议刻刀）
  中等线（3~6px）          → 橙色 #FF8F00（可刻可剪）
  粗线（> 6px）            → 蓝色 #1565C0（建议剪刀）
  孤岛区域                 → 灰色 #9E9E9E（此处会脱落，需修改）

输出：
  blueprint_color.png：彩色施工指导图（底部含图例）
  blueprint_clean.png：纯黑白线稿（无任何颜色）
"""
import os
import cv2
import numpy as np

from image_utils import (
    preprocess_lineart, to_inverted,
    imread_gray_unicode, imwrite_unicode
)

# 颜色定义（BGR 格式，OpenCV 使用）
COLOR_RED = (53, 57, 229)       # #E53935 细线-刻刀
COLOR_ORANGE = (0, 143, 255)    # #FF8F00 中等-可刻可剪
COLOR_BLUE = (192, 101, 21)     # #1565C0 粗线-剪刀
COLOR_GRAY = (158, 158, 158)    # #9E9E9E 孤岛-会脱落
COLOR_WHITE = (255, 255, 255)
COLOR_BLACK = (0, 0, 0)

# 宽度阈值
THIN_THRESH = 3   # < 3px 红色
THICK_THRESH = 6  # 3~6px 橙色，> 6px 蓝色


def colorize_lineart(image_path: str,
                     output_dir: str = "output",
                     thin_thresh: int = THIN_THRESH,
                     thick_thresh: int = THICK_THRESH,
                     erode_iters: int = 1) -> dict:
    """
    将黑白线稿染成彩色施工指导图。

    参数:
        image_path: 输入线稿路径
        output_dir: 输出目录
        thin_thresh: 细线阈值（< 此值=红色）
        thick_thresh: 粗线阈值（> 此值=蓝色，中间=橙色）
        erode_iters: 二值化腐蚀次数

    返回:
        dict: {
            "color": 彩色指导图路径,
            "clean": 纯黑白线稿路径,
            "danger_count": 红色像素数,
            "thin_count": 橙色像素数,
            "safe_count": 蓝色像素数,
            "island_count": 孤岛数量,
            "island_pixels": 灰色像素数
        }
    """
    os.makedirs(output_dir, exist_ok=True)

    # 1. 读取并二值化
    gray = imread_gray_unicode(image_path)
    if gray is None:
        raise FileNotFoundError(f"无法读取图片: {image_path}")

    binary = preprocess_lineart(gray, apply_blur=True, block_size=11, C=2, erode_iters=erode_iters)
    # binary: 线条=0（黑），背景=255（白）

    # 2. 距离变换
    inverted = to_inverted(binary).astype(np.uint8)  # 线条=255, 背景=0
    dist = cv2.distanceTransform(inverted, cv2.DIST_L2, maskSize=5)

    # 3. 连通性检测，找出孤岛
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(inverted, connectivity=8)
    island_mask = np.zeros_like(binary, dtype=bool)
    island_count = 0

    if num_labels > 1:
        areas = stats[1:, cv2.CC_STAT_AREA]
        main_label = 1 + int(np.argmax(areas))
        for label in range(1, num_labels):
            if label == main_label:
                continue
            area = int(stats[label, cv2.CC_STAT_AREA])
            if area < 20:  # 过滤噪点
                continue
            island_mask[labels == label] = True
            island_count += 1

    # 4. 分类染色
    line_mask = inverted > 0  # 所有线条像素
    danger_mask = (dist < thin_thresh) & line_mask & (~island_mask)       # 红色
    thin_mask = (dist >= thin_thresh) & (dist <= thick_thresh) & line_mask & (~island_mask)  # 橙色
    safe_mask = (dist > thick_thresh) & line_mask & (~island_mask)        # 蓝色

    # 5. 创建彩色图（白底）
    h, w = binary.shape
    color_img = np.full((h, w, 3), 255, dtype=np.uint8)
    color_img[danger_mask] = COLOR_RED
    color_img[thin_mask] = COLOR_ORANGE
    color_img[safe_mask] = COLOR_BLUE
    color_img[island_mask] = COLOR_GRAY

    # 6. 底部加 60px 白边 + 图例
    legend_h = 60
    legend_bar = np.full((legend_h, w, 3), 255, dtype=np.uint8)
    color_img = np.vstack([color_img, legend_bar])
    _draw_legend(color_img, w, h, legend_h)

    # 7. 保存
    color_path = os.path.join(output_dir, "blueprint_color.png")
    clean_path = os.path.join(output_dir, "blueprint_clean.png")
    imwrite_unicode(color_path, color_img)
    imwrite_unicode(clean_path, binary)

    # 统计
    danger_count = int(danger_mask.sum())
    thin_count = int(thin_mask.sum())
    safe_count = int(safe_mask.sum())
    island_pixels = int(island_mask.sum())

    print(f"[colorize] 红(刻刀): {danger_count}, 橙(可刻可剪): {thin_count}, "
          f"蓝(剪刀): {safe_count}, 灰(孤岛): {island_pixels} ({island_count}个)")

    return {
        "color": color_path,
        "clean": clean_path,
        "danger_count": danger_count,
        "thin_count": thin_count,
        "safe_count": safe_count,
        "island_count": island_count,
        "island_pixels": island_pixels,
    }


def _draw_legend(img: np.ndarray, w: int, h: int, legend_h: int) -> None:
    """
    在图片底部图例区域绘制图例文字。
    img: 已拼接底部白边的图（高度 = h + legend_h）
    """
    # 图例项定义：(颜色BGR, 文字)
    items = [
        (COLOR_RED, "红=刻刀"),
        (COLOR_ORANGE, "橙=可刻可剪"),
        (COLOR_BLUE, "蓝=剪刀"),
        (COLOR_GRAY, "灰=孤岛注意"),
    ]

    # 使用 OpenCV 绘制（支持中文需用 PIL，这里用英文+符号避免乱码）
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.5
    thickness = 1

    # 计算总宽度，居中排列
    item_widths = []
    for color, text in items:
        # 色块(20px) + 间距(5px) + 文字
        tw = cv2.getTextSize(text, font, font_scale, thickness)[0][0]
        item_widths.append(25 + tw + 30)  # 色块+文字+项间距

    total_w = sum(item_widths)
    x = max(10, (w - total_w) // 2)
    y = h + legend_h // 2 + 5

    for i, (color, text) in enumerate(items):
        # 画色块
        cv2.rectangle(img, (x, y - 12), (x + 18, y + 4), color, -1)
        # 画文字
        cv2.putText(img, text, (x + 22, y), font, font_scale, COLOR_BLACK, thickness, cv2.LINE_AA)
        x += item_widths[i]


if __name__ == "__main__":
    os.makedirs("output", exist_ok=True)
    # 生成测试线稿
    test = np.full((500, 500, 3), 255, dtype=np.uint8)
    cv2.rectangle(test, (50, 50), (200, 200), (0, 0, 0), 20)   # 粗
    cv2.circle(test, (350, 150), 80, (0, 0, 0), 6)             # 中
    cv2.line(test, (50, 350), (450, 350), (0, 0, 0), 2)        # 细
    cv2.circle(test, (450, 450), 10, (0, 0, 0), -1)            # 孤岛
    test_path = "output/_test_colorize.png"
    imwrite_unicode(test_path, test)

    result = colorize_lineart(test_path, output_dir="output")
    print(f"彩色图: {result['color']}")
    print(f"纯净图: {result['clean']}")
