"""情感分析模块

优先使用 nltk VADER（社交媒体文本效果好），
未安装时使用金融领域词典的简单实现作为降级。
"""
from __future__ import annotations
import re
from dataclasses import dataclass


# ============================================================
# 金融情感词典（Loughran-McDonald 风格的精简版）
# ============================================================

_POSITIVE_WORDS = {
    # 正面收益/增长
    "growth", "gain", "gains", "profit", "profits", "profitable", "earnings",
    "beat", "beats", "exceed", "exceeds", "exceeded", "surpass", "rise", "rises",
    "rose", "rising", "rally", "rallies", "rallied", "soar", "soars", "soared",
    "surge", "surged", "jump", "jumps", "jumped", "boost", "boosts", "boosted",
    "improve", "improves", "improved", "improvement", "strong", "stronger",
    "record", "outperform", "outperforms", "outperformed", "upside",
    "bullish", "recovery", "recover", "recovers", "recovered",
    "upgrade", "upgrades", "upgraded", "buy", "buys", "positive",
    "success", "successful", "expand", "expands", "expanded", "expansion",
    "acquisition", "merger", "deal", "partnership", "launch", "innovation",
    # 中文金融正面词
    "上涨", "增长", "利好", "盈利", "利润", "超预期", "创新高", "反弹",
    "突破", "增持", "买入", "看好", "牛市", "复苏", "业绩好", "增长强劲",
    "净利润", "营收增长", "高增长", "优质", "龙头", "景气", "上升通道",
}

_NEGATIVE_WORDS = {
    # 负面收益/下跌
    "loss", "losses", "miss", "misses", "missed", "decline", "declines",
    "declined", "fall", "falls", "fell", "falling", "drop", "drops", "dropped",
    "plunge", "plunges", "plunged", "tumble", "tumbles", "tumbled",
    "crash", "crashes", "crashed", "slump", "slumps", "slumped",
    "dip", "dips", "dipped", "weak", "weaker", "weakness", "downside",
    "bearish", "selloff", "sell-off", "sell", "sells", "sold", "negative",
    "downgrade", "downgrades", "downgraded", "underperform", "underperforms",
    "underperformed", "warn", "warns", "warned", "warning", "cut", "cuts",
    "cutting", "lower", "reduce", "reduces", "reduced", "reduction",
    "bankruptcy", "bankrupt", "default", "lawsuit", "investigation",
    "fraud", "scandal", "recall", "disappointing", "disappoint", "disappoints",
    "misses estimates", "below expectations", "guidance lowered",
    # 中文金融负面词
    "下跌", "亏损", "利空", "暴跌", "跳水", "下滑", "下降", "低于预期",
    "减持", "卖出", "看空", "熊市", "崩盘", "爆雷", "财务造假", "处罚",
    "调查", "诉讼", "违约", "退市", "风险", "警告", "下调", "减仓",
    "暴跌", "闪崩", "套牢", "割肉", "止损", "业绩下滑", "利润下滑",
}

# 强度修饰词
_INTENSIFIERS = {
    "very": 1.5, "extremely": 1.8, "highly": 1.6, "significantly": 1.6,
    "dramatically": 1.7, "sharply": 1.6, "steeply": 1.5, "strongly": 1.5,
    "massive": 1.8, "huge": 1.6, "big": 1.3, "major": 1.5, "serious": 1.5,
}

# 否定词（翻转情感）
_NEGATIONS = {
    "not", "no", "never", "neither", "nor", "barely", "hardly", "rarely",
    "seldom", "despite", "although", "however", "but", "yet", "still",
    "不", "没", "没有", "非", "未", "无", "反",
}


@dataclass
class SentimentScore:
    """情感分数"""
    compound: float       # 综合分数 [-1, 1]
    positive: float
    negative: float
    neutral: float
    matched_words: list[str]

    @property
    def label(self) -> str:
        if self.compound >= 0.2:
            return "positive"
        elif self.compound <= -0.2:
            return "negative"
        return "neutral"


