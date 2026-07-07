"""
AI 隔空指挥台 - 手势识别后端
只识别3种手势：握拳(fist)、张开手掌(open_palm)、食指指向(point)
通过 WebSocket 实时推送手势状态给前端大屏
"""

import asyncio
import json
import sys
import threading
import time
import urllib.request
from collections import Counter, deque
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, StreamingResponse
from mediapipe.tasks.python import vision
from mediapipe.tasks.python.core import base_options as base_opt
import uvicorn

app = FastAPI(title="AI 隔空指挥台")

# 调试模式：python gesture_server.py --debug 会显示摄像头小窗
SHOW_CAMERA = "--debug" in sys.argv

# ============================================================
# 模型下载
# ============================================================
MODEL_PATH = Path(__file__).parent / "hand_landmarker.task"
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task"


def ensure_model():
    if not MODEL_PATH.exists():
        print("[INFO] 正在下载手势识别模型（约 10MB）...")
        urllib.request.urlretrieve(MODEL_URL, str(MODEL_PATH))
        print("[INFO] 模型下载完成")


# ============================================================
# 全局状态
# ============================================================
state_lock = threading.Lock()
current_state = {
    "gesture": "none",
    "cursor_x": 0.5,
    "cursor_y": 0.5,
    "hand_detected": False,
}

pos_history: deque = deque(maxlen=6)
gesture_history: deque = deque(maxlen=8)
connected_clients: set[WebSocket] = set()

# 用于视频流
latest_frame_jpeg = None
frame_condition = threading.Condition()


# ============================================================
# 手势分类（新版 API 的 landmarks 是 list[NormalizedLandmark]，直接有 .x .y .z）
# ============================================================
def classify_gesture(landmarks) -> str:
    tips = [4, 8, 12, 16, 20]
    pips = [3, 6, 10, 14, 18]

    fingers_extended = []
    for i in range(5):
        if i == 0:  # 拇指
            thumb_tip = np.array([landmarks[4].x, landmarks[4].y])
            index_mcp = np.array([landmarks[5].x, landmarks[5].y])
            fingers_extended.append(np.linalg.norm(thumb_tip - index_mcp) > 0.15)
        else:
            fingers_extended.append(landmarks[tips[i]].y < landmarks[pips[i]].y)

    extended_count = sum(fingers_extended)

    if fingers_extended[1] and extended_count <= 2:
        return "point"
    if extended_count <= 1:
        return "fist"
    if extended_count >= 4:
        return "open_palm"
    return "none"


# ============================================================
# 调试可视化
# ============================================================
GESTURE_LABELS = {
    "point": "POINT - 食指指向",
    "fist": "FIST - 握拳",
    "open_palm": "OPEN PALM - 张开手掌",
    "none": "NONE",
}
GESTURE_COLORS = {
    "point": (255, 200, 0),
    "fist": (0, 255, 0),
    "open_palm": (255, 0, 255),
    "none": (100, 100, 100),
}

# 手部关键点连接关系
HAND_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 4),       # 拇指
    (0, 5), (5, 6), (6, 7), (7, 8),       # 食指
    (0, 9), (9, 10), (10, 11), (11, 12),   # 中指
    (0, 13), (13, 14), (14, 15), (15, 16), # 无名指
    (0, 17), (17, 18), (18, 19), (19, 20), # 小指
    (5, 9), (9, 13), (13, 17),             # 手掌横向
]


