"""
时序衰减 + 权重封顶 + 阈值潮汐
比喻：灰尘（自然落灰） + 畅销榜上限（不会永远霸榜） + 潮水（涨落给沉底内容机会）
"""
import time
from .block import BlockStore


class WeightManager:
    """权重治理——衰减、封顶、阈值联动"""

    def __init__(self, store: BlockStore):
        self.store = store

        # 权重参数
        self.weight_ceiling = 5.0          # 权重硬上限
        self.default_decay_rate = 0.01     # 默认每日衰减
        self.recall_increment = 0.1        # 每次被召回权重增量

    def daily_decay(self):
        """每日定时衰减——所有未在当天被召回的区块权重下降"""
        now = time.time()
        for block in self.store.all_active():
            days_since_recall = (now - block.last_recalled) / 86400
            if days_since_recall >= 1.0:
                # 超过1天未被召回 → 按衰减速率降权
                decay = block.decay_rate * days_since_recall
                block.weight = max(0.01, block.weight - decay)

    def on_recall(self, block_id: str):
        """区块被召回后触发——权重上升（正反馈）"""
        block = self.store.get(block_id)
        if block:
            block.weight = min(self.weight_ceiling, block.weight + self.recall_increment)
            block.last_recalled = time.time()
            block.recall_count += 1

    def on_skip(self, block_id: str):
        """区块被召回但用户跳过（负反馈）"""
        block = self.store.get(block_id)
        if block:
            # 被跳过的惩罚比自然衰减大一些
            block.weight = max(0.01, block.weight - self.recall_increment * 2)
