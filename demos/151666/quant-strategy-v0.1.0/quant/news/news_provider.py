"""新闻数据接入层

- NYTNewsProvider: 纽约时报 Article Search API
- MockNewsProvider: 模拟新闻生成器（无 API 时验证用）
"""
from __future__ import annotations
import random
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Iterable

import pandas as pd

from .sentiment import SentimentScore, FinancialSentimentAnalyzer

logger = logging.getLogger(__name__)


@dataclass
class NewsArticle:
    """新闻文章"""
    title: str
    summary: str = ""
    source: str = ""
    url: str = ""
    published_at: datetime = None  # type: ignore
    sentiment: SentimentScore | None = None
    symbol: str = ""

    @property
    def text(self) -> str:
        return f"{self.title} {self.summary}"


class NewsProvider(ABC):
    """新闻数据提供者基类"""

    @abstractmethod
    def get_news(
        self,
        symbol: str,
        start_date: str,
        end_date: str,
        max_articles: int = 100,
    ) -> list[NewsArticle]:
        """获取指定时间范围内的新闻"""


# ============================================================
# 纽约时报 API
# ============================================================

class NYTNewsProvider(NewsProvider):
    """纽约时报 Article Search API

    需要 NYT API Key: https://developer.nytimes.com/
    """

    def __init__(self, api_key: str = ""):
        self.api_key = api_key
        self.analyzer = FinancialSentimentAnalyzer()

    def get_news(
        self,
        symbol: str,
        start_date: str,
        end_date: str,
        max_articles: int = 100,
    ) -> list[NewsArticle]:
        if not self.api_key:
            raise RuntimeError("NYT API Key 未配置")

        try:
            import urllib.request
            import urllib.parse
            import json

            query = urllib.parse.quote(symbol)
            begin = start_date.replace("-", "")
            end = end_date.replace("-", "")
            url = (
                f"https://api.nytimes.com/svc/search/v2/articlesearch.json"
                f"?q={query}&begin_date={begin}&end_date={end}"
                f"&api-key={self.api_key}&sort=newest"
            )

            articles: list[NewsArticle] = []
            page = 0
            while len(articles) < max_articles and page < 10:
                page_url = f"{url}&page={page}"
                with urllib.request.urlopen(page_url, timeout=10) as resp:
                    data = json.loads(resp.read().decode("utf-8"))

                docs = data.get("response", {}).get("docs", [])
                if not docs:
                    break

                for doc in docs:
                    pub_date = doc.get("pub_date", "")
                    try:
                        pub_dt = datetime.fromisoformat(pub_date.replace("Z", "+00:00")).replace(tzinfo=None)
                    except Exception:
                        pub_dt = datetime.now()

                    headline = doc.get("headline", {}).get("main", "")
                    snippet = doc.get("snippet", "")
                    article = NewsArticle(
                        title=headline,
                        summary=snippet,
                        source="New York Times",
                        url=doc.get("web_url", ""),
                        published_at=pub_dt,
                        symbol=symbol,
                    )
                    article.sentiment = self.analyzer.analyze(article.text)
                    articles.append(article)
                    if len(articles) >= max_articles:
                        break
                page += 1

            logger.info(f"NYT 获取 {symbol} 新闻 {len(articles)} 篇")
            return articles

        except Exception as e:
            logger.error(f"NYT API 请求失败: {e}")
            raise


# ============================================================
# 模拟新闻生成器
# ============================================================

_POSITIVE_TEMPLATES = [
    "{company} reports record quarterly earnings, beating analyst estimates",
    "{company} announces major partnership that will boost revenue growth",
    "{company} stock surges after strong earnings report",
    "{company} upgrades its full-year guidance citing strong demand",
    "Wall Street bullish on {company} as profit margins expand",
    "{company} launches innovative new product line to drive growth",
    "{company} acquisition to accelerate market expansion strategy",
    "{company} revenue growth exceeds expectations, shares rally",
    "{company} secures major contract, outlook improves significantly",
    "Analysts upgrade {company} stock, citing strong fundamentals",
]

