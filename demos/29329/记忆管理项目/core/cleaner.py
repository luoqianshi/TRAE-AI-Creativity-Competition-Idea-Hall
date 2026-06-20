"""
数据清洗管道 — 召回结果的后处理
比喻：图书管理员把找到的书掸灰、排序、去重后再递给读者

清洗流程：
  1. 去重（同内容不同路径命中）
  2. 去矛盾（时间戳优先）
  3. 边界感知拼接（同一项目+同一domain的碎片合并）
  4. 语气过滤（已被挫败标记的关联路径直接拦截）
"""
import time
from collections import defaultdict
from typing import List, Tuple
from .block import Block


class CleaningPipeline:
    """召回后数据清洗"""

    def clean(
        self,
        candidates: List[Tuple[Block, float]],
        tone_filter_keywords: list = None,
    ) -> List[Tuple[Block, float]]:
        """
        完整清洗流程
        """
        if not candidates:
            return []

        # 1. 去重：同一block_id只保留最高分
        deduped = {}
        for block, score in candidates:
            if block.block_id not in deduped or score > deduped[block.block_id][1]:
                deduped[block.block_id] = (block, score)

        # 2. 语气过滤：被挫败标记过的关联路径直接拦截
        if tone_filter_keywords:
            filtered = {}
            for bid, (block, score) in deduped.items():
                # 检查block是否有被重度降级的关键词
                if any(
                    kw in block.degraded_keywords
                    and block.degraded_keywords[kw] < 0.3
                    for kw in tone_filter_keywords
                ):
                    continue  # 这个关键词被用户挫败标记过，跳过
                filtered[bid] = (block, score)
            deduped = filtered

        result = list(deduped.values())
        result.sort(key=lambda x: -x[1])
        return result

    def merge_for_output(self, clean_results: List[Tuple[Block, float]]) -> str:
        """
        将清洗后的多条结果拼接为一段输出文本。
        
        拼接规则：
          - 同一 project + domain 的碎片拼在一起
          - 不同 project/domain 的分段隔开
          - 每条前附标题和来源标记
        """
        if not clean_results:
            return ""

        # 按 project + domain 分组
        groups = defaultdict(list)
        for block, score in clean_results:
            key = f"{block.project}/{block.domain}"
            groups[key].append((block, score))

        segments = []
        for key, items in groups.items():
            blocks = [b for b, _ in sorted(items, key=lambda x: -x[1])]

            # 同一组内按时间排序去矛盾
            blocks.sort(key=lambda b: -b.created_at)

            parts = []
            for b in blocks:
                title = b.title or "(无标题)"
                content = b.summary or b.content[:100]
                parts.append(f"[{title}] {content}")

            segment = "\n".join(parts)
            segments.append(f"── {key} ──\n{segment}")

        return "\n\n".join(segments)
