"""
Flask 后端 API：提供图像处理服务，配合 index.html 前端使用。
启动后访问 http://127.0.0.1:5000

API:
  POST /api/process  上传图片+参数，返回处理结果（图片URL + 统计信息）
  GET  /api/file/<name>  获取输出文件（图片/PDF）
"""
import os
import sys
from datetime import datetime

# 确保 src 目录可被 import
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify, send_from_directory, send_file
import sector_crop
import width_detect
import connectivity_detect
import colorize

app = Flask(__name__, static_folder="static", static_url_path="")

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.route("/")
def index():
    """返回前端 HTML 页面。"""
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/process", methods=["POST"])
def process():
    """处理上传的图片，返回所有结果。"""
    try:
        file = request.files.get("image")
        if not file:
            return jsonify({"error": "未上传图片"}), 400

        fold_count = int(request.form.get("fold_count", 4))
        danger_thresh = int(request.form.get("danger_thresh", 3))
        thin_thresh = int(request.form.get("thin_thresh", 8))
        axis = request.form.get("axis", "vertical")

        # 保存上传图片
        upload_path = os.path.join(OUTPUT_DIR, "upload.png")
        file.save(upload_path)

        # 1. 对称剖分
        sector_result = sector_crop.crop_sector(upload_path, fold_count, output_dir=OUTPUT_DIR, axis=axis)

        # 2. 宽度检测（用于界面展示统计）
        width_result = width_detect.detect_width(
            upload_path, danger_thresh=danger_thresh, thin_thresh=thin_thresh,
            output_dir=OUTPUT_DIR, erode_iters=1)

        # 3. 连通性检测（用于界面展示统计）
        conn_result = connectivity_detect.detect_connectivity(
            upload_path, output_dir=OUTPUT_DIR, min_island_area=20, erode_iters=1)

        # 4. 染色生成彩色施工指导图 + 纯净线稿
        color_result = colorize.colorize_lineart(
            upload_path, output_dir=OUTPUT_DIR,
            thin_thresh=danger_thresh, thick_thresh=thin_thresh, erode_iters=1)

        return jsonify({
            "success": True,
            "sector": "/api/file/sector.png",
            "reconstruct": "/api/file/reconstruct.png",
            "diff": "/api/file/diff.png",
            "mean_diff": sector_result["mean_diff"],
            "width_annotated": "/api/file/width_annotated.png",
            "danger_count": width_result["danger_count"],
            "thin_count": width_result["thin_count"],
            "safe_count": width_result["safe_count"],
            "connectivity_annotated": "/api/file/connectivity_annotated.png",
            "main_area": conn_result["main_area"],
            "island_count": conn_result["island_count"],
            "blueprint_color": "/api/file/blueprint_color.png",
            "blueprint_clean": "/api/file/blueprint_clean.png",
            "color_danger": color_result["danger_count"],
            "color_thin": color_result["thin_count"],
            "color_safe": color_result["safe_count"],
            "color_island": color_result["island_count"],
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/file/<name>")
def get_file(name):
    """获取输出文件。"""
    return send_from_directory(OUTPUT_DIR, name)


if __name__ == "__main__":
    print("=" * 50)
    print("对称剪纸底稿生成器 - Web 服务已启动")
    print("访问地址: http://127.0.0.1:5000")
    print("=" * 50)
    app.run(host="0.0.0.0", port=5000, debug=False)
