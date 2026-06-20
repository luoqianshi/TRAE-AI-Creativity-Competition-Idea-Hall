"""
系数召回引擎 — 共现矩阵 + 动态开合 + 自反馈
比喻：图书索书号系统，通过读者借阅习惯自动调整关联

核心机理：
  - 共现矩阵：同一项目内，用户查了A又查B，A↔B系数上升
  - 时效衰减：长时间未共现的对，系数自然下降
  - 每天不开合的阈值：阈值随时间降低（开），被命中后升高（合）
  - 自反馈：命中后根据后续语气调整关键词权重
"""
import json, time, os, math, random
from pathlib import Path
from typing import Optional
from collections import defaultdict
from .block import Block, BlockStore

COOC_DIR = Path(__file__).parent.parent / "storage" / "matrices"


class CooccurrenceMatrix:
    """
    共现矩阵——一个项目一张
    
    格式：
    {
      "PRJ-2026-001": {
        "block_id_A": {"block_id_B": 0.8, "block_id_C": 0.3},
        "block_id_B": {"block_id_A": 0.8, "block_id_D": 0.6},
      }
    }
    0.0 = 无关  →  1.0 = 强关联
    """

    def __init__(self):
        self._data: dict[str, dict[str, dict[str, float]]] = {}
        COOC_DIR.mkdir(parents=True, exist_ok=True)
        self._load_all()

    def _project_path(self, project: str) -> Path:
        return COOC_DIR / f"{project}.json"

    def _load_all(self):
        for f in COOC_DIR.glob("*.json"):
            project = f.stem
            with open(f, "r", encoding="utf-8") as fh:
                self._data[project] = json.load(fh)

    def _save_project(self, project: str):
        if project in self._data:
            path = self._project_path(project)
            with open(path, "w", encoding="utf-8") as f:
                json.dump(self._data[project], f, ensure_ascii=False, indent=2)

    def _ensure(self, project: str):
        if project not in self._data:
            self._data[project] = {}

    def record(self, block_a: str, block_b: str, project: str, increment: float = 0.1):
        """记录一次共现：用户查了A之后查了B"""
        if block_a == block_b:
            return
        self._ensure(project)
        m = self._data[project]
        if block_a not in m:
            m[block_a] = {}
        if block_b not in m:
            m[block_b] = {}
        # A→B
        old = m[block_a].get(block_b, 0.0)
        m[block_a][block_b] = min(1.0, old + increment)
        # B→A（对称）
        m[block_b][block_a] = min(1.0, old + increment)
        self._save_project(project)

    def get(self, block_a: str, block_b: str, project: str) -> float:
        """查询两个块的共现系数"""
        if project not in self._data:
            return 0.0
        return self._data[project].get(block_a, {}).get(block_b, 0.0)

    def decay_project(self, project: str, rate: float = 0.005):
        """时效衰减：整个项目的共现系数每天按比例下降"""
        if project not in self._data:
            return
        m = self._data[project]
        for a in list(m.keys()):
            for b in list(m[a].keys()):
                m[a][b] = max(0.0, m[a][b] - rate)
                if m[a][b] <= 0.0:
                    del m[a][b]
            if not m[a]:
                del m[a]
        self._save_project(project)

    def project_size(self, project: str) -> int:
        """共现矩阵条目数（用于监控是否收敛）"""
        if project not in self._data:
            return 0
        count = 0
        for a in self._data[project]:
            count += len(self._data[project][a])
        return count


class RecallEngine:
    """系数召回引擎"""

    def __init__(self, store: BlockStore, matrix: CooccurrenceMatrix):
        self.store = store
        self.matrix = matrix

        # ── 阈值参数 ──
        self.base_threshold = 0.3       # 基准阈值
        self.current_threshold = 0.3    # 当前阈值
        self.threshold_decay = 0.02     # 每天阈值下降量（"开"）
        self.threshold_rise = 0.05      # 每次命中后阈值上升量（"合"）
        self.last_threshold_update = time.time()

        # ── 冷启动 ──
        self.cold_start_days = 3        # 运行不足3天用时间排序兜底
        self.system_start_time = time.time()

    def recall(self, keywords: list[str], project: str = "", top_n: int = 5) -> list:
        """
        召回匹配的记忆块
        
        策略优先级：
          1. 如果系统运行不足冷启动期 → 按时间+关键词过滤返回最新的
          2. 正常 → 共现矩阵优先，关键词匹配次之
        """
        # ── 冷启动 ──
        if time.time() - self.system_start_time < self.cold_start_days * 86400:
            return self._cold_start_recall(top_n, keywords, project)

        # ── 正常召回 ──
        candidates = self._score_candidates(keywords, project)
        
        # 应用阈值过滤
        filtered = [c for c in candidates if c[1] >= self.current_threshold]
        
        # 按得分排序
        filtered.sort(key=lambda x: -x[1])

        # 命中后提升阈值（"合"）
        if filtered:
            self._on_recall_hit()

        return filtered[:top_n]

    def _cold_start_recall(self, top_n: int, keywords: list = None, project: str = "") -> list:
        """冷启动：按关键词+时间排序返回最新的"""
        active = self.store.all_active()
        if project:
            active = [b for b in active if b.project == project]
        if keywords:
            active = [
                b for b in active
                if any(kw in b.keywords or kw in b.content for kw in keywords)
            ]
        active.sort(key=lambda b: -b.created_at)
        return [(b, b.weight) for b in active[:top_n]]

    def _score_candidates(self, keywords: list[str], project: str) -> list:
        """
        计算所有活跃区块的匹配得分
        
        得分 = 关键词匹配 × 有效权重 × 共现增强
        """
        results = []
        for block in self.store.all_active():
            if project and block.project != project:
                continue

            # 1. 关键词匹配度
            match_count = sum(1 for kw in keywords if kw in block.keywords or kw in block.content)
            if match_count == 0:
                continue
            
            kw_score = match_count / max(len(keywords), 1)

            # 2. 有效权重（含降级因子）
            eff_weight = block.effective_weight()

            # 3. 共现增强：如果这些关键词之前和别的块做过共现，额外加分
            cooc_bonus = 0.0
            if project and project in self.matrix._data:
                proj_data = self.matrix._data[project]
                if block.block_id in proj_data:
                    # 跟该项目内其他块的共现度均值
                    neighbors = proj_data[block.block_id]
                    if neighbors:
                        cooc_bonus = sum(neighbors.values()) / len(neighbors) * 0.3

            score = kw_score * eff_weight * (1.0 + cooc_bonus)
            results.append((block, round(score, 4)))

        return results

    def _on_recall_hit(self):
        """命中后阈值上升（"合"），防止同一批内容持续垄断"""
        self.current_threshold = min(1.0, self.current_threshold + self.threshold_rise)
        self.last_threshold_update = time.time()

    def daily_tick(self):
        """每天调用一次——阈值下降（"开"）+ 共现衰减"""
        # 阈值下降（给冷区块重新浮上来的机会）
        self.current_threshold = max(0.01, self.current_threshold - self.threshold_decay)

        # 共现矩阵时效衰减
        projects = set(b.project for b in self.store.all_active() if b.project)
        for p in projects:
            self.matrix.decay_project(p)
