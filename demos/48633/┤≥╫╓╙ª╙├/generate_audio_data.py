# -*- coding: utf-8 -*-
"""
将男声和女声两套字母音频转换为 base64 编码，生成 audio_data.js。

输出结构：
  window.LETTER_AUDIO_BASE64 = {
    female: { 'A': 'data:audio/mpeg;base64,...', ... },
    male:   { 'A': 'data:audio/mpeg;base64,...', ... },
  };
"""
import os
import base64

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_FILE = os.path.join(BASE_DIR, 'audio_data.js')
LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
GENDERS = ['female', 'male']

def main():
    lines = [
        '// 自动生成的字母音频数据（base64 编码，男声 + 女声）',
        '// 由 generate_audio_data.py 生成',
        'window.LETTER_AUDIO_BASE64 = {',
    ]
    for gender in GENDERS:
        lines.append("  '" + gender + "': {")
        for letter in LETTERS:
            path = os.path.join(BASE_DIR, 'letters', gender, letter + '.mp3')
            if not os.path.exists(path):
                print('警告: 缺少文件', path)
                continue
            with open(path, 'rb') as f:
                data = f.read()
            b64 = base64.b64encode(data).decode('ascii')
            lines.append("    '" + letter + "': 'data:audio/mpeg;base64," + b64 + "',")
            print(gender, letter, '->', len(data), 'bytes')
        lines.append('  },')
    lines.append('};')
    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print('已生成:', OUT_FILE)

if __name__ == '__main__':
    main()
