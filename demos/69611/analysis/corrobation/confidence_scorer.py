"""Confidence scoring engine — assesses how reliable an event or claim is
based on multi-source corroboration.

Combines:
- Number of independent sources
- Source independence (organizational, geographic, media-type diversity)
- Source historical reliability
- Time decay (news freshness)
- Content consistency across sources

Reference: WorldMonitor CrossSourceSignalsPanel multi-stream correlation logic.
"""

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from .source_independence import SourceIndependence

logger = logging.getLogger(__name__)

# Default half-life for time decay (36 hours)
_DEFAULT_HALF_LIFE_HOURS = 36.0

# Minimum sources needed for medium confidence
_MIN_SOURCES_MEDIUM = 2
_MIN_SOURCES_HIGH = 3


@dataclass
class SourceVerdict:
    """Confidence assessment for a single event or claim."""

    event_id: str
    event_summary: str

    # Composite confidence (0.0 - 1.0)
    confidence: float

    # Factor breakdown
    source_count_score: float  # how many sources
    independence_score: float  # how independent they are
    reliability_score: float  # historical reliability of sources
    time_decay_score: float  # how recent
    consistency_score: float  # how consistent across sources

    # Categorized verdict
    level: str  # "high", "medium", "low", "insufficient"

    reasoning: List[str] = field(default_factory=list)


class ConfidenceScorer:
    """Assess event confidence by multi-source corroboration."""

    def __init__(self, half_life_hours: float = _DEFAULT_HALF_LIFE_HOURS):
        self._half_life_hours = half_life_hours
        self._source_independence = SourceIndependence()

    # --- public API -----------------------------------------------------------

    def assess(
        self,
        event_id: str,
        event_summary: str,
        source_urls: List[str],
        source_reliabilities: Optional[Dict[str, float]] = None,
        event_timestamp: Optional[datetime] = None,
        text_similarities: Optional[List[float]] = None,
    ) -> SourceVerdict:
        """Full confidence assessment for an event.

        Args:
            event_id: Unique event identifier.
            event_summary: Short LLM-generated event summary.
            source_urls: URLs of documents reporting this event.
            source_reliabilities: Optional per-domain reliability (0-1).
                                 Derived from source_count in knowledge base
                                 if not provided.
            event_timestamp: Event occurrence time (defaults to now).
            text_similarities: Pairwise text similarity scores between sources.
                               If provided, the mean is used for consistency.

        Returns:
            SourceVerdict with composite confidence and factor breakdown.
        """
        n = len(source_urls)
        source_reliabilities = source_reliabilities or {}

        # 1 — Source count score
        source_count_score = self._score_source_count(n)

        # 2 — Independence score
        independence_score = self._source_independence.compute(source_urls)

        # 3 — Reliability score
        reliability_score = self._score_reliability(
            source_urls, source_reliabilities
        )

        # 4 — Time decay
        ts = event_timestamp or datetime.now(timezone.utc)
        time_decay_score = self._score_time_decay(ts)

        # 5 — Consistency
        consistency_score = self._score_consistency(text_similarities)

        # Weighted composite
        confidence = round(
            source_count_score * 0.25
            + independence_score * 0.30
            + reliability_score * 0.15
            + time_decay_score * 0.15
            + consistency_score * 0.15,
            3,
        )

        level = self._classify(confidence, n)

        reasoning = self._build_reasoning(
            event_summary, n, confidence, level,
            source_count_score, independence_score,
            reliability_score, time_decay_score, consistency_score,
        )

        return SourceVerdict(
            event_id=event_id,
            event_summary=event_summary,
            confidence=confidence,
            source_count_score=round(source_count_score, 3),
            independence_score=round(independence_score, 3),
            reliability_score=round(reliability_score, 3),
            time_decay_score=round(time_decay_score, 3),
            consistency_score=round(consistency_score, 3),
            level=level,
            reasoning=reasoning,
        )

    # --- factor scorers ------------------------------------------------------

    @staticmethod
    def _score_source_count(n: int) -> float:
        """Logarithmic scoring: 1 source=0.3, 2=0.5, 3=0.7, 5+=0.95."""
        if n <= 0:
            return 0.0
        if n == 1:
            return 0.3
        return min(0.95, 0.3 + 0.25 * (n - 1))

    @staticmethod
    def _score_reliability(
        urls: List[str],
        reliabilities: Dict[str, float],
        default: float = 0.6,
    ) -> float:
        """Average reliability of all source domains involved."""
        if not urls:
            return 0.0
        import re

        scores = []
        for url in urls:
            m = re.search(r"https?://([^:/]+)", url.lower())
            domain = m.group(1) if m else url
            scores.append(reliabilities.get(domain, default))
        return sum(scores) / len(scores)

    def _score_time_decay(self, event_time: datetime) -> float:
        """Exponential decay: half-life = configured hours."""
        now = datetime.now(timezone.utc)
        delta_hours = (now - event_time).total_seconds() / 3600
        if delta_hours <= 0:
            return 1.0
        return 2.0 ** (-delta_hours / self._half_life_hours)

    @staticmethod
    def _score_consistency(similarities: Optional[List[float]]) -> float:
        """Higher similarity = higher consistency (but very high suggests copy)."""
        if not similarities or len(similarities) < 2:
            return 0.5  # neutral with insufficient data
        mean_sim = sum(similarities) / len(similarities)
        # Ideal range 0.4-0.7 (similar but not identical)
        if 0.4 <= mean_sim <= 0.7:
            return 1.0
        if mean_sim < 0.2:
            return 0.3
        if mean_sim > 0.9:
            return 0.4  # suspiciously similar
        return 0.7

    @staticmethod
    def _classify(confidence: float, source_count: int) -> str:
        if source_count < _MIN_SOURCES_MEDIUM:
            return "insufficient"
        if confidence >= 0.75 and source_count >= _MIN_SOURCES_HIGH:
            return "high"
        if confidence >= 0.5:
            return "medium"
        return "low"

    @staticmethod
    def _build_reasoning(
        summary: str,
        n: int,
        confidence: float,
        level: str,
        source_count_score: float,
        independence_score: float,
        reliability_score: float,
        time_decay_score: float,
        consistency_score: float,
    ) -> List[str]:
        return [
            f"Event: {summary[:80]}",
            f"Confidence: {confidence:.2f} ({level}) across {n} sources",
            f"  Source count:  {source_count_score:.2f}",
            f"  Independence:  {independence_score:.2f}",
            f"  Reliability:   {reliability_score:.2f}",
            f"  Time decay:    {time_decay_score:.2f}",
            f"  Consistency:   {consistency_score:.2f}",
        ]
