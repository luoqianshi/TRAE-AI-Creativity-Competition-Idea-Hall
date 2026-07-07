"""Tests for the intelligence scoring module (Phase 1.1)."""

import os
import tempfile
import yaml

from analysis.scoring.asset_scorer import AssetScorer
from analysis.scoring.indicator_registry import IndicatorRegistry, IndicatorDefinition


_SAMPLE_RULES = """
dimensions:
  economic:
    description: "Economic indicators"
    indicators:
      - id: market_cap_tier
        name: "Market cap tier"
        weight: 1.0
        entity_types: ["ORG"]
      - id: supply_chain_criticality
        name: "Supply chain criticality"
        weight: 1.5
        entity_types: ["ORG"]
  military:
    description: "Military indicators"
    indicators:
      - id: conflict_involvement
        name: "Conflict involvement"
        weight: 2.0
        entity_types: ["ORG", "LOCATION", "GPE"]
      - id: cyber_threat_activity
        name: "Cyber threat activity"
        weight: 1.0
        min_score: 0
        max_score: 10
"""


def _make_registry(yaml_str: str = _SAMPLE_RULES) -> IndicatorRegistry:
    with tempfile.NamedTemporaryFile(mode="w", suffix=".yaml", delete=False) as f:
        f.write(yaml_str)
        path = f.name
    try:
        return IndicatorRegistry(path)
    finally:
        os.unlink(path)


# ── IndicatorRegistry tests ────────────────────────────────────────────


class TestIndicatorRegistry:
    def test_loads_all_indicators(self):
        reg = _make_registry()
        all_inds = reg.list_all_indicators()
        assert len(all_inds) == 4

    def test_get_indicator_by_id(self):
        reg = _make_registry()
        ind = reg.get_indicator("market_cap_tier")
        assert ind is not None
        assert ind.id == "market_cap_tier"

    def test_get_indicators_for_entity_type(self):
        reg = _make_registry()
        org_inds = reg.get_indicators_for_entity("ORG")
        assert len(org_inds) == 4  # 3 ORG-specific + 1 wildcard (*) indicator
        loc_inds = reg.get_indicators_for_entity("LOCATION")
        assert len(loc_inds) == 2  # conflict_involvement (has LOCATION) + wildcard

    def test_get_indicators_by_dimension(self):
        reg = _make_registry()
        econ = reg.get_indicators_by_dimension("economic")
        assert len(econ) == 2
        mil = reg.get_indicators_by_dimension("military")
        assert len(mil) == 2

    def test_get_dimensions(self):
        reg = _make_registry()
        dims = reg.get_dimensions()
        assert "economic" in dims
        assert "military" in dims

    def test_reload(self):
        import tempfile
        import os
        with tempfile.NamedTemporaryFile(mode="w", suffix=".yaml", delete=False) as f:
            f.write(_SAMPLE_RULES)
            path = f.name
        try:
            reg = IndicatorRegistry(path)
            assert len(reg.list_all_indicators()) == 4
            reg.reload()
            assert len(reg.list_all_indicators()) == 4
        finally:
            os.unlink(path)

    def test_missing_file_returns_empty(self):
        reg = IndicatorRegistry("/tmp/nonexistent_rules.yaml")
        assert reg.list_all_indicators() == []


# ── AssetScorer tests ────────────────────────────────────────────────────


class TestAssetScorer:
    def test_score_single_entity_defaults(self):
        reg = _make_registry()
        scorer = AssetScorer(registry=reg)
        score = scorer.score_entity(
            entity_id="ent_001",
            entity_name="TestCorp",
            entity_type="ORG",
        )
        assert score.entity_id == "ent_001"
        assert score.entity_name == "TestCorp"
        assert 0 <= score.criticality_score <= 100
        assert 1 <= score.tier <= 5
        assert "economic" in score.dimension_scores
        assert "military" in score.dimension_scores

    def test_score_with_provided_values(self):
        reg = _make_registry()
        scorer = AssetScorer(registry=reg)
        score = scorer.score_entity(
            entity_id="ent_002",
            entity_name="BigCorp",
            entity_type="ORG",
            indicator_values={
                "market_cap_tier": 10.0,
                "supply_chain_criticality": 8.0,
                "conflict_involvement": 2.0,
                "cyber_threat_activity": 5.0,
            },
        )
        # High market cap and supply chain = high criticality
        assert score.criticality_score > 50
        assert score.dimension_scores["economic"] > 70
        assert score.reasoning is not None

    def test_low_values(self):
        reg = _make_registry()
        scorer = AssetScorer(registry=reg)
        score = scorer.score_entity(
            entity_id="ent_003",
            entity_name="SmallOrg",
            entity_type="ORG",
            indicator_values={
                "market_cap_tier": 0.0,
                "supply_chain_criticality": 0.0,
                "conflict_involvement": 0.0,
            },
        )
        assert score.criticality_score < 30
        assert score.tier >= 3

    def test_tier_thresholds(self):
        reg = _make_registry()
        scorer = AssetScorer(registry=reg)

        # Tier 1 (>= 80)
        score = scorer.score_entity(
            "ent_t1", "T1", "ORG",
            {"market_cap_tier": 10, "supply_chain_criticality": 10, "conflict_involvement": 10, "cyber_threat_activity": 10},
        )
        assert score.tier == 1

        # Tier 5 (low)
        score = scorer.score_entity(
            "ent_t5", "T5", "ORG",
            {"market_cap_tier": 0, "supply_chain_criticality": 0, "conflict_involvement": 0},
        )
        assert score.tier >= 4

    def test_batch_scoring(self):
        reg = _make_registry()
        scorer = AssetScorer(registry=reg)
        results = scorer.score_entities_batch([
            {"entity_id": "e1", "entity_name": "A", "entity_type": "ORG"},
            {"entity_id": "e2", "entity_name": "B", "entity_type": "LOCATION"},
        ])
        assert len(results) == 2
        assert results[0].entity_id == "e1"
        assert results[1].entity_id == "e2"

    def test_entity_with_no_applicable_indicators(self):
        reg = _make_registry()
        scorer = AssetScorer(registry=reg)
        score = scorer.score_entity(
            entity_id="ent_misc",
            entity_name="MiscConcept",
            entity_type="CONCEPT",
        )
        # CONCEPT is not in any entity_types list, so only wildcard if any
        assert 0 <= score.criticality_score <= 100
