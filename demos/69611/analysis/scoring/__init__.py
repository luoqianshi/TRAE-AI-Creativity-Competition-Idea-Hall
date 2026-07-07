"""Intelligence scoring module — asset criticality, risk scoring, and indicator registry.

Provides weighted multi-factor scoring engine inspired by CII (Country Instability
Index) patterns, generalized for entity-level intelligence assessment.

Reference: WorldMonitor CII v8 multi-dimensional stress scoring.
"""

from .asset_scorer import AssetScorer
from .indicator_registry import IndicatorRegistry, IndicatorDefinition

__all__ = [
    "AssetScorer",
    "IndicatorRegistry",
    "IndicatorDefinition",
]
