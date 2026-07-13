# -*- coding: utf-8 -*-
"""
微信聊天记录实时录屏脚本
=========================

功能：
  打开某个微信聊天会话后，脚本自动从底部向上滚动并同步录屏，
  滚动到顶部、录屏满 5 分钟、或手动按 F7 任一条件满足即停止，
  视频保存到脚本目录下的 recordings/ 文件夹。

使用步骤：
  1. 打开微信，进入某个聊天会话，把消息列表拉到最底部
  2. 把鼠标移动到聊天内容区域上（脚本以鼠标位置为锚点向上滚动）
  3. 按 F6 开始（3 秒倒计时）
  4. 录屏过程中按 F7 可提前停止
  5. 视频自动保存为 recordings/wechat_YYYYMMDD_HHMMSS.mp4

依赖安装：
  pip install opencv-python numpy mss pyautogui keyboard
"""

import os
import sys
import time
import datetime
import threading

import cv2
import numpy as np
import mss
import pyautogui
import keyboard

# ===================== 可调参数 =====================
MAX_RECORD_SECONDS = 5 * 60      # 最大录屏时长（秒），上限 5 分钟
SCROLL_CLICKS = 3                # 每次滚轮滚动格数（正值=向上）
SCROLL_INTERVAL = 0.12           # 两次滚动之间的间隔（秒）
FPS = 20                         # 输出视频帧率（真实时间播放）
NO_CHANGE_LIMIT = 30             # 连续无变化帧数阈值，超过判定已到顶
DIFF_THRESHOLD = 1.2             # 帧差异均值阈值（越小越敏感）
START_KEY = "f6"                 # 开始热键
STOP_KEY = "f7"                  # 手动停止热键
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "recordings")
# 录制区域：None=主显示器全屏；或 (left, top, width, height)
REGION = None
# ===================================================


class WeChatRecorder:
    def __init__(self):
        self.sct = mss.mss()
        self.running = False
        self.writer = None
        self.stop_reason = ""
        self.scroll_pos = None
        self.region = self._resolve_region()

    def _resolve_region(self):
        """把 REGION 配置统一转成 mss 需要的 dict。"""
        if REGION:
            left, top, w, h = REGION
            return {"left": left, "top": top, "width": w, "height": h}
        # monitors[0] 是虚拟全屏，monitors[1] 是主显示器
        return self.sct.monitors[1]

    def grab_frame(self):
        """抓取一帧并转为 BGR（OpenCV 格式）。"""
        img = np.array(self.sct.grab(self.region))
        return cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

    def start(self):
        print(f"\n[INFO] 录制区域：left={self.region['left']}, top={self.region['top']}, "
              f"{self.region['width']}x{self.region['height']}")
        print(f"[INFO] 最长录屏 {MAX_RECORD_SECONDS} 秒")
        print(f"[INFO] 请把鼠标移到聊天内容区域上，按 {START_KEY.upper()} 开始；"
              f"过程中按 {STOP_KEY.upper()} 提前停止。")

        keyboard.wait(START_KEY)
        print("[INFO] 3 秒后开始...")
        for i in range(3, 0, -1):
            print(f"  {i}...")
            time.sleep(1)

        # 以当前鼠标位置作为滚动锚点
        self.scroll_pos = pyautogui.position()
        print(f"[INFO] 滚动锚点：{self.scroll_pos}")

        # 初始化视频写入器
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        path = os.path.join(OUTPUT_DIR, f"wechat_{ts}.mp4")
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        self.writer = cv2.VideoWriter(
            path, fourcc, FPS, (self.region["width"], self.region["height"]))
        if not self.writer.isOpened():
            print("[ERROR] 视频写入器初始化失败，请检查 opencv-python 是否正确安装")
            return

        self.running = True
        stop_flag = {"stop": False}
        keyboard.add_hotkey(STOP_KEY, lambda: stop_flag.__setitem__("stop", True))

        start_time = time.time()
        shared = {"no_change": 0}
        prev_gray = [None]
        frame_count = [0]

        # ---------- 抓帧线程：维持真实 FPS ----------
        def capture_loop():
            next_t = time.time()
            while self.running:
                try:
                    frame = self.grab_frame()
                except Exception as e:
                    print(f"[WARN] 抓帧失败：{e}")
                    time.sleep(1.0 / FPS)
                    continue
                self.writer.write(frame)
                frame_count[0] += 1

                # 帧差判断是否已到顶
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                if prev_gray[0] is not None:
                    diff = cv2.absdiff(gray, prev_gray[0])
                    if float(diff.mean()) < DIFF_THRESHOLD:
                        shared["no_change"] += 1
                    else:
                        shared["no_change"] = 0
                prev_gray[0] = gray

                # 按目标 FPS 节流
                next_t += 1.0 / FPS
                sleep_for = next_t - time.time()
                if sleep_for > 0:
                    time.sleep(sleep_for)

        cap_thread = threading.Thread(target=capture_loop, daemon=True)
        cap_thread.start()

        # ---------- 主线程：滚动 + 停止条件判定 ----------
        print("[INFO] 录屏开始...")
        try:
            while self.running:
                elapsed = time.time() - start_time
                if elapsed >= MAX_RECORD_SECONDS:
                    self.stop_reason = f"达到最大时长 {MAX_RECORD_SECONDS} 秒"
                    break
                if stop_flag["stop"]:
                    self.stop_reason = "手动停止"
                    break
                if shared["no_change"] >= NO_CHANGE_LIMIT:
                    self.stop_reason = "已滚动到顶部"
                    break

                # 向上滚动一格
                pyautogui.scroll(SCROLL_CLICKS,
                                 x=self.scroll_pos.x, y=self.scroll_pos.y)
                time.sleep(SCROLL_INTERVAL)
        finally:
            self.running = False
            cap_thread.join(timeout=2)
            keyboard.unhook_all_hotkeys()
            if self.writer:
                self.writer.release()

        duration = time.time() - start_time
        print(f"\n[完成] 停止原因：{self.stop_reason}")
        print(f"[完成] 实际时长：{duration:.1f} 秒   写入帧数：{frame_count[0]}")
        print(f"[完成] 视频已保存：{path}")


def check_deps():
    """检查必需依赖是否已安装。"""
    missing = []
    for mod in ("cv2", "numpy", "mss", "pyautogui", "keyboard"):
        try:
            __import__(mod)
        except ImportError:
            missing.append(mod)
    if missing:
        print("[ERROR] 缺少依赖：" + ", ".join(missing))
        print("请运行：pip install opencv-python numpy mss pyautogui keyboard")
        sys.exit(1)


def main():
    check_deps()
    print("=" * 56)
    print("           微信聊天记录实时录屏脚本")
    print("=" * 56)
    print("使用步骤：")
    print("  1. 打开微信聊天，把消息列表拉到最底部")
    print("  2. 鼠标移到聊天内容区域上")
    print(f"  3. 按 {START_KEY.upper()} 开始（3 秒倒计时）")
    print(f"  4. 按 {STOP_KEY.upper()} 可提前停止；满 5 分钟或到顶自动停")
    print("-" * 56)
    pyautogui.FAILSAFE = False  # 鼠标移到左上角不触发异常
    rec = WeChatRecorder()
    rec.start()
    print("\n[INFO] 程序结束。")


if __name__ == "__main__":
    main()
