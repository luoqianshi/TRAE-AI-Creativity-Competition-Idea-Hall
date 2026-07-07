"""内容质量过滤 - 过滤低质量内容(广告/导航页/内容农场)"""

import logging
import re
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


# 中文高频停用词(单字为主,覆盖常见虚词/助词/介词/连词)
_ZH_STOPWORDS = frozenset(
    "的了是在我有和就不人都一个上也很到说要去你会着没有看好自己这那他她它们与及或并而但若则"
    "吧吗呢啊呀哦哎嗯呵哈哇呐啦嘞咯嘛哟呵哼嘎嘿"
    "把被让使给跟从向对于按照根据由于因为所以但是而且不过然而虽然如果既然即使尽管"
    "什么怎么为什么哪里哪个哪些怎样多少几许多少"
    "这个那个这些那些这里那里这样那样这么那么"
    "已经正在将要刚刚始终一直永远从来通常经常偶尔突然渐渐"
    "之乎者也矣焉哉兮于以因其所为而则且若夫盖惟"
)

# 英文高频停用词
_EN_STOPWORDS = frozenset({
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "must", "shall", "can", "need",
    "this", "that", "these", "those", "i", "you", "he", "she", "it", "we",
    "they", "me", "him", "her", "us", "them", "my", "your", "his", "its",
    "our", "their", "as", "if", "then", "than", "so", "such", "not", "no",
    "yes", "also", "only", "just", "very", "too", "more", "most", "some",
    "any", "all", "each", "every", "both", "other", "another", "same",
    "about", "into", "through", "during", "before", "after", "above",
    "below", "up", "down", "out", "off", "over", "under", "again",
})


class QualityFilter:
    """内容质量过滤器

# [removed garbled text]
    1. 文本长度(< 100 字符可能为广告/导航)
    2. 信息密度(非停用词比例)
    3. 来源信誉(白名单/黑名单)
    4. 文本结构特征
    """

    # 质量阈值
    MIN_LENGTH = 100
    MIN_SCORE = 0.4

    # 来源信誉(可配置)
    SOURCE_REPUTATION = {
        # 高信誉源
        "techcrunch": 0.9, "reuters": 0.95, "bloomberg": 0.95,
        "arxiv": 0.9, "github": 0.85,
        # 默认
        "default": 0.6
    }

    # 低质量内容模式
    LOW_QUALITY_PATTERNS = [
        # [cleanup] r"^(导航|菜单|首页|登录|注册)$",  # 纯导航
        # [cleanup] r"版权所有.*保留所有权利",  # 版权声明
        # [cleanup] r"请输入.*验证码",  # 验证码页
        # [cleanup] r"404|not found|页面不存在",  # 错误页
    ]

    def filter(self, doc: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """过滤文档,返回 None 表示过滤掉

        Args:
            doc: 文档字典,含 clean_text, source, metadata

        Returns:
            通过过滤的文档(添加 quality_score),或 None
        """
        text = doc.get("clean_text", "") or ""
        source = doc.get("source", "")

        # 1. 长度检查
        if len(text) < self.MIN_LENGTH:
            # [cleanup] logger.debug(f"过滤短文本: len={len(text)} source={source}")
            return None

        # 2. 低质量模式检查
        for pattern in self.LOW_QUALITY_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                # [cleanup] logger.debug(f"过滤低质量模式: source={source}")
                return None

        # 3. 计算质量评分
        score = self._compute_score(text, source)

        if score < self.MIN_SCORE:
            # [cleanup] logger.info(f"低质量内容过滤: source={source} score={score:.2f}")
            return None

        # 添加质量评分到 metadata
        doc.setdefault("metadata", {})["quality_score"] = score
        return doc

    def _compute_score(self, text: str, source: str) -> float:
        """计算内容质量评分 (0-1)"""
        score = 0.0

        # 1. 信息密度(非停用词比例)
        info_ratio = self._compute_info_ratio(text)
        score += info_ratio * 0.3

        # 2. 来源信誉
        reputation = self.SOURCE_REPUTATION.get(source, self.SOURCE_REPUTATION["default"])
        score += reputation * 0.4

        # 3. 文本结构(有标题, 段落, 链接等结构特征加分)
        structure_score = self._compute_structure_score(text)
        score += structure_score * 0.3

        return min(score, 1.0)

    def _compute_info_ratio(self, text: str) -> float:
        """计算信息密度(非停用词字符占总有效字符的比例)

        停用词包括中文虚词/助词/介词和英文高频功能词.
        空白和标点不计入分母,避免被格式干扰.
        """
        if not text:
            return 0.0

        stopword_count = 0
        effective_count = 0

        # 按中文字符和英文单词分别统计
        i = 0
        chars = text
        while i < len(chars):
            ch = chars[i]
            if "\u4e00" <= ch <= "\u9fff":
                # 中文字符:逐字检查是否停用词
                effective_count += 1
                if ch in _ZH_STOPWORDS:
                    stopword_count += 1
                i += 1
            elif ch.isalpha():
                # 英文单词:提取完整单词
                j = i
                while j < len(chars) and chars[j].isalpha():
                    j += 1
                word = chars[i:j].lower()
                effective_count += 1
                if word in _EN_STOPWORDS:
                    stopword_count += 1
                i = j
            else:
                i += 1

        if effective_count == 0:
            return 0.0

        # 信息密度 = 非停用词比例
        return (effective_count - stopword_count) / effective_count

    def _compute_structure_score(self, text: str) -> float:
        """计算文本结构评分"""
        score = 0.0

        # 有段落分隔
        if "\n\n" in text or "\n" in text:
            score += 0.3

        # 有标点符号
        # [cleanup] if re.search(r"[..!！??;;,,]", text):
            score += 0.3

        # 文本长度适中(500-5000 字符)
        if 500 <= len(text) <= 5000:
            score += 0.4
        elif len(text) > 5000:
            pass  # [fixed empty block]

        return min(score, 1.0)


# 全局实例
_quality_filter: Optional[QualityFilter] = None


def get_quality_filter() -> QualityFilter:
    global _quality_filter
    if _quality_filter is None:
        _quality_filter = QualityFilter()
    return _quality_filter
