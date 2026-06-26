"""
Module 1: 对称剖分 — 单扇裁剪与拼接还原验证
- 2 折：镜像对称（左右或上下），沿对称轴裁出单扇
- 4/6/8 折：旋转对称（扇形角度），以中心为圆心裁出单扇
然后将单扇拼接还原，与原图对比验证裁剪精度。
"""
import os
import cv2
import numpy as np


def crop_sector(image_path: str,
                fold_count: int,
                output_dir: str = "output",
                axis: str = "vertical") -> dict:
    """
    将一张对称图片裁出其中一个最小重复单元（单扇），并验证拼接还原。

    参数:
        image_path: 输入图片路径
        fold_count: 折数 n (2/4/6/8 之一)
        output_dir: 输出目录
        axis: 对称轴方向，仅对 2 折生效。
              "vertical"  —— 垂直对称轴（左右镜像），裁左半
              "horizontal"—— 水平对称轴（上下镜像），裁上半

    返回:
        dict: {
            "sector": 单扇裁剪图路径,
            "reconstruct": 拼接还原图路径,
            "diff": 差异对比图路径,
            "mean_diff": 平均像素差异值
        }
    """
    os.makedirs(output_dir, exist_ok=True)

    # 1. 读取图片
    img = cv2.imdecode(np.fromfile(image_path, dtype=np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise FileNotFoundError(f"无法读取图片: {image_path}")
    H, W = img.shape[:2]
    cx, cy = W / 2.0, H / 2.0

    # 2. 根据折数选择对称方式
    if fold_count == 2:
        # 镜像对称
        sector_img, reconstruct = _mirror_symmetry(img, axis)
    else:
        # 旋转对称
        sector_img, reconstruct = _rotational_symmetry(img, fold_count, cx, cy)

    # 3. 保存单扇
    sector_path = os.path.join(output_dir, "sector.png")
    _imwrite_unicode(sector_path, sector_img)

    # 4. 保存拼接还原图
    reconstruct_path = os.path.join(output_dir, "reconstruct.png")
    _imwrite_unicode(reconstruct_path, reconstruct)

    # 5. 对比差异
    diff = cv2.absdiff(img, reconstruct)
    diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
    diff_mask = diff_gray > 10
    diff_vis = img.copy()
    diff_vis[diff_mask] = (0, 255, 255)  # 黄色 BGR
    diff_path = os.path.join(output_dir, "diff.png")
    _imwrite_unicode(diff_path, diff_vis)

    mean_diff = float(np.mean(diff_gray))
    print(f"[sector_crop] 折数={fold_count}, 轴={axis}, 平均像素差异值: {mean_diff:.4f}")

    return {
        "sector": sector_path,
        "reconstruct": reconstruct_path,
        "diff": diff_path,
        "mean_diff": mean_diff,
    }


def _mirror_symmetry(img: np.ndarray, axis: str):
    """
    镜像对称：裁出单半，再翻转拼接还原。
    axis="vertical": 垂直对称轴 x=W/2，左右镜像，裁左半
    axis="horizontal": 水平对称轴 y=H/2，上下镜像，裁上半
    """
    H, W = img.shape[:2]
    white_bg = np.full_like(img, 255, dtype=np.uint8)

    if axis == "vertical":
        # 垂直对称轴：裁左半（x < W/2）
        mid_x = W // 2
        # 单扇：左半保留原图，右半填白
        sector_img = img.copy()
        sector_img[:, mid_x:] = 255
        # 拼接还原：左半 + 右半（左半水平翻转）
        left_half = img[:, :mid_x]
        # 翻转左半作为右半
        right_half_flipped = cv2.flip(left_half, 1)  # 1 = 水平翻转
        reconstruct = img.copy()
        reconstruct[:, mid_x:] = right_half_flipped[:, :W - mid_x]
    elif axis == "horizontal":
        # 水平对称轴：裁上半（y < H/2）
        mid_y = H // 2
        sector_img = img.copy()
        sector_img[mid_y:, :] = 255
        # 拼接还原：上半 + 下半（上半垂直翻转）
        top_half = img[:mid_y, :]
        bottom_half_flipped = cv2.flip(top_half, 0)  # 0 = 垂直翻转
        reconstruct = img.copy()
        reconstruct[mid_y:, :] = bottom_half_flipped[:H - mid_y, :]
    else:
        raise ValueError(f"不支持的对称轴方向: {axis}，应为 'vertical' 或 'horizontal'")

    return sector_img, reconstruct


def _rotational_symmetry(img: np.ndarray, fold_count: int, cx: float, cy: float):
    """
    旋转对称：以中心为圆心，裁出角度 0~360/n 的扇形，旋转 n 次拼接还原。
    """
    H, W = img.shape[:2]
    sector_angle = 360.0 / fold_count

    # 创建扇形遮罩：角度在 [0, sector_angle] 内
    yy, xx = np.mgrid[0:H, 0:W]
    dx = xx - cx
    dy = yy - cy
    angle = (np.degrees(np.arctan2(dy, dx)) + 360.0) % 360.0
    mask = (angle < sector_angle).astype(np.uint8) * 255

    # 应用遮罩：扇形以外区域设为白色
    white_bg = np.full_like(img, 255, dtype=np.uint8)
    mask_3c = cv2.merge([mask, mask, mask])
    sector_img = np.where(mask_3c == 255, img, white_bg)

    # 旋转拼接还原
    reconstruct = np.full_like(img, 255, dtype=np.uint8)
    for i in range(fold_count):
        angle_deg = sector_angle * i
        rot_mat = cv2.getRotationMatrix2D((cx, cy), angle_deg, 1.0)
        rotated = cv2.warpAffine(
            sector_img, rot_mat, (W, H),
            flags=cv2.INTER_NEAREST,
            borderMode=cv2.BORDER_CONSTANT,
            borderValue=(255, 255, 255)
        )
        non_white = np.any(rotated < 250, axis=2)
        reconstruct[non_white] = rotated[non_white]

    return sector_img, reconstruct


def _imwrite_unicode(path: str, img: np.ndarray) -> None:
    """支持中文路径的 imwrite。"""
    ext = os.path.splitext(path)[1]
    ok, buf = cv2.imencode(ext, img)
    if ok:
        with open(path, "wb") as f:
            f.write(buf.tobytes())
    else:
        raise IOError(f"无法编码图片: {path}")


def _make_test_image(path: str, fold_count: int = 4, size: int = 600) -> None:
    """生成一个 n 折旋转对称的测试图片（十字花瓣）。"""
    img = np.full((size, size, 3), 255, dtype=np.uint8)
    cx = cy = size / 2.0
    sector_canvas = np.full((size, size, 3), 255, dtype=np.uint8)
    petal_pts = np.array([
        [int(cx), int(cy)],
        [int(cx + 20), int(cy - 80)],
        [int(cx), int(cy - 200)],
        [int(cx - 20), int(cy - 80)],
    ], dtype=np.int32)
    cv2.fillPoly(sector_canvas, [petal_pts], (0, 0, 0))
    cv2.circle(sector_canvas, (int(cx), int(cy - 130)), 15, (0, 0, 0), -1)

    sector_angle = 360.0 / fold_count
    for i in range(fold_count):
        rot_mat = cv2.getRotationMatrix2D((cx, cy), sector_angle * i, 1.0)
        rotated = cv2.warpAffine(sector_canvas, rot_mat, (size, size),
                                 flags=cv2.INTER_NEAREST,
                                 borderMode=cv2.BORDER_CONSTANT,
                                 borderValue=(255, 255, 255))
        non_white = np.any(rotated < 250, axis=2)
        img[non_white] = rotated[non_white]
    cv2.circle(img, (int(cx), int(cy)), 25, (0, 0, 0), -1)
    _imwrite_unicode(path, img)


def _make_test_mirror_image(path: str, axis: str = "vertical", size: int = 600) -> None:
    """生成一个左右/上下镜像对称的测试图片。"""
    img = np.full((size, size, 3), 255, dtype=np.uint8)
    half = np.full((size, size, 3), 255, dtype=np.uint8)
    # 在左半画一些图案
    cv2.circle(half, (100, 150), 40, (0, 0, 0), -1)
    cv2.rectangle(half, (50, 300), (200, 450), (0, 0, 0), 5)
    cv2.line(half, (50, 500), (250, 550), (0, 0, 0), 3)
    cv2.putText(half, "L", (120, 260), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)

    if axis == "vertical":
        # 左右镜像：左半 + 左半水平翻转
        mid = size // 2
        img[:, :mid] = half[:, :mid]
        img[:, mid:] = cv2.flip(half[:, :size - mid], 1)
    else:
        # 上下镜像：上半 + 上半垂直翻转
        mid = size // 2
        img[:mid, :] = half[:mid, :]
        img[mid:, :] = cv2.flip(half[:size - mid, :], 0)
    _imwrite_unicode(path, img)


if __name__ == "__main__":
    os.makedirs("output", exist_ok=True)

    # 测试 2 折镜像对称（左右）
    print("--- 测试 2 折左右镜像 ---")
    test_v = "output/_test_2fold_vertical.png"
    _make_test_mirror_image(test_v, axis="vertical")
    r = crop_sector(test_v, fold_count=2, output_dir="output", axis="vertical")
    print(f"平均差异: {r['mean_diff']:.4f}")

    # 测试 2 折镜像对称（上下）
    print("--- 测试 2 折上下镜像 ---")
    test_h = "output/_test_2fold_horizontal.png"
    _make_test_mirror_image(test_h, axis="horizontal")
    r = crop_sector(test_h, fold_count=2, output_dir="output", axis="horizontal")
    print(f"平均差异: {r['mean_diff']:.4f}")

    # 测试 4 折旋转对称
    print("--- 测试 4 折旋转对称 ---")
    test_4 = "output/_test_4fold.png"
    _make_test_image(test_4, fold_count=4, size=600)
    r = crop_sector(test_4, fold_count=4, output_dir="output", axis="vertical")
    print(f"平均差异: {r['mean_diff']:.4f}")
