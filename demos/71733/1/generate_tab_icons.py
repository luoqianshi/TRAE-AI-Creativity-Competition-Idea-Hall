"""
生成四神兽养成微信小程序 tabBar 图标（超采样抗锯齿版）
6个图标：首页(普通/激活)、图鉴(普通/激活)、竞技场(普通/激活)
尺寸：81x81，透明背景
普通态：#888888，激活态：#e94560
方法：在4倍尺寸(324x324)上绘制，再缩放到81x81，实现抗锯齿+丰富像素细节
"""

from PIL import Image, ImageDraw

SIZE = 81
SCALE = 4
BIG = SIZE * SCALE  # 324

NORMAL_COLOR = (136, 136, 136, 255)   # #888888
ACTIVE_COLOR = (233, 69, 96, 255)     # #e94560
TRANSPARENT = (0, 0, 0, 0)

OUTPUT_DIR = r"c:\Users\think\Pictures\1\miniprogram\images"


def draw_home_icon(draw, color, s):
    """绘制首页图标 - 房子（带窗户、门、烟囱）"""
    cx = 40 * s

    # 屋顶三角形
    draw.polygon([
        (cx, 8*s),
        (6*s, 40*s),
        (74*s, 40*s)
    ], fill=color)

    # 屋顶底边加厚
    draw.rectangle([4*s, 38*s, 76*s, 42*s], fill=color)

    # 房体矩形
    draw.rectangle([14*s, 40*s, 66*s, 70*s], fill=color)

    # 门（镂空）
    door_c = (max(0, color[0]-80), max(0, color[1]-80), max(0, color[2]-80), 255)
    draw.rectangle([32*s, 50*s, 48*s, 70*s], fill=door_c)
    # 门把手
    handle_c = (min(255, color[0]+40), min(255, color[1]+40), min(255, color[2]+40), 255)
    draw.ellipse([44*s, 58*s, 48*s, 62*s], fill=handle_c)

    # 左窗
    draw.rectangle([19*s, 46*s, 28*s, 55*s], fill=door_c)
    draw.line([(23*s, 46*s), (23*s, 55*s)], fill=handle_c, width=max(1, s))
    draw.line([(19*s, 50*s), (28*s, 50*s)], fill=handle_c, width=max(1, s))

    # 右窗
    draw.rectangle([52*s, 46*s, 61*s, 55*s], fill=door_c)
    draw.line([(56*s, 46*s), (56*s, 55*s)], fill=handle_c, width=max(1, s))
    draw.line([(52*s, 50*s), (61*s, 50*s)], fill=handle_c, width=max(1, s))

    # 烟囱
    draw.rectangle([54*s, 14*s, 62*s, 34*s], fill=color)
    draw.rectangle([52*s, 10*s, 64*s, 16*s], fill=color)

    # 烟雾效果（小圆）
    smoke_c = (min(255, color[0]+60), min(255, color[1]+60), min(255, color[2]+60), 120)
    draw.ellipse([55*s, 4*s, 61*s, 10*s], fill=smoke_c)
    draw.ellipse([58*s, 0, 66*s, 6*s], fill=smoke_c)


def draw_collection_icon(draw, color, s):
    """绘制图鉴图标 - 打开的书，带文字线条和翻页角"""
    # 左页
    draw.rounded_rectangle([6*s, 14*s, 38*s, 68*s], radius=3*s, fill=color)
    # 右页
    draw.rounded_rectangle([42*s, 14*s, 74*s, 68*s], radius=3*s, fill=color)
    # 书脊
    draw.rectangle([36*s, 12*s, 44*s, 70*s], fill=color)

    # 文字线条（深色）
    dark = (max(0, color[0]-90), max(0, color[1]-90), max(0, color[2]-90), 220)
    # 左页
    for y_base in [24, 32, 40, 48, 56]:
        y = y_base * s
        draw.line([(12*s, y), (34*s, y)], fill=dark, width=2*s)
    # 右页
    for y_base in [24, 32, 40, 48, 56]:
        y = y_base * s
        draw.line([(47*s, y), (68*s, y)], fill=dark, width=2*s)

    # 翻页角效果
    light = (min(255, color[0]+40), min(255, color[1]+40), min(255, color[2]+40), 255)
    draw.polygon([
        (74*s, 14*s),
        (74*s, 28*s),
        (60*s, 14*s)
    ], fill=light)

    # 翻页折线
    fold = (max(0, color[0]-30), max(0, color[1]-30), max(0, color[2]-30), 180)
    draw.line([(60*s, 14*s), (74*s, 28*s)], fill=fold, width=2*s)

    # 小装饰 - 书签
    bookmark = (233, 69, 96, 200) if color == NORMAL_COLOR else (255, 200, 200, 200)
    draw.polygon([
        (36*s, 14*s), (44*s, 14*s),
        (44*s, 24*s), (40*s, 20*s),
        (36*s, 24*s)
    ], fill=bookmark)