def _draw_debug_overlay(frame, result, gesture, smoothed_cx, smoothed_cy):
    """在摄像头上绘制手势关键点、连接线和状态信息"""
    h, w = frame.shape[:2]

    # 半透明黑色背景条（顶部）
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 80), (0, 0, 0), -1)
    frame = cv2.addWeighted(overlay, 0.5, frame, 0.5, 0)

    if result.hand_landmarks:
        hand_lm = result.hand_landmarks[0]

        # 绘制连接线
        for start_idx, end_idx in HAND_CONNECTIONS:
            x1 = int(hand_lm[start_idx].x * w)
            y1 = int(hand_lm[start_idx].y * h)
            x2 = int(hand_lm[end_idx].x * w)
            y2 = int(hand_lm[end_idx].y * h)
            cv2.line(frame, (x1, y1), (x2, y2), (0, 200, 100), 1)

        # 绘制普通关键点
        for i, lm in enumerate(hand_lm):
            x, y = int(lm.x * w), int(lm.y * h)
            if i == 8:  # 食指指尖 - 特殊处理
                continue
            cv2.circle(frame, (x, y), 3, (0, 120, 255), -1)

        # 高亮光标源
        if gesture in ["open_palm", "fist"]:
            raw_tip = hand_lm[9]
        else:
            raw_tip = hand_lm[8]
            
        rx, ry = int(raw_tip.x * w), int(raw_tip.y * h)
        cv2.circle(frame, (rx, ry), 8, (0, 200, 255), 2)
        cv2.circle(frame, (rx, ry), 4, (0, 200, 255), -1)

        # 平滑后的光标位置（虚线十字）
        sx, sy = int(smoothed_cx * w), int(smoothed_cy * h)
        cv2.line(frame, (sx - 15, sy), (sx + 15, sy), (0, 255, 255), 1)
        cv2.line(frame, (sx, sy - 15), (sx, sy + 15), (0, 255, 255), 1)

        # 手指状态条
        tips = [4, 8, 12, 16, 20]
        pips = [3, 6, 10, 14, 18]
        finger_names = ["Thumb", "Index", "Middle", "Ring", "Pinky"]
        bar_x = 10
        bar_y = h - 40
        for i in range(5):
            if i == 0:
                thumb_tip = np.array([hand_lm[4].x, hand_lm[4].y])
                index_mcp = np.array([hand_lm[5].x, hand_lm[5].y])
                extended = np.linalg.norm(thumb_tip - index_mcp) > 0.15
            else:
                extended = hand_lm[tips[i]].y < hand_lm[pips[i]].y
            color = (0, 255, 0) if extended else (80, 80, 80)
            cv2.circle(frame, (bar_x + i * 30, bar_y), 8, color, -1)
            cv2.putText(frame, finger_names[i][0], (bar_x + i * 30 - 4, bar_y - 15),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)

    # 手势名称
    label = GESTURE_LABELS.get(gesture, "NONE")
    color = GESTURE_COLORS.get(gesture, (100, 100, 100))
    cv2.putText(frame, label, (12, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

    # 坐标信息
    cv2.putText(frame, f"Cursor: ({smoothed_cx:.3f}, {smoothed_cy:.3f})",
                (12, 58), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 180, 180), 1)

    return frame


# ============================================================
# Webcam 线程
# ============================================================
def webcam_loop():
    global current_state
    global latest_frame_jpeg

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] 无法打开摄像头", flush=True)
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    base = base_opt.BaseOptions(model_asset_path=str(MODEL_PATH))
    opts = vision.HandLandmarkerOptions(
        base_options=base,
        num_hands=1,
        running_mode=vision.RunningMode.IMAGE,
    )
    detector = vision.HandLandmarker.create_from_options(opts)

    print("[INFO] 手势识别已启动，摄像头工作中...", flush=True)
    if SHOW_CAMERA:
        print("[DEBUG] 调试小窗已开启，按 Q 或关闭窗口可退出", flush=True)

    while True:
        ret, frame = cap.read()
        if not ret:
            time.sleep(0.01)
            continue

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result = detector.detect(mp_img)

        gesture = "none"
        hand_detected = False

        if result.hand_landmarks:
            hand_lm = result.hand_landmarks[0]
            hand_detected = True

            gesture = classify_gesture(hand_lm)

            gesture_history.append(gesture)
            if len(gesture_history) >= 5:
                gesture = Counter(gesture_history).most_common(1)[0][0]

            # 任何手势下都更新光标
            if gesture in ["point", "open_palm", "fist", "none"]:
                # 使用掌心(9号关键点)作为张手和握拳时的光标，食指指尖(8号关键点)作为指向时的光标
                if gesture == "open_palm":
                    raw_cx, raw_cy = hand_lm[9].x, hand_lm[9].y
                elif gesture == "fist":
                    # 握拳时也用掌心作为追踪点比较稳定
                    raw_cx, raw_cy = hand_lm[9].x, hand_lm[9].y
                else:
                    # none 或 point 使用食指
                    raw_cx, raw_cy = hand_lm[8].x, hand_lm[8].y
                    
                pos_history.append((raw_cx, raw_cy))
                if pos_history:
                    cx = sum(p[0] for p in pos_history) / len(pos_history)
                    cy = sum(p[1] for p in pos_history) / len(pos_history)
        else:
            pos_history.clear()
            gesture_history.clear()
            with state_lock:
                cx = current_state["cursor_x"]
                cy = current_state["cursor_y"]

        with state_lock:
            current_state = {
                "gesture": gesture,
                "cursor_x": round(cx, 4),
                "cursor_y": round(cy, 4),
                "hand_detected": hand_detected,
            }

        # ---- 生成调试画面并编码为 JPEG 用于流传输 ----
        annotated_frame = _draw_debug_overlay(frame, result, gesture, cx, cy)
        ret_enc, buffer = cv2.imencode('.jpg', annotated_frame)
        if ret_enc:
            with frame_condition:
                latest_frame_jpeg = buffer.tobytes()
                frame_condition.notify_all()
        
        if SHOW_CAMERA:
            cv2.imshow("Gesture Debug - 手势调试", annotated_frame)
            cv2.waitKey(1)

        time.sleep(0.005)

    cap.release()
    detector.close()
    if SHOW_CAMERA:
        cv2.destroyAllWindows()


