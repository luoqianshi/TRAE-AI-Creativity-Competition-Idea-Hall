"""Indicator registry — load scoring rules from YAML and resolve indicators by entity type."""

import logging
import os
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

import yaml

logger = logging.getLogger(__name__)


@dataclass
class IndicatorDefinition:
    """Definition of a single scoring indicator."""

    id: str
    name: str
    description: str
    weight: float
    min_score: float = 0.0
    max_score: float = 10.0
    entity_types: List[str] = field(default_factory=lambda: ["*"])
    source_fields: List[str] = field(default_factory=list)
    default_value: float = 0.0


class IndicatorRegistry:
    """Registry that loads indicator definitions from scoring_rules.yaml.

    Indicators are organized by dimension (military, economic, social, political,
    infrastructure) and mapped to entity types. The registry supports hot-reloading
    via ``reload()``.
    """

    _DEFAULT_PATH = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "config",
        "scoring_rules.yaml",
    )

    def __init__(self, config_path: Optional[str] = None):
        self._config_path = config_path or self._DEFAULT_PATH
        self._indicators: Dict[str, IndicatorDefinition] = {}
        self._dimensions: Dict[str, List[str]] = {}
        self._entity_type_map: Dict[str, List[str]] = {}
        self._load()

    # --- public API -----------------------------------------------------------

    def get_indicator(self, indicator_id: str) -> Optional[IndicatorDefinition]:
        """Look up a single indicator by its id."""
        return self._indicators.get(indicator_id)

    def get_indicators_for_entity(
        self, entity_type: str
    ) -> List[IndicatorDefinition]:
        """Return all indicators applicable to *entity_type*."""
        ids = self._entity_type_map.get(entity_type, []) + self._entity_type_map.get(
            "*", []
        )
        seen: set = set()
        result: List[IndicatorDefinition] = []
        for iid in ids:
            if iid not in seen and iid in self._indicators:
                seen.add(iid)
                result.append(self._indicators[iid])
        return result

    def get_indicators_by_dimension(self, dimension: str) -> List[IndicatorDefinition]:
        """Return all indicators under a named dimension."""
        ids = self._dimensions.get(dimension, [])
        return [self._indicators[iid] for iid in ids if iid in self._indicators]

    def get_dimensions(self) -> List[str]:
        """Return the list of dimension names."""
        return list(self._dimensions.keys())

    def list_all_indicators(self) -> List[IndicatorDefinition]:
        """Return every registered indicator."""
        return list(self._indicators.values())

    def reload(self) -> None:
        """Hot-reload all rules from YAML (thread-safe by caller)."""
        self._indicators.clear()
        self._dimensions.clear()
        self._entity_type_map.clear()
        self._load()
        logger.info("IndicatorRegistry reloaded from %s", self._config_path)

    # --- internal -------------------------------------------------------------

    def _load(self) -> None:
        """Parse the YAML config file and build internal maps."""
        path = self._config_path
        if not os.path.exists(path):
            logger.warning("Scoring rules not found at %s — using empty registry", path)
            return

        with open(path, "r", encoding="utf-8") as f:
            raw: Dict[str, Any] = yaml.safe_load(f)

        dimensions: Dict[str, Any] = raw.get("dimensions", {})
        for dim_name, dim_cfg in dimensions.items():
            indicator_ids: List[str] = []
            for ind_cfg in dim_cfg.get("indicators", []):
                defn = IndicatorDefinition(
                    id=ind_cfg["id"],
                    name=ind_cfg.get("name", ind_cfg["id"]),
                    description=ind_cfg.get("description", ""),
                    weight=float(ind_cfg.get("weight", 1.0)),
                    min_score=float(ind_cfg.get("min_score", 0.0)),
                    max_score=float(ind_cfg.get("max_score", 10.0)),
                    entity_types=ind_cfg.get("entity_types", ["*"]),
                    source_fields=ind_cfg.get("source_fields", []),
                    default_value=float(ind_cfg.get("default_value", 0.0)),
                )
                self._indicators[defn.id] = defn
                indicator_ids.append(defn.id)

                for et in defn.entity_types:
                    self._entity_type_map.setdefault(et, []).append(defn.id)

            self._dimensions[dim_name] = indicator_ids

        logger.info(
            "Loaded %d indicators across %d dimensions",
            len(self._indicators),
            len(self._dimensions),
        )
