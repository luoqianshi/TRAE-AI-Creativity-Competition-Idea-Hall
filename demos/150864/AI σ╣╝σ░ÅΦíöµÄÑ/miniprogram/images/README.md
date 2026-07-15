# images/ — 图片资源

## tabBar 图标说明

当前使用「自定义 tabBar」（`components/custom-tab-bar/`），通过 emoji 字符渲染图标，**无需 PNG 图标文件**。

如需替换为设计稿图标，请在此目录创建 `tab/` 子目录并放入：
- `island.png` / `island-active.png`（81×81px，探究岛）
- `growth.png` / `growth-active.png`（81×81px，成长）

然后在 `components/custom-tab-bar/index.wxml` 中将 emoji 替换为 `<image>` 标签。

## 图片优化要求

- 格式：WebP 优先，PNG 次之
- 尺寸：按显示尺寸 ×2 retina，不超过实际需求
- 主包单图 < 50KB
- 大图走云存储 CDN，不打入包内
