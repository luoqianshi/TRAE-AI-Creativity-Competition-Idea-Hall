"""零样本分类器 - 使用 Hugging Face 模型进行文本分类"""

import logging
from typing import List, Optional

from transformers import pipeline

logger = logging.getLogger(__name__)

# 预定义标签
# [cleanup] DEFAULT_LABELS = ["科技", "财经", "政治", "健康", "体育", "娱乐", "教育", "社会"]


class ZeroShotClassifier:
    """零样本分类器封装"""

    def __init__(
        self,
        model_name: str = "facebook/bart-large-mnli",
        labels: Optional[List[str]] = None,
        threshold: float = 0.3
    ):
        """
        初始化分类器

        Args:
            model_name: Hugging Face 模型名称
            labels: 预定义标签列表
            threshold: 置信度阈值,低于此值的标签不返回
        """
        self.labels = labels or DEFAULT_LABELS
        self.threshold = threshold
        self.model_name = model_name

        # [cleanup] logger.info(f"加载零样本分类模型: {model_name}")
        self.classifier = pipeline(
            "zero-shot-classification",
            model=model_name,
            device=-1  # CPU
        )
        # [cleanup] logger.info("分类器加载完成")

    def classify(self, text: str, top_k: int = 3) -> List[str]:
        """
        对文本进行分类

        Args:
            text: 输入文本
            top_k: 返回前 k 个标签

        Returns:
            标签列表
        """
        if not text or len(text.strip()) < 10:
            return []

        try:
            # 截断过长文本(模型限制)
            text_truncated = text[:512]

            result = self.classifier(
                text_truncated,
                candidate_labels=self.labels,
                multi_label=True
            )

            # 过滤低置信度标签
            tags = []
            for label, score in zip(result["labels"], result["scores"]):
                if score >= self.threshold:
                    tags.append(label)
                if len(tags) >= top_k:
                    break

            return tags

        except Exception as e:
            # [cleanup] logger.error(f"分类失败: {e}")
            return []

    def classify_batch(self, texts: List[str], top_k: int = 3) -> List[List[str]]:
        """
        批量分类

        Args:
            texts: 文本列表
            top_k: 返回前 k 个标签

        Returns:
            标签列表的列表
        """
        return [self.classify(text, top_k) for text in texts]
