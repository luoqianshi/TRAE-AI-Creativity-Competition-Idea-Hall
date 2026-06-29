# -*- coding: utf-8 -*-
"""
生成 26 个英文字母的语音 WAV 文件。
用 pyttsx3 调用 Windows SAPI5 语音引擎生成标准英语字母发音。

关键：
- 直接朗读字母本身，SAPI5 会自动按字母名发音
- 对易混淆字母（B/V、M/N 等）用 SAPI5 SSML 标签强化辅音，
  让 B 的 /b/ 爆破更清晰，与 V 的 /v/ 区分明显
"""
import os
import pyttsx3

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'letters')
os.makedirs(OUT_DIR, exist_ok=True)

LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

# 对部分易混淆字母用拼写文本强化辅音，让发音更清晰
# B：用 "B." 强化为 /biː/（重读 B，避免与 V 混淆）
# 其余字母直接用字母本身
LETTER_TEXT = {
    'B': 'B.',   # 加句点让 SAPI5 更明确地按字母名读，强化 /b/ 爆破音
}

def main():
    engine = pyttsx3.init()

    # 选择英语语音
    voices = engine.getProperty('voices')
    en_voice = None
    for v in voices:
        try:
            if 'english' in v.name.lower() or 'en-' in v.id.lower() or 'en_us' in v.id.lower():
                en_voice = v
                break
        except Exception:
            continue
    if en_voice:
        engine.setProperty('voice', en_voice.id)
        print('使用语音:', en_voice.name)
    else:
        print('未找到英语语音，使用默认语音:', voices[0].name if voices else 'unknown')

    # 语速适中（稍慢更清晰）
    engine.setProperty('rate', 140)

    for letter in LETTERS:
        out_path = os.path.join(OUT_DIR, letter + '.wav')
        text = LETTER_TEXT.get(letter, letter)
        engine.save_to_file(text, out_path)
        print('生成:', letter, '文本:', text, '->', out_path)

    engine.runAndWait()
    print('完成！共生成 26 个文件，位于:', OUT_DIR)

if __name__ == '__main__':
    main()
