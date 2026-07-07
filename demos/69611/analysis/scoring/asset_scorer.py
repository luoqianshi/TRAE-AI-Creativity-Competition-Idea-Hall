"""Multi-factor asset scoring engine.

Computes criticality and risk scores for entities by aggregating weighted
indicator values across multiple intelligence dimensions (military, economic,
social, political, infrastructure).

Inspired by WorldMonitor CII v8 (Country Instability Index) multi-dimensional
stress scoring model.
"""

import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from .indicator_registry import IndicatorDefinition, IndicatorRegistry

logger = logging.getLogger(__name__)


@dataclass
class EntityScore:
    """Computed score for a single entity."""

    entity_id: str
    entity_name: str
    entity_type: str

    # Composite scores
    criticality_score: float  # 0-100: how critical is this entity
    risk_score: float  # 0-100: current risk level
    tier: int  # 1 (highest) to 5 (lowest)

    # Per-dimension breakdown
    dimension_scores: Dict[str, float] = field(default_factory=dict)

    # Individual indicator values
    indicator_values: Dict[str, float] = field(default_factory=dict)

    # Explanation / trace
    reasoning: List[str] = field(default_factory=list)


class AssetScorer:
    """Weighted multi-factor scoring engine for intelligence entities.

    Usage:

        scorer = AssetScorer()
        score = scorer.score_entity(
            entity_id="ent_abc123",
            entity_name="OpenAI",
            entity_type="ORG",
            indicator_values={...},
        )
        print(score.criticality_score, score.tier)
    """

    # Tier thresholds (criticality_score lower bound)
    TIER_THRESHOLDS = [80, 60, 40, 20, 0]

    def __init__(self, registry: Optional[IndicatorRegistry] = None):
        self._registry = registry or IndicatorRegistry()

    # --- public API -----------------------------------------------------------

    def score_entity(
        self,
        entity_id: str,
        entity_name: str,
        entity_type: str,
        indicator_values: Optional[Dict[str, float]] = None,
    ) -> EntityScore:
        """Compute a full score for a single entity.

        Args:
            entity_id: Neo4j entity identifier.
            entity_name: Display name.
            entity_type: Entity type (ORG, PERSON, LOCATION, etc.).
            indicator_values: Pre-computed values for each indicator id.
                             Omitted indicators use their default value.

        Returns:
            EntityScore with composite scores and dimensional breakdown.
        """
        indicator_values = indicator_values or {}
        applicable = self._registry.get_indicators_for_entity(entity_type)

        # --- compute per-indicator scores -----------------------------------
        per_indicator: Dict[str, float] = {}
        for ind in applicable:
            raw = indicator_values.get(ind.id, ind.default_value)
            clamped = max(ind.min_score, min(ind.max_score, raw))
            # Normalize to 0-1 within the indicator's range
            if ind.max_score > ind.min_score:
                normalized = (clamped - ind.min_score) / (ind.max_score - ind.min_score)
            else:
                normalized = 0.0
            per_indicator[ind.id] = normalized

        # --- aggregate by dimension ------------------------------------------
        dim_scores: Dict[str, float] = {}
        for dim_name in self._registry.get_dimensions():
            dim_indicators = self._registry.get_indicators_by_dimension(dim_name)
            if not dim_indicators:
                dim_scores[dim_name] = 0.0
                continue
            total_weight = sum(ind.weight for ind in dim_indicators)
            if total_weight == 0:
                dim_scores[dim_name] = 0.0
                continue
            weighted = sum(
                per_indicator.get(ind.id, ind.default_value) * ind.weight
                for ind in dim_indicators
            )
            dim_scores[dim_name] = round((weighted / total_weight) * 100, 1)

        # --- composite scores ------------------------------------------------
        all_weights_applicable = [ind for ind in applicable if ind.weight > 0]
        total_weight_all = sum(ind.weight for ind in all_weights_applicable)
        if total_weight_all == 0:
            criticality = 0.0
        else:
            weighted_sum = sum(
                per_indicator.get(ind.id, ind.default_value) * ind.weight
                for ind in all_weights_applicable
            )
            criticality = round((weighted_sum / total_weight_all) * 100, 1)

        # risk_score blends criticality with recent event signals (placeholder
        # for Phase 1.3 confidence integration)
        risk_score = criticality  # will be refined when corrobation is live

        tier = self._criticality_to_tier(criticality)

        reasoning = self._build_reasoning(
            entity_name, entity_type, criticality, tier, dim_scores, per_indicator
        )

        return EntityScore(
            entity_id=entity_id,
            entity_name=entity_name,
            entity_type=entity_type,
            criticality_score=criticality,
            risk_score=risk_score,
            tier=tier,
            dimension_scores=dim_scores,
            indicator_values={
                k: round(v, 4) for k, v in per_indicator.items()
            },
            reasoning=reasoning,
        )

    def score_entities_batch(
        self,
        entities: List[Dict[str, Any]],
    ) -> List[EntityScore]:
        """Score multiple entities in batch.

        Each dict in *entities* should contain at minimum:
            entity_id, entity_name, entity_type
        And optionally: indicator_values (dict).
        """
        return [
            self.score_entity(
                entity_id=e["entity_id"],
                entity_name=e.get("entity_name", e.get("name", "")),
                entity_type=e.get("entity_type", e.get("type", "UNKNOWN")),
                indicator_values=e.get("indicator_values"),
            )
            for e in entities
        ]

    # --- helpers -------------------------------------------------------------

    def _criticality_to_tier(self, score: float) -> int:
        for i, threshold in enumerate(self.TIER_THRESHOLDS):
            if score >= threshold:
                return i + 1
        return 5

    @staticmethod
    def _build_reasoning(
        name: str,
        etype: str,
        criticality: float,
        tier: int,
        dim_scores: Dict[str, float],
        per_indicator: Dict[str, float],
    ) -> List[str]:
        lines: List[str] = [
            f"Entity '{name}' ({etype}) — criticality {criticality:.1f}, tier {tier}",
        ]
        # Top and bottom dimensions
        sorted_dims = sorted(dim_scores.items(), key=lambda x: -x[1])
        if sorted_dims:
            top = sorted_dims[0]
            lines.append(f"  Highest dimension: {top[0]} ({top[1]:.1f})")
            bottom = sorted_dims[-1]
            lines.append(f"  Lowest dimension:  {bottom[0]} ({bottom[1]:.1f})")

        # Indicators with notable values
        for ind_id, val in sorted(per_indicator.items(), key=lambda x: -x[1]):
            if val >= 0.7:
                lines.append(f"  ⬆ {ind_id}: {val:.2f}")
            elif val <= 0.15 and val > 0:
                lines.append(f"  ⬇ {ind_id}: {val:.2f}")

        return lines
