"""
区块数据结构 — 记忆的基本单元
比喻：书架上的书，每本有固定位置、标签、借阅记录
"""
import time, json, hashlib
from dataclasses import dataclass, field, asdict
from typing import List, Optional

@dataclass
class Block:
    """
    一条记忆区块
    
    domain:      "execute/game_dev/raiden"  分类路径（固定结构）
    project:     "PRJ-2026-001-Raiden"      项目编码（生命周期标记）
    
    domain 和 project 正交：
      - 一个 domain 只有一个 project（一对一）
      - 一个 project 可关联多个 domain（一个案子跨技术/闲聊/任务）
    """
    # ── 定位字段 ──
    block_id: str = ""             # 唯一ID

    domain: str = ""                # 领域分类路径
    project: str = ""               # 项目编码（与domain正交）

    # ── 总结字段（由总结引擎填充） ──
    title: str = ""                 # 标题（~10字）
    summary: str = ""               # 摘要（~100字）
    archive_ref: str = ""           # 永久全量引用ID

    # ── 原始内容 ──
    content: str = ""               # 原始文本
    keywords: List[str] = field(default_factory=list)  # 关键词列表

    # ── 权重治理 ──
    weight: float = 1.0             # 当前权重（0~上限）
    decay_rate: float = 0.01        # 每日衰减速率
    created_at: float = 0.0         # 创建时间
    last_recalled: float = 0.0      # 最近一次被召回时间
    recall_count: int = 0           # 总召回次数

    # ── 生命周期 ──
    status: str = "active"          # active / cold / archived

    # ── 语气反馈 ──
    degraded_keywords: dict = field(default_factory=dict)
    # {"蓄力": 0.7, "Python": 0.2}  关键词→降级系数（越接近0越被抑制）

    def __post_init__(self):
        if not self.block_id:
            raw = f"{self.domain}_{self.project}_{time.time()}_{self.content[:20]}"
            self.block_id = hashlib.md5(raw.encode()).hexdigest()[:12]
        if not self.created_at:
            self.created_at = time.time()
        if not self.last_recalled:
            self.last_recalled = self.created_at

    def degrade_keyword(self, keyword: str, amount: float = 0.2):
        """对某个关键词降级（用户语气反馈触发）"""
        current = self.degraded_keywords.get(keyword, 1.0)
        self.degraded_keywords[keyword] = max(0.0, current - amount)

    def upgrade_keyword(self, keyword: str, amount: float = 0.1):
        """对某个关键词升级（用户满意反馈触发）"""
        current = self.degraded_keywords.get(keyword, 1.0)
        self.degraded_keywords[keyword] = min(1.0, current + amount)

    def effective_weight(self) -> float:
        """考虑关键词降级后的有效权重"""
        if not self.degraded_keywords:
            return self.weight
        # 取所有降级系数的最小值作为全局抑制因子
        min_factor = min(self.degraded_keywords.values())
        return self.weight * min_factor

    def to_dict(self) -> dict:
        return asdict(self)

    @staticmethod
    def from_dict(d: dict) -> "Block":
        return Block(**d)


class BlockStore:
    """区块存储——管理所有活跃区块"""

    def __init__(self):
        self._blocks: dict[str, Block] = {}  # block_id → Block

    def add(self, block: Block):
        self._blocks[block.block_id] = block

    def get(self, block_id: str) -> Optional[Block]:
        return self._blocks.get(block_id)

    def all_active(self) -> list:
        """返回所有status=active的区块"""
        return [b for b in self._blocks.values() if b.status == "active"]

    def by_project(self, project: str) -> list:
        return [b for b in self._blocks.values() if b.project == project]

    def by_domain(self, domain: str) -> list:
        return [b for b in self._blocks.values() if b.domain == domain]

    def count(self) -> int:
        return len(self._blocks)
