# -*- coding: utf-8 -*-
"""
使用 Edge TTS 生成男声和女声两套 26 个英文字母语音。

输出：
  letters/female/A.mp3 ~ letters/female/Z.mp3  （女声 en-US-AriaNeural）
  letters/male/A.mp3   ~ letters/male/Z.mp3    （男声 en-US-GuyNeural）

发音标准，B 的 /b/ 爆破清晰，与 V 区分明显。
需要联网生成，生成后可离线使用。
"""
import os
import asyncio
import edge_tts

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

# 男声和女声配置
VOICES = {
    'female': {
        'voice': 'en-US-AriaNeural',  # 女声，自然亲切
        'dir': os.path.join(BASE_DIR, 'letters', 'female'),
    },
    'male': {
        'voice': 'en-US-GuyNeural',   # 男声，沉稳清晰
        'dir': os.path.join(BASE_DIR, 'letters', 'male'),
    },
}

async def generate_one(letter, voice, out_path, rate):
    communicate = edge_tts.Communicate(letter, voice, rate=rate)
    await communicate.save(out_path)
    print('  ', letter, '->', os.path.relpath(out_path, BASE_DIR))

async def main():
    rate = '-15%'  # 稍慢更清晰
    for gender, cfg in VOICES.items():
        os.makedirs(cfg['dir'], exist_ok=True)
        print('生成', gender, '语音（', cfg['voice'], '）:')
        for letter in LETTERS:
            out_path = os.path.join(cfg['dir'], letter + '.mp3')
            await generate_one(letter, cfg['voice'], out_path, rate)
    print('完成！')

if __name__ == '__main__':
    asyncio.run(main())
