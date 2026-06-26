"""
Module 3: 连通性检查 — 孤岛检测
对一张黑白剪纸线稿图，检测连通区域，找出未与主体结构连接的"孤岛"区域并标注。
"""
import os
import cv2
import numpy as np

from image_utils import preprocess_lineart, to_inverted, imread_gray_unicode, imread_color_unicode, imwrite_unicode


def detect_connectivity(image_path: str, output_dir: str = "output",
                        min_island_area: int = 20,
                        erode_iters: int = 1) -> dict:
    """
    检测连通区域，标注未与主体连接的孤岛。

    参数:
        image_path: 黑白线稿 PNG 路径（黑色线条，白色背景）
        output_dir: 输出目录
        min_island_area: 孤岛最小面积阈值，小于此值忽略（噪点）
        erode_iters: 线条腐蚀细化次数（0=不腐蚀）

    返回:
        dict: {
            "annotated": 叠加标注的线稿图路径,
            "layer": 纯标注层路径（白底蓝圈）,
            "main_area": 主体面积,
            "island_count": 孤岛数量,
            "island_areas": 各孤岛面积列表
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

    # 3. 反转（线条=255，背景=0）—— connectedComponents 需要前景为非零
    inverted = to_inverted(binary).astype(np.uint8)

    # 4. 连通区域（使用 connectedComponentsWithStats 获取 stats 和 centroids）
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(inverted, connectivity=8)
    # stats: [x, y, w, h, area]，label 0 是背景

    # 5. 找出面积最大的连通区域作为主体
    if num_labels <= 1:
        # 没有任何线条
        annotated_path = os.path.join(output_dir, "connectivity_annotated.png")
        layer_path = os.path.join(output_dir, "connectivity_layer.png")
        imwrite_unicode(annotated_path, cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR))
        imwrite_unicode(layer_path, np.full_like(binary, 255))
        return {"annotated": annotated_path, "layer": layer_path,
                "main_area": 0, "island_count": 0, "island_areas": []}

    # label 0 是背景，从 1 开始
    areas = stats[1:, cv2.CC_STAT_AREA]
    main_label = 1 + int(np.argmax(areas))  # 主体标签
    main_area = int(stats[main_label, cv2.CC_STAT_AREA])

    # 6. 其余连通区域标记为孤岛，过滤小面积
    islands = []
    for label in range(1, num_labels):
        if label == main_label:
            continue
        area = int(stats[label, cv2.CC_STAT_AREA])
        if area < min_island_area:
            continue
        x = stats[label, cv2.CC_STAT_LEFT]
        y = stats[label, cv2.CC_STAT_TOP]
        w = stats[label, cv2.CC_STAT_WIDTH]
        h = stats[label, cv2.CC_STAT_HEIGHT]
        islands.append({"label": label, "area": area, "x": x, "y": y, "w": w, "h": h})

    # 7. 创建标注图（用处理后的二值线稿作为底图，确保是纯黑白）
    orig = cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)
    annotated = orig.copy()
    layer = np.full_like(annotated, 255, dtype=np.uint8)

    # 8. 对每个孤岛画蓝色圆圈
    for isl in islands:
        x, y, w, h = isl["x"], isl["y"], isl["w"], isl["h"]
        center = (x + w // 2, y + h // 2)
        radius = int(max(w, h) / 2) + 5
        cv2.circle(annotated, center, radius, (255, 0, 0), 2)  # 蓝色 BGR
        cv2.circle(layer, center, radius, (255, 0, 0), 2)

    annotated_path = os.path.join(output_dir, "connectivity_annotated.png")
    layer_path = os.path.join(output_dir, "connectivity_layer.png")
    imwrite_unicode(annotated_path, annotated)
    imwrite_unicode(layer_path, layer)

    # 孤岛详细信息（供 PDF 标注用）
    island_details = []
    for isl in islands:
        x, y, w, h = isl["x"], isl["y"], isl["w"], isl["h"]
        center = (x + w // 2, y + h // 2)
        radius = int(max(w, h) / 2) + 5
        island_details.append({"center": center, "radius": radius, "area": isl["area"]})

    island_areas = [isl["area"] for isl in islands]
    print(f"[connectivity] 主体面积: {main_area}, 孤岛数量: {len(islands)}, 各孤岛面积: {island_areas}")

    return {
        "annotated": annotated_path,
        "layer": layer_path,
        "main_area": main_area,
        "island_count": len(islands),
        "island_areas": island_areas,
        "island_details": island_details,
    }


def _make_test_image(path: str, size: int = 600) -> None:
    """生成测试用线稿：主体大圆 + 2-3 个不连接的小图案。"""
    img = np.full((size, size, 3), 255, dtype=np.uint8)
    # 主体：大圆形线条
    cv2.circle(img, (300, 300), 180, (0, 0, 0), 8)
    # 孤岛1：小圆点
    cv2.circle(img, (80, 80), 15, (0, 0, 0), -1)
    # 孤岛2：小三角
    pts = np.array([[520, 60], [560, 120], [480, 120]], dtype=np.int32)
    cv2.fillPoly(img, [pts], (0, 0, 0))
    # 孤岛3：小方块
    cv2.rectangle(img, (500, 500), (560, 560), (0, 0, 0), -1)
    imwrite_unicode(path, img)


if __name__ == "__main__":
    os.makedirs("output", exist_ok=True)
    test_path = "output/_test_connectivity.png"
    _make_test_image(test_path)
    print(f"[test] 已生成测试图: {test_path}")
    result = detect_connectivity(test_path, output_dir="output")
    print(f"[test] 标注图: {result['annotated']}")
    print(f"[test] 标注层: {result['layer']}")
