"""图片生成服务

默认 stub（PIL 占位图，离线免费），可扩展 DALL-E/即梦 API。
复用 wechat-automation/ai/image_gen.py 的 PIL stub 模式。
"""
from __future__ import annotations

import hashlib
import io
from pathlib import Path

from app.config import MEDIA_DIR, get_image_gen_config
from app.logging import get_logger

logger = get_logger(__name__)


class ImageGenService:
    def __init__(self):
        cfg = get_image_gen_config()
        self.provider = cfg.get("provider", "stub")
        self.cache_dir = MEDIA_DIR / cfg.get("cache_dir", "images").replace("/", "\\")
        self.cache_dir = MEDIA_DIR / "images"
        self.cache_dir.mkdir(parents=True, exist_ok=True)

        # DALL-E 配置
        dall_e_cfg = cfg.get("dall_e", {})
        self.dall_e_api_key = dall_e_cfg.get("api_key", "")
        self.dall_e_size = dall_e_cfg.get("size", "1024x1024")

    async def generate(self, prompt: str) -> str | None:
        """生成图片，返回本地路径

        Args:
            prompt: 图片描述

        Returns:
            本地图片路径，失败返回 None
        """
        if not prompt:
            return None

        # 缓存：相同 prompt 复用图片
        cache_key = hashlib.sha256(prompt.encode("utf-8")).hexdigest()[:16]

        try:
            if self.provider == "dall_e" and self.dall_e_api_key:
                image_bytes = await self._dall_e_generate(prompt)
            else:
                image_bytes = await self._stub_generate(prompt)

            if not image_bytes:
                return None

            cache_path = self.cache_dir / f"{cache_key}.jpg"
            cache_path.write_bytes(image_bytes)
            logger.info(f"图片已生成: {cache_path}")
            return str(cache_path)

        except Exception as e:
            logger.exception(f"图片生成失败: {e}")
            return None

    async def _dall_e_generate(self, prompt: str) -> bytes | None:
        """DALL-E API 生成"""
        try:
            from openai import AsyncOpenAI

            client = AsyncOpenAI(api_key=self.dall_e_api_key)
            response = await client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size=self.dall_e_size,
                quality="standard",
                n=1,
                response_format="b64_json",
            )
            import base64

            return base64.b64decode(response.data[0].b64_json)
        except Exception as e:
            logger.exception(f"DALL-E 调用失败: {e}")
            return None

    async def _stub_generate(self, prompt: str) -> bytes | None:
        """PIL 占位图：生成带文字的纯色图"""
        from PIL import Image, ImageDraw, ImageFont

        w, h = 512, 512

        # 根据 prompt hash 生成不同的背景色
        color_seed = int(hashlib.md5(prompt.encode()).hexdigest()[:6], 16)
        r = (color_seed >> 16) & 0xFF
        g = (color_seed >> 8) & 0xFF
        b = color_seed & 0xFF
        # 保证亮度
        r = max(r, 150)
        g = max(g, 150)
        b = max(b, 150)

        img = Image.new("RGB", (w, h), color=(r, g, b))
        draw = ImageDraw.Draw(img)

        # 加载中文字体
        try:
            font = ImageFont.truetype(
                "C:/Windows/Fonts/msyh.ttc", 28
            ) if Path("C:/Windows/Fonts/msyh.ttc").exists() else ImageFont.load_default()
            small_font = ImageFont.truetype(
                "C:/Windows/Fonts/msyh.ttc", 18
            ) if Path("C:/Windows/Fonts/msyh.ttc").exists() else ImageFont.load_default()
        except Exception:
            font = ImageFont.load_default()
            small_font = font

        # 写入标题
        title = "AI 生成图片"
        bbox = draw.textbbox((0, 0), title, font=font)
        text_w = bbox[2] - bbox[0]
        draw.text(
            ((w - text_w) // 2, h // 4),
            title,
            fill=(255, 255, 255),
            font=font,
        )

        # 写入 prompt（前 30 字，自动换行）
        prompt_text = prompt[:60]
        y = h // 2
        max_chars_per_line = 12
        lines = [
            prompt_text[i : i + max_chars_per_line]
            for i in range(0, len(prompt_text), max_chars_per_line)
        ]
        for line in lines[:6]:
            bbox = draw.textbbox((0, 0), line, font=small_font)
            line_w = bbox[2] - bbox[0]
            draw.text(
                ((w - line_w) // 2, y),
                line,
                fill=(50, 50, 50),
                font=small_font,
            )
            y += 28

        # 写入标识
        mark = "[stub image]"
        bbox = draw.textbbox((0, 0), mark, font=small_font)
        mark_w = bbox[2] - bbox[0]
        draw.text(
            ((w - mark_w) // 2, h - 50),
            mark,
            fill=(100, 100, 100),
            font=small_font,
        )

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85)
        return buf.getvalue()


# 全局单例
_service: ImageGenService | None = None


def get_image_gen_service() -> ImageGenService:
    global _service
    if _service is None:
        _service = ImageGenService()
    return _service
