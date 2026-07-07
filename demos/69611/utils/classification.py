"""Intelligence classification management.

Multi-dimensional classification for documents and reports based on
source sensitivity, content keyword detection, and entity importance.

Classification hierarchy: public < internal < confidential < secret
"""

import logging
import re
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class IntelligenceClassification:
    """Multi-dimensional intelligence classification engine.

    Classification hierarchy:
    - public: Open-source intelligence, accessible to all
    - internal: Internal intelligence, requires authentication
    - confidential: Classified intelligence, requires elevated permissions
    - secret: Top-secret intelligence, requires highest clearance
    """

    LEVELS = {
        "public": {"level": 0, "label": "public"},
        "internal": {"level": 1, "label": "internal"},
        "confidential": {"level": 2, "label": "confidential"},
        "secret": {"level": 3, "label": "secret"},
    }

    SOURCE_CLASSIFICATION = {
        "osint": "public",
        "rss": "public",
        "web": "public",
        "social_media": "public",
        "dark_web": "internal",
        "telegram": "internal",
        "forum": "internal",
        "leaked": "confidential",
        "humint": "confidential",
        "sigint": "secret",
        "classified": "secret",
        "default": "internal",
    }

    # Sensitive keyword patterns (ordered high-to-low for first-match)
    SENSITIVE_PATTERNS = {
        "secret": [
            r"绝密", r"top[\s_-]?secret", r"最高机密",
            r"核武器", r"nuclear\s+weapon",
        ],
        "confidential": [
            r"机密", r"classified", r"confidential",
            r"内部文件", r"不得外传",
        ],
        "internal": [
            r"内部", r"internal\s+use\s+only",
            r"仅供", r"非公开",
        ],
    }

    # False-positive patterns for internal level to reduce misclassification
    INTERNAL_FALSE_POSITIVE_PATTERNS = [
        r"这个项目是内部的",
        r"内部测试",
        r"内部版本",
        r"internal\s+test",
    ]

    # High-value entity types that elevate classification
    HIGH_VALUE_ENTITY_TYPES = {
        "Person": {"高管": "confidential", "核心研发": "confidential"},
        "Organization": {"政府机构": "internal", "军事单位": "secret"},
        "Asset": {"关键基础设施": "confidential", "武器系统": "secret"},
    }

    def _max_level(self, *levels: str) -> str:
        """Return the highest classification level from the given set."""
        result = "public"
        result_val = 0
        for level in levels:
            level_val = self.LEVELS.get(level, self.LEVELS["public"])["level"]
            if level_val > result_val:
                result = level
                result_val = level_val
        return result

    def _detect_sensitive_content(self, text: str) -> str:
        """Detect sensitive keywords in text with context validation.

        Scans from highest sensitivity to lowest. For internal-level
        matches, runs false-positive checks to reduce misclassification.
        """
        for level in ["secret", "confidential", "internal"]:
            for pattern in self.SENSITIVE_PATTERNS.get(level, []):
                if re.search(pattern, text, re.IGNORECASE):
                    if level == "internal" and self._is_false_positive(text):
                        continue
                    return level
        return "public"

    def _is_false_positive(self, context: str) -> bool:
        """Check if an internal-level keyword match is a false positive."""
        for pattern in self.INTERNAL_FALSE_POSITIVE_PATTERNS:
            if re.search(pattern, context, re.IGNORECASE):
                return True
        return False

    def _classify_by_entities(self, entities: List[Dict]) -> str:
        """Classify based on entity importance.

        High-value entities (senior executives, critical assets) elevate
        the classification level.
        """
        max_level = "public"
        for entity in entities:
            entity_type = entity.get("type", "")
            entity_name = entity.get("name", "")
            type_rules = self.HIGH_VALUE_ENTITY_TYPES.get(entity_type, {})
            for keyword, level in type_rules.items():
                if keyword in entity_name:
                    max_level = self._max_level(max_level, level)
        return max_level

    def classify_document(
        self, doc: Dict[str, Any], entities: Optional[List[Dict]] = None
    ) -> str:
        """Classify a document based on source, content, and entities.

        Combines three dimensions:
        1. Source classification (base level)
        2. Sensitive content detection (with false-positive mitigation)
        3. Entity importance (high-value entities elevate level)

        Returns the highest classification across all dimensions.
        """
        source = doc.get("source", "")
        source_level = self.SOURCE_CLASSIFICATION.get(
            source, self.SOURCE_CLASSIFICATION["default"]
        )

        text = doc.get("clean_text", "") or ""
        content_level = self._detect_sensitive_content(text)

        entity_level = self._classify_by_entities(entities or [])

        return self._max_level(source_level, content_level, entity_level)

    def can_access(self, user_level: str, resource_level: str) -> bool:
        """Check whether a user can access a resource at the given level.

        Users can access resources at or below their clearance level.
        Unknown user level defaults to public (least privilege).
        Unknown resource level defaults to secret (maximum restriction).
        """
        user_l = self.LEVELS.get(user_level, self.LEVELS["public"])["level"]
        resource_l = self.LEVELS.get(resource_level, self.LEVELS["secret"])["level"]
        return user_l >= resource_l

    def get_classification_label(self, level: str) -> str:
        """Get the human-readable label for a classification level."""
        return self.LEVELS.get(level, self.LEVELS["public"])["label"]


# Global singleton
_classifier: Optional[IntelligenceClassification] = None


def get_classifier() -> IntelligenceClassification:
    """Get or create the global IntelligenceClassification singleton."""
    global _classifier
    if _classifier is None:
        _classifier = IntelligenceClassification()
    return _classifier
