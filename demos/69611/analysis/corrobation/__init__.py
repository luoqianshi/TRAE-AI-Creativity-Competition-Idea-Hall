"""Multi-source corroboration engine — confidence scoring, source independence,
and event-level reliability assessment.

Reference: WorldMonitor CrossSourceSignalsPanel.ts multi-stream correlation logic.
"""

from .confidence_scorer import ConfidenceScorer, SourceVerdict
from .source_independence import SourceIndependence

__all__ = [
    "ConfidenceScorer",
    "SourceVerdict",
    "SourceIndependence",
]
