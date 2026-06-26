"""
Module 2: 距离变换 — 线条宽度检测
对一张黑白剪纸线稿图，使用距离变换检测每条线条的宽度，找出过细易断的危险区域并标注。
"""
import os
import cv2
import numpy as np

from image_utils import preprocess_lineart, to_inverted, imread_gray_unicode, imread_color_unicode, imwrite_unicode


def detect_width(image_path: str,
                 danger_thresh: int = 3,
                 thin_thresh: int = 8,
                 output_dir: str = "output",
                 erode_iters: int = 1) -> dict:
    """
    使用距离变换检测线条宽度，标注危险/偏薄/安全区域。

    参数:
        image_path: 黑白线稿 PNG 路径（黑色线条，白色背景）
        danger_thresh: 危险阈值（像素），默认 3
        thin_thresh: 偏薄阈值（像素），默认 8
        output_dir: 输出目录
        erode_iters: 线条腐蚀细化次数（0=不腐蚀）

    返回:
        dict: {
            "annotated": 叠加标注的线稿图路径,
            "layer": 纯标注层路径（白底彩色点）,
            "danger_count": 危险点数量,
            "thin_count": 偏薄点数量,
            "safe_count": 安全点数量,
            "danger_points": 采样的危险点坐标列表 [(x,y), ...]（供PDF标注用）
        }
    """
    os.makedirs(output_dir, exist_ok=True)

    # 1. 读取图片，转为灰度图
    gray = imread_gray_unicode(image_path)
    if gray is None:
        raise FileNotFoundError(f"无法读取图片: {image_path}")

    # 2. 预处理：高斯模糊 + 自适应阈值二值化 + 形态学腐蚀细化
    #    输出：线条=0（黑），背景=255（白）
    binary = preprocess_lineart(gray, apply_blur=True, block_size=11, C=2, erode_iters=erode_iters)

    # 3. 反转（线条=255，背景=0）—— distanceTransform 计算非零像素到最近零像素距离
    inverted = to_inverted(binary).astype(np.uint8)

    # 4. 距离变换
    dist = cv2.distanceTransform(inverted, cv2.DIST_L2, maskSize=5)

    # 5. 创建标注图（用处理后的二值线稿作为底图，确保是纯黑白）
    orig = cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)
    annotated = orig.copy()
    # 纯标注层：白底
    layer = np.full_like(annotated, 255, dtype=np.uint8)

    # 线条像素掩码（inverted 中为 255 的位置）
    line_mask = inverted > 0

    # 距离分类
    danger_mask = line_mask & (dist < danger_thresh)
    thin_mask = line_mask & (dist >= danger_thresh) & (dist < thin_thresh)
    safe_mask = line_mask & (dist >= thin_thresh)

    # 颜色 BGR
    # 危险 -> 红色 (0,0,255)
    # 偏薄 -> 黄色 (0,255,255)
    # 安全 -> 蓝色 (255,0,0)
    annotated[danger_mask] = (0, 0, 255)
    annotated[thin_mask] = (0, 255, 255)
    annotated[safe_mask] = (255, 0, 0)

    layer[danger_mask] = (0, 0, 255)
    layer[thin_mask] = (0, 255, 255)
    layer[safe_mask] = (255, 0, 0)

    danger_count = int(np.count_nonzero(danger_mask))
    thin_count = int(np.count_nonzero(thin_mask))
    safe_count = int(np.count_nonzero(safe_mask))

    # 6. 保存
    annotated_path = os.path.join(output_dir, "width_annotated.png")
    layer_path = os.path.join(output_dir, "width_layer.png")
    imwrite_unicode(annotated_path, annotated)
    imwrite_unicode(layer_path, layer)

    # 采样危险点坐标（供 PDF 标注用）：按网格采样，避免点太多
    danger_points = _sample_points(danger_mask, grid_size=25)

    print(f"[width_detect] 危险点(红): {danger_count}, 偏薄点(黄): {thin_count}, 安全点(蓝): {safe_count}")
    print(f"[width_detect] 采样危险标记点: {len(danger_points)} 个")

    return {
        "annotated": annotated_path,
        "layer": layer_path,
        "danger_count": danger_count,
        "thin_count": thin_count,
        "safe_count": safe_count,
        "danger_points": danger_points,
    }


def _sample_points(mask: np.ndarray, grid_size: int = 25) -> list:
    """
    从布尔掩码中按网格采样坐标，每个网格最多取一个代表点。
    返回 [(x, y), ...] 列表。
    """
    H, W = mask.shape
    points = []
    for gy in range(0, H, grid_size):
        for gx in range(0, W, grid_size):
            sub = mask[gy:gy + grid_size, gx:gx + grid_size]
            if not sub.any():
                continue
            # 取该网格内第一个 True 的坐标
            ys, xs = np.where(sub)
            px = int(xs[0]) + gx
            py = int(ys[0]) + gy
            points.append((px, py))
    return points


def _make_test_image(path: str, size: int = 600) -> None:
    """生成测试用黑白线稿，包含粗细不同的线条。"""
    img = np.full((size, size, 3), 255, dtype=np.uint8)
    # 粗线条（宽度 ~20）
    cv2.rectangle(img, (50, 50), (200, 200), (0, 0, 0), 18)
    # 中等线条（宽度 ~8）
    cv2.circle(img, (400, 150), 80, (0, 0, 0), 7)
    # 细线条（宽度 ~2，危险）
    cv2.line(img, (50, 400), (550, 400), (0, 0, 0), 2)
    # 极细线条（宽度 1，危险）
    cv2.line(img, (50, 500), (550, 500), (0, 0, 0), 1)
    # 中等曲线
    cv2.ellipse(img, (300, 300), (150, 80), 0, 0, 360, (0, 0, 0), 5)
    imwrite_unicode(path, img)


if __name__ == "__main__":
    os.makedirs("output", exist_ok=True)
    test_path = "output/_test_width.png"
    _make_test_image(test_path)
    print(f"[test] 已生成测试图: {test_path}")
    result = detect_width(test_path, danger_thresh=3, thin_thresh=8, output_dir="output")
    print(f"[test] 标注图: {result['annotated']}")
    print(f"[test] 标注层: {result['layer']}")