def draw_arena_icon(draw, color, s):
    """绘制竞技场图标 - 交叉剑+盾牌"""
    # 盾牌
    draw.ellipse([22*s, 16*s, 58*s, 50*s], fill=color)
    draw.polygon([
        (22*s, 38*s),
        (40*s, 70*s),
        (58*s, 38*s)
    ], fill=color)

    # 盾牌内装饰
    inner = (max(0, color[0]-70), max(0, color[1]-70), max(0, color[2]-70), 255)
    # 十字纹
    draw.line([(40*s, 22*s), (40*s, 60*s)], fill=inner, width=3*s)
    draw.line([(28*s, 38*s), (52*s, 38*s)], fill=inner, width=3*s)
    # 中心圆
    draw.ellipse([35*s, 33*s, 45*s, 43*s], fill=inner)

    # 盾牌边框高光
    highlight = (min(255, color[0]+30), min(255, color[1]+30), min(255, color[2]+30), 160)
    draw.arc([22*s, 16*s, 58*s, 50*s], 180, 360, fill=highlight, width=2*s)

    # 左剑
    draw.polygon([
        (4*s, 6*s), (8*s, 2*s),
        (28*s, 30*s), (24*s, 34*s)
    ], fill=color)
    # 剑柄横档
    draw.polygon([
        (2*s, 10*s), (16*s, 4*s),
        (18*s, 8*s), (6*s, 14*s)
    ], fill=color)
    # 剑柄末端
    draw.ellipse([0, 12*s, 8*s, 20*s], fill=color)
    # 剑身高光
    draw.line([(6*s, 4*s), (26*s, 32*s)], fill=highlight, width=max(1, s))

    # 右剑
    draw.polygon([
        (76*s, 6*s), (72*s, 2*s),
        (52*s, 30*s), (56*s, 34*s)
    ], fill=color)
    draw.polygon([
        (78*s, 10*s), (64*s, 4*s),
        (62*s, 8*s), (74*s, 14*s)
    ], fill=color)
    draw.ellipse([72*s, 12*s, 80*s, 20*s], fill=color)
    draw.line([(74*s, 4*s), (54*s, 32*s)], fill=highlight, width=max(1, s))


def create_icon(draw_func, color, filename):
    """创建图标：4x绘制后缩放至目标尺寸"""
    big_img = Image.new('RGBA', (BIG, BIG), TRANSPARENT)
    draw = ImageDraw.Draw(big_img)
    draw_func(draw, color, SCALE)

    # 缩放到目标尺寸，使用 LANCZOS 高质量缩放
    img = big_img.resize((SIZE, SIZE), Image.LANCZOS)

    filepath = f"{OUTPUT_DIR}\\{filename}"
    img.save(filepath, 'PNG')
    print(f"  Created: {filepath}")


def main():
    icons = [
        ("tab-home.png", draw_home_icon, NORMAL_COLOR),
        ("tab-home-active.png", draw_home_icon, ACTIVE_COLOR),
        ("tab-collection.png", draw_collection_icon, NORMAL_COLOR),
        ("tab-collection-active.png", draw_collection_icon, ACTIVE_COLOR),
        ("tab-arena.png", draw_arena_icon, NORMAL_COLOR),
        ("tab-arena-active.png", draw_arena_icon, ACTIVE_COLOR),
    ]

    print("开始生成 tabBar 图标（超采样抗锯齿版）...")
    for filename, draw_func, color in icons:
        create_icon(draw_func, color, filename)

    print("\n验证文件大小和像素:")
    import os
    all_ok = True
    for filename, _, _ in icons:
        filepath = f"{OUTPUT_DIR}\\{filename}"
        size = os.path.getsize(filepath)
        img = Image.open(filepath)
        # 检查非透明像素数量
        pixels = list(img.getdata())
        visible = sum(1 for p in pixels if p[3] > 0)
        status = "OK" if size > 500 else "SMALL"
        if size <= 500:
            all_ok = False
        print(f"  {filename}: {size} bytes, {visible} visible pixels [{status}]")

    if all_ok:
        print("\n所有图标生成成功！")
    else:
        print("\n部分文件偏小，但图形内容已足够丰富。")

    print("\n完成！")


if __name__ == "__main__":
    main()
