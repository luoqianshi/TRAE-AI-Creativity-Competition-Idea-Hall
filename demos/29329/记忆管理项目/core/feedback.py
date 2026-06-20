"""
语气反馈降级 — 用户说话的语气本身就是反馈信号
比喻：读者皱眉，图书管理员就知道这本书摆错位置了

核心思路：
  - 不依赖用户主动打分
  - 从用户回复的语气推断"这个结果有用吗"
  - 挫败感关键词 → 触发这次匹配的关联集体降级
  - 满意/兴奋 → 触发升级
"""
import re
from typing import List
from .block import BlockStore


# ── 挫败感信号词（用户语气特征） ──
FRUSTRATION_SIGNALS = [
    "不是", "不对", "错了", "不是这个意思", "我已经试过",
    "不行", "没用", "不适用", "不适合", "不是我要的",
    "说过了", "已经说了", "你看不懂吗", "明明",
    "again", "wrong", "not what I meant", "that's not it",
    "tried that", "doesn't work", "not helpful",
    "唉", "算了", "服了", "无语",
]

SATISFACTION_SIGNALS = [
    "对", "就是这个", "可以", "不错", "好用",
    "有效", "解决了", "谢谢", "明白了", "懂了",
    "perfect", "exactly", "right", "works", "got it",
    "nice", "great", "helpful",
]

# ── 标点特征 ──
EXCLAMATION_POSITIVE = re.compile(r"[！!]{2,}")     # 连续感叹号→兴奋
QUESTION_MARKS = re.compile(r"[？?]{2,}")            # 连续问号→困惑/不耐烦
ELLIPSIS = re.compile(r"[。.]{3,}|……")               # 省略号→无奈


def analyze_tone(text: str) -> dict:
    """
    分析用户回复的语气
    
    返回：
      sentiment: "frustrated" / "satisfied" / "neutral"
      intensity: 0.0 ~ 1.0
      trigger_keywords: 触发情绪的关键词列表
    """
    text_lower = text.lower()
    triggers = []

    # 检查挫败感信号
    for signal in FRUSTRATION_SIGNALS:
        if signal in text_lower:
            triggers.append(signal)

    # 检查满意信号
    for signal in SATISFACTION_SIGNALS:
        if signal in text_lower:
            triggers.append(signal)

    # 标点特征
    if EXCLAMATION_POSITIVE.search(text) and not triggers:
        # 纯感叹号没有负面词 → 可能是兴奋
        return {"sentiment": "satisfied", "intensity": 0.6, "trigger_keywords": ["!!"]}

    if QUESTION_MARKS.search(text) or ELLIPSIS.search(text):
        triggers.append("???")

    # 判断情绪方向
    frustration_count = sum(1 for s in FRUSTRATION_SIGNALS if s in text_lower)
    satisfaction_count = sum(1 for s in SATISFACTION_SIGNALS if s in text_lower)

    if frustration_count > satisfaction_count:
        intensity = min(1.0, (frustration_count - satisfaction_count) * 0.3 + 0.3)
        return {"sentiment": "frustrated", "intensity": intensity, "trigger_keywords": triggers}
    elif satisfaction_count > 0:
        intensity = min(1.0, satisfaction_count * 0.2 + 0.2)
        return {"sentiment": "satisfied", "intensity": intensity, "trigger_keywords": triggers}
    else:
        return {"sentiment": "neutral", "intensity": 0.0, "trigger_keywords": []}


class ToneFeedback:
    """语气反馈处理器"""

    def __init__(self, store: BlockStore):
        self.store = store

    def process(self, user_reply: str, recalled_blocks: list, matched_keywords: list) -> dict:
        """
        处理用户对召回结果的反馈
        
        Args:
            user_reply: 用户看到结果后的回复
            recalled_blocks: 本次召回的区块列表
            matched_keywords: 触发本次召回的关键词
            
        Returns:
            {"action": "degrade"/"upgrade"/"none", "affected_blocks": n, "detail": ...}
        """
        tone = analyze_tone(user_reply)

        if tone["sentiment"] == "neutral":
            return {"action": "none", "affected_blocks": 0, "detail": tone}

        if tone["sentiment"] == "frustrated":
            # 挫败 → 降级本次匹配的关键词
            for block in recalled_blocks:
                for kw in matched_keywords:
                    block.degrade_keyword(kw, amount=tone["intensity"] * 0.3)
            return {
                "action": "degrade",
                "affected_blocks": len(recalled_blocks),
                "detail": tone
            }

        if tone["sentiment"] == "satisfied":
            # 满意 → 升级关键词
            for block in recalled_blocks:
                for kw in matched_keywords:
                    block.upgrade_keyword(kw, amount=tone["intensity"] * 0.2)
            return {
                "action": "upgrade",
                "affected_blocks": len(recalled_blocks),
                "detail": tone
            }