@app.on_event("startup")
async def startup():
    ensure_model()
    t = threading.Thread(target=webcam_loop, daemon=True)
    t.start()


# ============================================================
# WebSocket
# ============================================================
@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    connected_clients.add(ws)
    try:
        while True:
            with state_lock:
                data = json.dumps(current_state, ensure_ascii=False)
            await ws.send_text(data)
            await asyncio.sleep(0.05)
    except (WebSocketDisconnect, Exception):
        connected_clients.discard(ws)


# ============================================================
# 前端
# ============================================================
def gen_frames():
    while True:
        with frame_condition:
            frame_condition.wait()
            frame_bytes = latest_frame_jpeg
        if frame_bytes:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.get("/video_feed")
async def video_feed():
    return StreamingResponse(gen_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

FRONTEND_PATH = Path(__file__).parent.parent / "frontend" / "index.html"
PARTICLE_PATH = Path(__file__).parent.parent / "frontend" / "particle.html"
MAP_PATH = Path(__file__).parent.parent / "frontend" / "map.html"
INK_PATH = Path(__file__).parent.parent / "frontend" / "ink.html"
FACTORY_PATH = Path(__file__).parent.parent / "frontend" / "factory.html"
MAGIC_PATH = Path(__file__).parent.parent / "frontend" / "magic.html"


@app.get("/")
async def root():
    if FRONTEND_PATH.exists():
        return HTMLResponse(FRONTEND_PATH.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>前端文件未找到</h1>")


@app.get("/particle")
async def particle():
    if PARTICLE_PATH.exists():
        return HTMLResponse(PARTICLE_PATH.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>粒子页面未找到</h1>")


@app.get("/map")
async def map_page():
    if MAP_PATH.exists():
        return HTMLResponse(MAP_PATH.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>地图页面未找到</h1>")


@app.get("/ink")
async def ink_page():
    if INK_PATH.exists():
        return HTMLResponse(INK_PATH.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>水墨页面未找到</h1>")


@app.get("/factory")
async def factory_page():
    if FACTORY_PATH.exists():
        return HTMLResponse(FACTORY_PATH.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>工厂页面未找到</h1>")


@app.get("/magic")
async def magic_page():
    if MAGIC_PATH.exists():
        return HTMLResponse(MAGIC_PATH.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>魔法世界页面未找到</h1>")


if __name__ == "__main__":
    ensure_model()
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
