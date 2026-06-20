"""
完整生命周期演示

模拟一个「雷电游戏开发」项目的完整流程：
  1. 摄入多条记忆 → 2. 冷启动查询 → 3. 正常召回 + 共现学习
  → 4. 语气反馈降级 → 5. 时序衰减 + 阈值潮汐 → 6. 项目归档
  → 7. 反查 → 8. 复活
"""
import time, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import MemorySystem


def simulate_days(mem: MemorySystem, days: int):
    """模拟多天的时序衰减"""
    for d in range(days):
        mem.daily_maintenance()


def main():
    print("=" * 60)
    print("🧪 区块化动态系数召回AI记忆架构 — 完整演示")
    print("=" * 60)

    mem = MemorySystem()

    # ── 阶段1：摄入 ──
    print("\n── 阶段1：摄入记忆 ──")
    b1 = mem.memorize(
        content="雷电游戏蓄力系统：按住空格1.5秒充能，2秒满蓄力，松开释放",
        domain="execute/game_dev/raiden",
        project="PRJ-2026-001",
        keywords=["雷电", "蓄力", "空格", "充能"],
        title="蓄力系统设计",
    )
    mem.fill_summary(b1.block_id, "蓄力系统设计", "空格键蓄力，1.5-2秒充能释放")
    print(f"  ✅ 蓄力系统 (block_id={b1.block_id})")

    b2 = mem.memorize(
        content="子弹碰撞检测：使用pygame的Rect碰撞，掩码检测精确碰撞",
        domain="execute/game_dev/raiden",
        project="PRJ-2026-001",
        keywords=["雷电", "子弹", "碰撞", "pygame", "Rect"],
        title="碰撞检测方案",
    )
    mem.fill_summary(b2.block_id, "碰撞检测", "Rect+掩码两级碰撞检测")
    print(f"  ✅ 碰撞检测 (block_id={b2.block_id})")

    b3 = mem.memorize(
        content="敌机波次系统：每波递增数量，第5波出Boss，Boss血厚3倍",
        domain="execute/game_dev/raiden",
        project="PRJ-2026-001",
        keywords=["雷电", "敌机", "波次", "Boss", "递增"],
        title="敌机波次设计",
    )
    mem.fill_summary(b3.block_id, "敌机波次", "递增波次，第5波Boss")
    print(f"  ✅ 敌机波次 (block_id={b3.block_id})")

    # 再加一条不相关的记忆做对比
    b4 = mem.memorize(
        content="桌面宠物：透明窗口置顶显示，点击互动切换动作帧",
        domain="execute/game_dev/pet",
        project="PRJ-2026-002",
        keywords=["宠物", "透明", "置顶", "互动"],
        title="桌面宠物架构",
    )
    mem.fill_summary(b4.block_id, "桌面宠物", "透明窗口+点击互动")
    print(f"  ✅ 桌面宠物 (block_id={b4.block_id}) — 不同项目")

    # ── 阶段2：查询（冷启动——按时间排序） ──
    print("\n── 阶段2：冷启动查询「雷电蓄力」──")
    result = mem.query(["雷电", "蓄力"])
    print(result or "  (无结果)")
    print(f"  (系统启动初期，冷启动模式→按时间排序)")

    # ── 阶段3：多次查询 → 共现学习 ──
    print("\n── 阶段3：多次查同一项目 → 共现矩阵学习 ──")
    for i in range(5):
        mem.query(["雷电", "子弹", "碰撞"], project="PRJ-2026-001")
    print("  (5次查雷电+子弹→蓄力和碰撞的共现度上升)")

    # 查看共现矩阵
    proj_data = mem.matrix._data.get("PRJ-2026-001", {})
    for a, neighbors in proj_data.items():
        for b, coef in neighbors.items():
            print(f"    共现: {a[:8]} ↔ {b[:8]} 系数={coef:.2f}")

    # ── 阶段4：语气反馈降级 ──
    print("\n── 阶段4：语气反馈降级 ──")
    result = mem.query(
        ["雷电", "蓄力"],
        user_reply="不是这个意思，我已经试过这个方案了，蓄力时间太长了",
    )
    print(f"  用户反馈: 挫败感")
    b1_after = mem.store.get(b1.block_id)
    if b1_after:
        print(f"  block 蓄力 关键词降级: {b1_after.degraded_keywords}")
        print(f"  有效权重: {b1_after.effective_weight():.2f}")

    # ── 阶段5：时序衰减 + 阈值潮汐 ──
    print("\n── 阶段5：模拟30天时序衰减 + 阈值潮汐 ──")
    for day in range(1, 31):
        mem.daily_maintenance()
        if day % 10 == 0 or day == 1:
            print(f"  第{day:2d}天  阈值={mem.recall.current_threshold:.3f}")

    b1_now = mem.store.get(b1.block_id)
    if b1_now:
        print(f"  block 蓄力30天后权重: {b1_now.weight:.2f}")

    # ── 阶段6：项目归档 ──
    print("\n── 阶段6：项目归档 ──")
    arch = mem.archive_project("PRJ-2026-001", "雷电游戏开发完美收工")
    print(f"  归档状态: {arch['status']}")
    print(f"  归档block数: {arch['block_count']}")
    print(f"  静态库路径: {arch.get('static_path','')}")
    print(f"  活跃区蓄力状态: {mem.store.get(b1.block_id).status if mem.store.get(b1.block_id) else 'N/A'}")

    # ── 阶段7：反查 ──
    print("\n── 阶段7：反查已归档项目 ──")
    data = mem.retrieve("PRJ-2026-001")
    if data:
        print(f"  找到项目: {data['project']}")
        print(f"  block数: {len(data['blocks'])}")

    # ── 阶段8：复活 ──
    print("\n── 阶段8：发现问题→复活项目 ──")
    revive = mem.revive("PRJ-2026-001")
    print(f"  复活状态: {revive['status']}")
    print(f"  恢复block数: {revive['block_count']}")
    alive = mem.store.get(b1.block_id)
    if alive:
        print(f"  蓄力状态回迁: {alive.status} 权重: {alive.weight:.2f}")

    # ── 最终报告 ──
    print("\n" + "=" * 60)
    print("📊 最终系统状态")
    print("=" * 60)
    report = mem.report()
    for k, v in report.items():
        print(f"  {k}: {v}")

    print("\n✅ 演示完毕 — 全部链路正常")


if __name__ == "__main__":
    main()
