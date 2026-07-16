# 玩家颜色不重复 规范

## Why
玩家裤子蓝色(#2979FF)与溪流(#64B5F6)和湖泊(#5C9CE5)颜色相近，皮肤(#FFB74D)与山径(#A1887F)可能混淆。需要确保玩家全部颜色与山体所有颜色完全不重复。

## What Changes
- 皮肤色改为深鲑鱼色 #FF8A65
- 帽子改为亮黄色 #FFEB3B
- 裤子改为深紫色 #4527A0
- 上衣保持红色 #E53935（微调更鲜艳）

## Impact
- Affected specs: roblox-style, mountain-enrichment
- Affected code: game3d.js（玩家材质颜色常量）