class SentimentAnalyzer:
    """情感分析器

    优先使用 VADER，否则使用词典法。
    """

    def __init__(self, use_vader: bool = True):
        self._vader = None
        self._use_vader = use_vader
        if use_vader:
            try:
                from nltk.sentiment import SentimentIntensityAnalyzer
                import nltk
                try:
                    nltk.data.find("sentiment/vader_lexicon.zip")
                except LookupError:
                    try:
                        nltk.download("vader_lexicon", quiet=True)
                    except Exception:
                        pass
                self._vader = SentimentIntensityAnalyzer()
            except ImportError:
                self._vader = None

    def analyze(self, text: str) -> SentimentScore:
        """分析文本情感"""
        if self._vader is not None:
            scores = self._vader.polarity_scores(text)
            return SentimentScore(
                compound=scores["compound"],
                positive=scores["pos"],
                negative=scores["neg"],
                neutral=scores["neu"],
                matched_words=[],
            )
        return self._lexicon_analyze(text)

    def _lexicon_analyze(self, text: str) -> SentimentScore:
        """金融词典法情感分析（降级方案）"""
        if not text:
            return SentimentScore(0.0, 0.0, 0.0, 1.0, [])

        words = re.findall(r"[A-Za-z']+|[\u4e00-\u9fa5]+", text.lower())
        pos_count = 0
        neg_count = 0
        matched: list[str] = []
        total_words = max(len(words), 1)

        i = 0
        while i < len(words):
            word = words[i]
            multiplier = 1.0

            # 检查前一个词是否是否定词或强度词
            if i > 0:
                prev = words[i - 1]
                if prev in _NEGATIONS:
                    multiplier *= -0.8
                if prev in _INTENSIFIERS:
                    multiplier *= _INTENSIFIERS[prev]

            # 检查前两个词的强度修饰
            if i > 1 and words[i - 2] in _INTENSIFIERS:
                multiplier *= _INTENSIFIERS[words[i - 2]]

            if word in _POSITIVE_WORDS:
                pos_count += multiplier
                matched.append(f"+{word}")
            elif word in _NEGATIVE_WORDS:
                neg_count += abs(multiplier)
                matched.append(f"-{word}")

            i += 1

        pos_score = pos_count / total_words
        neg_score = neg_count / total_words

        # 压缩到 [0, 1] 范围
        pos_score = min(pos_score, 1.0)
        neg_score = min(neg_score, 1.0)
        neu_score = max(0, 1.0 - pos_score - neg_score)

        # 综合分数 [-1, 1]
        total = pos_score + neg_score
        if total == 0:
            compound = 0.0
        else:
            compound = (pos_score - neg_score) / max(total, 0.1)
            compound = max(-1.0, min(1.0, compound))

        return SentimentScore(
            compound=round(compound, 4),
            positive=round(pos_score, 4),
            negative=round(neg_score, 4),
            neutral=round(neu_score, 4),
            matched_words=matched[:20],
        )


class FinancialSentimentAnalyzer(SentimentAnalyzer):
    """金融领域增强的情感分析器

    在 VADER 或词典法基础上，叠加金融关键词权重加成。
    """

    FINANCIAL_CONTEXT_WORDS = {
        "stock", "shares", "market", "earnings", "revenue", "profit",
        "股价", "股票", "市场", "业绩", "营收", "利润", "财报", "年报",
        "季报", "业绩预告", "分红", "回购",
    }

    def __init__(self, use_vader: bool = True):
        super().__init__(use_vader=use_vader)

    def analyze(self, text: str) -> SentimentScore:
        score = super().analyze(text)

        # 如果文本含金融关键词，放大情感强度（更确定）
        text_lower = text.lower()
        has_financial = any(w in text_lower for w in self.FINANCIAL_CONTEXT_WORDS)
        if has_financial and abs(score.compound) > 0:
            amplified = score.compound * 1.3
            amplified = max(-1.0, min(1.0, amplified))
            score = SentimentScore(
                compound=round(amplified, 4),
                positive=score.positive,
                negative=score.negative,
                neutral=score.neutral,
                matched_words=score.matched_words,
            )
        return score
