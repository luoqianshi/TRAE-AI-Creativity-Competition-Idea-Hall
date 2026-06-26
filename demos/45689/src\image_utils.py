"""
图像预处理工具：高斯模糊 + 自适应阈值二值化 + 形态学腐蚀细化
用于将输入图片处理为纯黑白二值线稿（线条=0，背景=255）。
"""
import cv2
import numpy as np


def preprocess_lineart(gray: np.ndarray,
                       apply_blur: bool = True,
                       block_size: int = 11,
                       C: int = 2,
                       erode_iters: int = 1) -> np.ndarray:
    """
    将灰度图处理为纯黑白二值线稿。

    步骤：
        1. 高斯模糊去噪（GaussianBlur, ksize=3）
        2. 自适应阈值二值化（ADAPTIVE_THRESH_GAUSSIAN_C, blockSize=11, C=2）
        3. 形态学腐蚀细化线条（erode, kernel=2x2, 1-2 次）
        4. 强制纯黑白（只有 0 和 255）

    参数:
        gray: 输入灰度图（uint8）
        apply_blur: 是否应用高斯模糊
        block_size: 自适应阈值邻域尺寸（奇数）
        C: 自适应阈值常数
        erode_iters: 腐蚀迭代次数（0 表示不腐蚀）

    返回:
        二值图：线条=0（黑），背景=255（白）
    """
    # 1. 高斯模糊去噪
    if apply_blur:
        gray = cv2.GaussianBlur(gray, (3, 3), 0)

    # 2. 自适应阈值二值化
    #    ADAPTIVE_THRESH_GAUSSIAN_C：邻域加权均值减 C
    #    THRESH_BINARY：大于阈值为 255（白），否则 0（黑）
    #    对线稿图（黑线白底），结果为：线条=0, 背景=255
    binary = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        block_size,
        C
    )

    # 3. 形态学腐蚀细化线条（替代 ximgproc.thinning）
    if erode_iters > 0:
        kernel = np.ones((2, 2), dtype=np.uint8)
        binary = cv2.erode(binary, kernel, iterations=erode_iters)

    # 4. 强制纯黑白（消除自适应阈值可能产生的中间灰度值）
    binary = np.where(binary > 127, 255, 0).astype(np.uint8)

    return binary


def to_inverted(binary: np.ndarray) -> np.ndarray:
    """
    将二值线稿反转为 distanceTransform / connectedComponents 需要的形态：
    线条=255（白），背景=0（黑）。
    """
    return cv2.bitwise_not(binary)


def imread_gray_unicode(path: str):
    """支持中文路径的灰度读图。"""
    arr = np.fromfile(path, dtype=np.uint8)
    if arr.size == 0:
        return None
    return cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)


def imread_color_unicode(path: str):
    """支持中文路径的彩色读图。"""
    arr = np.fromfile(path, dtype=np.uint8)
    if arr.size == 0:
        return None
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def imwrite_unicode(path: str, img: np.ndarray) -> None:
    """支持中文路径的写图。"""
    ext = os.path.splitext(path)[1]
    ok, buf = cv2.imencode(ext, img)
    if ok:
        with open(path, "wb") as f:
            f.write(buf.tobytes())
    else:
        raise IOError(f"无法编码图片: {path}")


# 延迟导入 os（避免循环依赖问题，保持模块独立）
import os
