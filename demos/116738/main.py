import cv2
import numpy as np
import os
import glob
import time


def extract_sift_features(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    sift = cv2.SIFT_create(nfeatures=8000, nOctaveLayers=3, contrastThreshold=0.04, edgeThreshold=10, sigma=1.6)
    keypoints, descriptors = sift.detectAndCompute(gray, None)
    return keypoints, descriptors


def match_features(kp1, des1, kp2, des2, ratio_threshold=0.75):
    if des1 is None or des2 is None or len(kp1) < 8 or len(kp2) < 8:
        return None, None
    
    matcher = cv2.BFMatcher(cv2.NORM_L2, crossCheck=False)
    knn_matches = matcher.knnMatch(des1, des2, k=2)
    
    good_matches = []
    for m, n in knn_matches:
        if m.distance < ratio_threshold * n.distance:
            good_matches.append(m)
    
    if len(good_matches) < 8:
        return None, None
    
    src_pts = np.float32([kp1[m.queryIdx].pt for m in good_matches])
    dst_pts = np.float32([kp2[m.trainIdx].pt for m in good_matches])
    
    return src_pts, dst_pts


def compute_homography(src_pts, dst_pts, threshold=3.0, max_iter=10000):
    n = src_pts.shape[0]
    if n < 4:
        return None, None
    
    best_H = None
    best_inliers = None
    best_count = 0
    
    for _ in range(max_iter):
        indices = np.random.choice(n, 4, replace=False)
        src_4 = src_pts[indices]
        dst_4 = dst_pts[indices]
        
        A = np.zeros((8, 9))
        A[0::2, :2] = src_4
        A[0::2, 2] = 1
        A[1::2, 3:5] = src_4
        A[1::2, 5] = 1
        A[0::2, 6:8] = -dst_4[:, 0, np.newaxis] * src_4
        A[0::2, 8] = -dst_4[:, 0]
        A[1::2, 6:8] = -dst_4[:, 1, np.newaxis] * src_4
        A[1::2, 8] = -dst_4[:, 1]
        
        _, _, V = np.linalg.svd(A)
        H = V[-1].reshape(3, 3)
        if H[2, 2] != 0:
            H /= H[2, 2]
        
        src_hom = np.column_stack((src_pts, np.ones(n)))
        dst_hom = (H @ src_hom.T).T
        z = dst_hom[:, 2]
        valid = np.abs(z) > 1e-10
        
        dst_proj = np.zeros_like(src_pts)
        dst_proj[valid] = dst_hom[valid, :2] / dst_hom[valid, 2:3]
        
        dists = np.sqrt(np.sum((dst_proj - dst_pts)**2, axis=1))
        inliers = (dists < threshold).astype(np.uint8)
        count = np.sum(inliers)
        
        if count > best_count:
            best_count = count
            best_H = H.copy()
            best_inliers = inliers.copy()
    
    if best_count < 8:
        return None, None
    
    inlier_src = src_pts[best_inliers == 1]
    inlier_dst = dst_pts[best_inliers == 1]
    
    if len(inlier_src) >= 4:
        m = len(inlier_src)
        A_refine = np.zeros((2 * m, 9))
        A_refine[0::2, :2] = inlier_src
        A_refine[0::2, 2] = 1
        A_refine[1::2, 3:5] = inlier_src
        A_refine[1::2, 5] = 1
        A_refine[0::2, 6:8] = -inlier_dst[:, 0, np.newaxis] * inlier_src
        A_refine[0::2, 8] = -inlier_dst[:, 0]
        A_refine[1::2, 6:8] = -inlier_dst[:, 1, np.newaxis] * inlier_src
        A_refine[1::2, 8] = -inlier_dst[:, 1]
        
        _, _, V_refine = np.linalg.svd(A_refine)
        H_refined = V_refine[-1].reshape(3, 3)
        
        if H_refined[2, 2] != 0:
            H_refined /= H_refined[2, 2]
        
        return H_refined, best_inliers
    
    return best_H, best_inliers


def resize_image(image, max_dim=1000):
    h, w = image.shape[:2]
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        return cv2.resize(image, (int(w * scale), int(h * scale)))
    return image


def estimate_focal_length(image):
    h, w = image.shape[:2]
    diagonal = np.sqrt(h * h + w * w)
    return diagonal * 1.5


def cylindrical_projection(image, focal_length=None):
    h, w = image.shape[:2]
    if focal_length is None:
        focal_length = estimate_focal_length(image)
    
    cx, cy = w / 2.0, h / 2.0
    
    theta_max = np.arctan((w / 2.0) / focal_length)
    
    output_w = w
    output_h = h
    
    theta_min = -theta_max
    
    warped = np.zeros((output_h, output_w, 3), dtype=np.float32)
    mask = np.zeros((output_h, output_w), dtype=bool)
    
    y_grid, x_grid = np.meshgrid(np.arange(output_h), np.arange(output_w), indexing='ij')
    
    theta = (x_grid - output_w / 2.0) / focal_length
    h_prime = y_grid - cy
    
    x_src = focal_length * np.tan(theta) + cx
    y_src = h_prime / np.cos(theta) + cy
    
    valid = (x_src >= 0) & (x_src < w - 1) & (y_src >= 0) & (y_src < h - 1)
    
    x_floor = np.floor(x_src).astype(np.int32)
    y_floor = np.floor(y_src).astype(np.int32)
    
    x0 = np.clip(x_floor, 0, w - 2)
    x1 = x0 + 1
    y0 = np.clip(y_floor, 0, h - 2)
    y1 = y0 + 1
    
    fx = x_src - x_floor
    fy = y_src - y_floor
    
    tl = image[y0, x0].astype(np.float32)
    tr = image[y0, x1].astype(np.float32)
    bl = image[y1, x0].astype(np.float32)
    br = image[y1, x1].astype(np.float32)
    
    warped = (1 - fx[:, :, np.newaxis]) * (1 - fy[:, :, np.newaxis]) * tl + \
             fx[:, :, np.newaxis] * (1 - fy[:, :, np.newaxis]) * tr + \
             (1 - fx[:, :, np.newaxis]) * fy[:, :, np.newaxis] * bl + \
             fx[:, :, np.newaxis] * fy[:, :, np.newaxis] * br
    
    mask = valid
    
    return warped.astype(np.uint8), mask, focal_length


def warp_image(image, H, output_size):
    h, w = image.shape[:2]
    out_w, out_h = output_size
    
    try:
        H_inv = np.linalg.inv(H)
    except np.linalg.LinAlgError:
        return None, None
    
    block_size = 200
    warped = np.zeros((out_h, out_w, 3), dtype=np.float32)
    mask = np.zeros((out_h, out_w), dtype=bool)
    
    for by in range(0, out_h, block_size):
        for bx in range(0, out_w, block_size):
            block_w = min(block_size, out_w - bx)
            block_h = min(block_size, out_h - by)
            
            y_grid, x_grid = np.meshgrid(np.arange(by, by + block_h), np.arange(bx, bx + block_w), indexing='ij')
            coords = np.stack([x_grid.ravel(), y_grid.ravel(), np.ones(block_w * block_h)], axis=0)
            
            coords_trans = (H_inv @ coords).T
            
            z = coords_trans[:, 2]
            valid = np.abs(z) > 1e-10
            
            x_src = np.full(block_w * block_h, -1.0)
            y_src = np.full(block_w * block_h, -1.0)
            
            x_src[valid] = coords_trans[valid, 0] / z[valid]
            y_src[valid] = coords_trans[valid, 1] / z[valid]
            
            x_src = np.nan_to_num(x_src, nan=-1.0, posinf=-1.0, neginf=-1.0)
            y_src = np.nan_to_num(y_src, nan=-1.0, posinf=-1.0, neginf=-1.0)
            
            x_src = x_src.reshape(block_h, block_w)
            y_src = y_src.reshape(block_h, block_w)
            
            block_mask = (x_src >= 0) & (x_src < w - 1) & (y_src >= 0) & (y_src < h - 1)
            
            if not np.any(block_mask):
                continue
            
            x_floor = np.floor(x_src).astype(np.int32)
            y_floor = np.floor(y_src).astype(np.int32)
            
            x0 = np.clip(x_floor, 0, w - 2)
            x1 = x0 + 1
            y0 = np.clip(y_floor, 0, h - 2)
            y1 = y0 + 1
            
            fx = x_src - x_floor
            fy = y_src - y_floor
            
            tl = image[y0, x0].astype(np.float32)
            tr = image[y0, x1].astype(np.float32)
            bl = image[y1, x0].astype(np.float32)
            br = image[y1, x1].astype(np.float32)
            
            block_warped = (1 - fx[:, :, np.newaxis]) * (1 - fy[:, :, np.newaxis]) * tl + \
                          fx[:, :, np.newaxis] * (1 - fy[:, :, np.newaxis]) * tr + \
                          (1 - fx[:, :, np.newaxis]) * fy[:, :, np.newaxis] * bl + \
                          fx[:, :, np.newaxis] * fy[:, :, np.newaxis] * br
            
            warped[by:by+block_h, bx:bx+block_w] = block_warped
            mask[by:by+block_h, bx:bx+block_w] = block_mask
    
    return warped.astype(np.uint8), mask


def blend_images(canvas, warped, warped_mask):
    canvas_mask = (canvas > 0).any(axis=2).astype(np.float32)
    w_mask = warped_mask.astype(np.float32)
    
    blended = canvas.copy().astype(np.float32)
    
    non_overlap = (w_mask > 0) & (canvas_mask == 0)
    blended[non_overlap] = warped[non_overlap].astype(np.float32)
    
    overlap = (canvas_mask > 0) & (w_mask > 0)
    if overlap.any():
        dist_c = cv2.distanceTransform((1 - canvas_mask).astype(np.uint8) * 255, cv2.DIST_L2, 3)
        dist_w = cv2.distanceTransform((1 - w_mask).astype(np.uint8) * 255, cv2.DIST_L2, 3)
        
        max_dist = max(np.max(dist_c), np.max(dist_w))
        if max_dist > 0:
            dist_c = dist_c / max_dist
            dist_w = dist_w / max_dist
        
        dist_sum = dist_c + dist_w
        dist_sum[dist_sum == 0] = 1e-10
        
        weight_c = dist_w / dist_sum
        weight_w = 1 - weight_c
        
        k_size = int(max_dist * 2)
        k_size = k_size if k_size % 2 == 1 else k_size + 1
        k_size = max(k_size, 5)
        k_size = min(k_size, 101)
        
        weight_c = cv2.GaussianBlur(weight_c, (k_size, k_size), 0)
        weight_w = 1 - weight_c
        
        weight_3d = np.stack([weight_c, weight_c, weight_c], axis=2)
        
        blended[overlap] = (weight_3d[overlap] * canvas[overlap].astype(np.float32) + \
                            (1 - weight_3d[overlap]) * warped[overlap].astype(np.float32))
    
    return blended.astype(np.uint8)


def stitch_images_sequential(images, dataset_name, is_360=False):
    n = len(images)
    if n == 0:
        return None
    if n == 1:
        return images[0]
    
    print(f"拼接 {dataset_name}: {n} 张图像 (顺序拼接)")
    
    images_resized = [resize_image(img, max_dim=1000) for img in images]
    
    if is_360:
        print("预投影到圆柱面...")
        focal_length = estimate_focal_length(images_resized[0])
        images_projected = []
        for img in images_resized:
            projected, mask, _ = cylindrical_projection(img, focal_length)
            images_projected.append(projected)
        images_resized = images_projected
        print(f"焦距估计: {focal_length:.1f}")
    
    print("提取特征...")
    features = [extract_sift_features(img) for img in images_resized]
    
    print("计算相邻图像homography...")
    homographies = []
    
    for i in range(n - 1):
        kp1, des1 = features[i]
        kp2, des2 = features[i + 1]
        src_pts, dst_pts = match_features(kp1, des1, kp2, des2)
        
        if src_pts is None:
            print(f"图像 {i} 和 {i+1} 匹配失败")
            return None
        
        H, inliers = compute_homography(src_pts, dst_pts)
        if H is None:
            print(f"图像 {i} 和 {i+1} homography计算失败")
            return None
        
        homographies.append(H)
        print(f"图像 {i}-{i+1}: {len(src_pts)} 匹配点")
    
    center_idx = n // 2
    print(f"中心图像: {center_idx}")
    
    H_relative = [np.eye(3) for _ in range(n)]
    
    for i in range(center_idx - 1, -1, -1):
        H_relative[i] = H_relative[i + 1] @ homographies[i]
    
    for i in range(center_idx + 1, n):
        try:
            H_inv = np.linalg.inv(homographies[i - 1])
            H_relative[i] = H_relative[i - 1] @ H_inv
        except np.linalg.LinAlgError:
            print(f"图像 {i} homography求逆失败")
            return None
    
    print("计算所有变换后角点...")
    all_corners = []
    
    for i, img in enumerate(images_resized):
        h, w = img.shape[:2]
        corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2)
        transformed = cv2.perspectiveTransform(corners, H_relative[i])
        all_corners.append(transformed)
    
    all_corners = np.concatenate(all_corners, axis=0)
    
    x_min = np.min(all_corners[:, 0, 0])
    x_max = np.max(all_corners[:, 0, 0])
    y_min = np.min(all_corners[:, 0, 1])
    y_max = np.max(all_corners[:, 0, 1])
    
    padding = 50
    x_min -= padding
    y_min -= padding
    new_w = int(np.ceil(x_max - x_min)) + padding * 2
    new_h = int(np.ceil(y_max - y_min)) + padding * 2
    
    max_dim = 12000
    if new_w > max_dim or new_h > max_dim:
        scale = min(max_dim / new_w, max_dim / new_h)
        new_w = int(new_w * scale)
        new_h = int(new_h * scale)
    
    translation = np.array([[1, 0, -x_min], [0, 1, -y_min], [0, 0, 1]], dtype=np.float64)
    
    print(f"画布尺寸: {new_w}x{new_h}")
    
    canvas = np.zeros((new_h, new_w, 3), dtype=np.uint8)
    
    print("Warp所有图像到画布...")
    
    for i in range(n):
        H_final = translation @ H_relative[i]
        warped, mask = warp_image(images_resized[i], H_final, (new_w, new_h))
        if warped is not None:
            canvas = blend_images(canvas, warped, mask)
            print(f"图像 {i}: 完成")
        else:
            print(f"图像 {i}: warp失败")
    
    if is_360 and n > 3:
        print("尝试360°闭合...")
        kp_first, des_first = features[0]
        kp_last, des_last = features[-1]
        src_pts, dst_pts = match_features(kp_first, des_first, kp_last, des_last)
        
        if src_pts is not None and len(src_pts) > 15:
            H_close, inliers = compute_homography(src_pts, dst_pts)
            if H_close is not None:
                corners_first = np.float32([[0, 0], [images_resized[0].shape[1], 0], 
                                           [images_resized[0].shape[1], images_resized[0].shape[0]], 
                                           [0, images_resized[0].shape[0]]]).reshape(-1, 1, 2)
                
                H_0_to_last = H_relative[-1] @ H_close
                transformed_first = cv2.perspectiveTransform(corners_first, H_0_to_last)
                
                x_shift = transformed_first[0, 0, 0]
                
                if abs(x_shift) > 50:
                    shift_matrix = np.array([[1, 0, x_shift], [0, 1, 0], [0, 0, 1]], dtype=np.float64)
                    H_final_first_close = translation @ H_relative[0] @ shift_matrix
                    
                    warped_first_close, mask_first_close = warp_image(images_resized[0], H_final_first_close, (new_w, new_h))
                    if warped_first_close is not None:
                        canvas = blend_images(canvas, warped_first_close, mask_first_close)
                        print("360°闭合成功")
    
    return canvas


