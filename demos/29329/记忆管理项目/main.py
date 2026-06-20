"""
记忆管理系统 — 主入口

整合全部模块演示完整流程：
  摄入 → 空区块 → 异步总结 → 共现学习 → 系数召回 → 数据清洗
  → 语气反馈 → 权重调整 → 时序衰减 → 阈值潮汐 → 归档 → 反查 → 复活
"""
import time
from core.archive import Archive
from core.block import Block, BlockStore
from core.recall_engine import RecallEngine, CooccurrenceMatrix
from core.decay import WeightManager
from core.feedback import ToneFeedback
from core.cleaner import CleaningPipeline
from core.lifecycle import LifecycleManager


class MemorySystem:
    """记忆管理系统——完整生命周期"""

    def __init__(self):
        self.archive = Archive()
        self.store = BlockStore()
        self.matrix = CooccurrenceMatrix()
        self.recall = RecallEngine(self.store, self.matrix)
        self.weights = WeightManager(self.store)
        self.feedback = ToneFeedback(self.store)
        self.cleaner = CleaningPipeline()
        self.lifecycle = LifecycleManager(self.store, self.archive)

    # ── 写入 ──

    def memorize(self, content: str, domain: str = "", project: str = "",
                 keywords: list = None, title: str = "") -> Block:
        """
        摄入一条新记忆
        
        流程：写入永久全量 → 创建空区块（占位）
        总结由异步引擎填充（模拟）
        """
        # 写入永久全量
        archive_id = self.archive.write({
            "type": "memory",
            "domain": domain,
            "project": project,
            "content": content,
            "keywords": keywords or [],
        })

        # 创建区块（空区块占位，防止总结失败丢数据）
        block = Block(
            domain=domain,
            project=project,
            title=title or "(待总结)",
            summary="",
            content=content,
            keywords=keywords or [],
            archive_ref=archive_id,
            weight=1.0,
        )
        self.store.add(block)
        return block

    def fill_summary(self, block_id: str, title: str, summary: str):
        """异步填充总结（模拟总结引擎完成）"""
        block = self.store.get(block_id)
        if block:
            block.title = title
            block.summary = summary

    # ── 召回 ──

    def query(self, keywords: list, project: str = "", user_reply: str = "",
              top_n: int = 5) -> str:
        """
        完整查询流程
        
        1. 系数召回 → 2. 数据清洗 → 3. 语气反馈 → 4. 权重调整
        """
        # 1. 召回
        raw_results = self.recall.recall(keywords, project, top_n * 2)

        # 2. 数据清洗
        cleaned = self.cleaner.clean(raw_results, tone_filter_keywords=keywords)
        output = self.cleaner.merge_for_output(cleaned)

        # 3. 记录共现（召回的块之间）
        if project and len(cleaned) >= 2:
            for i in range(len(cleaned) - 1):
                self.matrix.record(
                    cleaned[i][0].block_id,
                    cleaned[i+1][0].block_id,
                    project,
                )

        # 4. 权重调整（被召回的块权重上升）
        for block, _ in cleaned:
            self.weights.on_recall(block.block_id)

        # 5. 处理用户语气反馈（如果有）
        if user_reply:
            recalled_blocks = [b for b, _ in cleaned]
            feedback_result = self.feedback.process(user_reply, recalled_blocks, keywords)
            if feedback_result["action"] == "degrade":
                # 挫败 → 被召回的块额外扣权
                for block, _ in cleaned:
                    self.weights.on_skip(block.block_id)

        return output

    # ── 维护 ──

    def daily_maintenance(self):
        """每日维护——时序衰减 + 阈值开合 + 共现衰减"""
        self.weights.daily_decay()
        self.recall.daily_tick()
        print(f"  [维护] 阈值: {self.recall.current_threshold:.3f}")

    # ── 生命周期 ──

    def archive_project(self, project: str, summary: str = ""):
        return self.lifecycle.archive_project(project, summary)

    def retrieve(self, project: str):
        return self.lifecycle.retrieve_project(project)

    def revive(self, project: str):
        return self.lifecycle.revive_project(project)

    def list_archived(self) -> list:
        return self.lifecycle.list_archived()

    # ── 报告 ──

    def report(self) -> dict:
        """系统状态报告"""
        active = self.store.all_active()
        return {
            "blocks": len(active),
            "threshold": round(self.recall.current_threshold, 3),
            "projects": len(set(b.project for b in active if b.project)),
            "archived": len(self.lifecycle.list_archived()),
        }
