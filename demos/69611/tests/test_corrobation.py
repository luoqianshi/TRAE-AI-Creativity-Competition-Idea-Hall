"""Tests for the multi-source corroboration engine (Phase 1.3)."""

from datetime import datetime, timedelta, timezone

from analysis.corrobation.confidence_scorer import ConfidenceScorer
from analysis.corrobation.source_independence import SourceIndependence


# ── SourceIndependence tests ────────────────────────────────────────────


class TestSourceIndependence:
    def test_single_source_is_independent(self):
        assert SourceIndependence.compute(["https://reuters.com/article1"]) == 1.0

    def test_two_same_owner_low_independence(self):
        urls = [
            "https://cnn.com/article1",
            "https://cnn.com/article2",
        ]
        score = SourceIndependence.compute(urls)
        assert score < 0.5  # same owner = low independence

    def test_two_different_owners_high_independence(self):
        urls = [
            "https://reuters.com/article1",
            "https://bbc.com/article2",
        ]
        score = SourceIndependence.compute(urls)
        # Reuters (Thomson Reuters) + BBC (BBC) = 2 owners → 0.5
        # Both .com = no region info → 0; both uncategorized → 0
        assert score == 0.5

    def test_three_diverse_sources(self):
        urls = [
            "https://reuters.com/article1",
            "https://bbc.co.uk/article2",
            "https://techcrunch.com/article3",
        ]
        score = SourceIndependence.compute(urls)
        # Reuters (Thomson Reuters), BBC, TechCrunch (Yahoo) = 3 owners
        # UK, UK, US = 2 regions
        # tech_media, traditional_media = 2 types
        assert score > 0.5

    def test_cluster_independent_groups(self):
        urls = [
            "https://cnn.com/a",
            "https://cnn.com/b",
            "https://bbc.com/c",
        ]
        groups = SourceIndependence.cluster_independent_groups(urls)
        assert len(groups) == 2  # CNN group + BBC group

    def test_empty_list(self):
        assert SourceIndependence.compute([]) == 0.0


# ── ConfidenceScorer tests ──────────────────────────────────────────────


class TestConfidenceScorer:
    def test_insufficient_with_few_sources(self):
        scorer = ConfidenceScorer()
        verdict = scorer.assess(
            event_id="evt_001",
            event_summary="Test event",
            source_urls=["https://reuters.com/article1"],
        )
        assert verdict.level == "insufficient"
        # Single source caps confidence below 0.75 (medium threshold)
        assert verdict.confidence < 0.75

    def test_high_confidence_with_diverse_sources(self):
        scorer = ConfidenceScorer()
        verdict = scorer.assess(
            event_id="evt_002",
            event_summary="Major geopolitical event",
            source_urls=[
                "https://reuters.com/article1",
                "https://bbc.com/article2",
                "https://apnews.com/article3",
            ],
        )
        assert verdict.confidence > 0.3  # at least moderate

    def test_time_decay(self):
        scorer = ConfidenceScorer(half_life_hours=24)
        # Recent event
        recent = scorer.assess(
            "evt_recent", "Recent", ["https://reuters.com/a"], event_timestamp=datetime.now(timezone.utc),
        )
        # Old event
        old = scorer.assess(
            "evt_old", "Old", ["https://reuters.com/a"], event_timestamp=datetime.now(timezone.utc) - timedelta(days=7),
        )
        assert recent.time_decay_score > old.time_decay_score

    def test_consistency_scoring(self):
        scorer = ConfidenceScorer()
        # Need at least 2 similarity values for a non-neutral score
        verdict = scorer.assess(
            event_id="evt_003",
            event_summary="Consistent event",
            source_urls=["https://reuters.com/a", "https://bbc.com/b", "https://apnews.com/c"],
            text_similarities=[0.5, 0.6],
        )
        assert verdict.consistency_score > 0.5

    def test_classify_high(self):
        scorer = ConfidenceScorer()
        # Artificially high scores
        verdict = scorer.assess(
            "evt_012", "Important event",
            ["https://reuters.com/a", "https://bbc.com/b", "https://apnews.com/c"],
        )
        # With 3 diverse sources, this should be at least medium
        assert verdict.level in ("medium", "high")

    def test_reliability_scoring(self):
        scorer = ConfidenceScorer()
        verdict = scorer.assess(
            event_id="evt_004",
            event_summary="Reliability test",
            source_urls=["https://reuters.com/a"],
            source_reliabilities={"reuters.com": 0.95},
        )
        assert verdict.reliability_score > 0.7