def load_images(folder_path):
    exts = ['*.jpg', '*.jpeg', '*.png']
    images = []
    
    for ext in exts:
        for filepath in sorted(glob.glob(os.path.join(folder_path, ext))):
            img = cv2.imread(filepath)
            if img is not None:
                images.append(img)
    
    if not images:
        raise ValueError(f"未找到图像: {folder_path}")
    
    print(f"加载 {len(images)} 张图像")
    return images


def main():
    datasets = [
        ('plain/AANAP-roundabout', False),
        ('plain/AANAP-skyline', False),
        ('plain/APAP-conssite', False),
        ('plain/APAP-garden', False),
        ('plain/APAP-train', False),
        ('plain/DHW-forest', False),
        ('plain/NISwGSP-cise', False),
        ('casual/NISwGSP-05_SienaCathedral', False),
        ('casual/NISwGSP-13_PalazzoPubblico2', False),
        ('hard/NISwGSP-08_SienaCathedralLibrary3', False),
        ('hard/NISwGSP-10_SienaCathedralInterior', False),
        ('360/NISwGSP-denny', True, 8),
        ('360/NISwGSP-grail', True, 10),
        ('360/NISwGSP-parrington', True, 10),
    ]
    
    output_dir = 'output'
    os.makedirs(output_dir, exist_ok=True)
    
    for dataset_info in datasets:
        dataset_name = dataset_info[0]
        is_360 = dataset_info[1]
        max_images = dataset_info[2] if len(dataset_info) > 2 else None
        
        dataset_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), dataset_name)
        
        if not os.path.exists(dataset_path):
            print(f"不存在: {dataset_path}")
            continue
        
        try:
            images = load_images(dataset_path)
            
            if max_images is not None and len(images) > max_images:
                print(f"图像数量 {len(images)}，仅使用前 {max_images} 张")
                images = images[:max_images]
            
            start = time.time()
            panorama = stitch_images_sequential(images, os.path.basename(dataset_name), is_360)
            end = time.time()
            
            if panorama is not None:
                output_path = os.path.join(output_dir, f'{os.path.basename(dataset_name)}_panorama.jpg')
                cv2.imwrite(output_path, panorama)
                print(f"完成: {output_path}")
                print(f"耗时: {end - start:.2f}s, 尺寸: {panorama.shape[1]}x{panorama.shape[0]}\n")
            else:
                print(f"失败: {dataset_name}\n")
            
        except Exception as e:
            import traceback
            print(f"错误: {dataset_name} - {str(e)}")
            traceback.print_exc()
            print()


if __name__ == '__main__':
    main()