_NEGATIVE_TEMPLATES = [
    "{company} misses earnings estimates, stock plunges",
    "{company} cuts guidance amid slowing demand concerns",
    "{company} shares tumble after disappointing quarterly results",
    "Regulatory investigation launched into {company} practices",
    "{company} faces lawsuit over alleged financial misconduct",
    "Wall Street bearish on {company} as competition intensifies",
    "{company} CEO resigns unexpectedly, shares drop sharply",
    "{company} recalls major product line over safety concerns",
    "{company} downgraded by analysts, profit warnings issued",
    "Market loses confidence in {company} amid management turmoil",
]

_NEUTRAL_TEMPLATES = [
    "{company} holds annual shareholder meeting today",
    "{company} announces leadership restructuring plan",
    "{company} to release quarterly earnings next week",
    "{company} expands into new geographic market",
    "Industry analysts review {company} strategic position",
    "{company} board approves new capital allocation plan",
    "{company} participates in major industry conference",
    "{company} updates investors on long-term strategy",
    "Market analysts maintain neutral stance on {company}",
    "{company} appoints new CFO amid reorganization",
]


class MockNewsProvider(NewsProvider):
    """模拟新闻生成器 - 基于价格走势生成新闻（用于验证）

    新闻情感与价格走势正相关：
    - 上涨日：更多正面新闻
    - 下跌日：更多负面新闻
    - 震荡日：中性新闻为主
    """

    def __init__(self, company_name: str | None = None, seed: int = 42):
        self.company_name = company_name or "Company"
        self.seed = seed
        self.analyzer = FinancialSentimentAnalyzer(use_vader=False)

    def get_news(
        self,
        symbol: str,
        start_date: str,
        end_date: str,
        max_articles: int = 100,
        price_series: pd.Series | None = None,
    ) -> list[NewsArticle]:
        """生成模拟新闻

        Args:
            price_series: 收盘价序列（index为日期），用于使新闻与价格走势相关
        """
        rng = random.Random(self.seed)
        company = self.company_name or symbol
        articles: list[NewsArticle] = []

        start = pd.to_datetime(start_date)
        end = pd.to_datetime(end_date)

        if price_series is not None:
            # 基于真实价格走势生成相关新闻
            daily_returns = price_series.pct_change().fillna(0)
            for date, ret in daily_returns.items():
                if date < start or date > end:
                    continue
                date_dt = date.to_pydatetime() if hasattr(date, "to_pydatetime") else pd.Timestamp(date).to_pydatetime()
                n_articles = rng.randint(0, 4)
                for _ in range(n_articles):
                    # 根据涨跌决定新闻倾向
                    if ret > 0.01:
                        templates = _POSITIVE_TEMPLATES
                    elif ret < -0.01:
                        templates = _NEGATIVE_TEMPLATES
                    else:
                        templates = _NEUTRAL_TEMPLATES

                    # 加一点随机性
                    if rng.random() < 0.2:
                        templates = (
                            _POSITIVE_TEMPLATES if rng.random() < 0.5 else _NEGATIVE_TEMPLATES
                        )

                    title = rng.choice(templates).format(company=company)
                    pub_dt = date_dt + timedelta(
                        hours=rng.randint(8, 20),
                        minutes=rng.randint(0, 59),
                    )
                    article = NewsArticle(
                        title=title,
                        summary=f"Detailed report on {company} market developments.",
                        source="MockNews",
                        published_at=pub_dt,
                        symbol=symbol,
                    )
                    article.sentiment = self.analyzer.analyze(title)
                    articles.append(article)
        else:
            # 无价格序列时随机生成
            current = start
            while current <= end:
                if current.weekday() < 5:
                    n_articles = rng.randint(1, 3)
                    for _ in range(n_articles):
                        t = rng.choice(_POSITIVE_TEMPLATES + _NEGATIVE_TEMPLATES + _NEUTRAL_TEMPLATES)
                        title = t.format(company=company)
                        pub_dt = datetime.combine(current, datetime.min.time())
                        pub_dt = pub_dt + timedelta(hours=rng.randint(8, 20), minutes=rng.randint(0, 59))
                        article = NewsArticle(
                            title=title,
                            summary=f"News update regarding {company}.",
                            source="MockNews",
                            published_at=pub_dt,
                            symbol=symbol,
                        )
                        article.sentiment = self.analyzer.analyze(title)
                        articles.append(article)
                current += timedelta(days=1)

        articles.sort(key=lambda a: a.published_at)
        articles = articles[:max_articles]
        logger.info(f"生成 {symbol} 模拟新闻 {len(articles)} 篇 [{start_date} ~ {end_date}]")
        return articles
