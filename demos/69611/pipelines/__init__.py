"""OmniLog Intelligence 数据处理流水线"""

# Lazy imports to avoid cascading failures from broken sub-modules
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from pipelines.models import StandardDoc
    from utils.text_utils import clean_text
    from pipelines.language_detector import detect_language, is_supported_language
    from pipelines.classifier import ZeroShotClassifier


def get_standard_doc():
    from pipelines.models import StandardDoc
    return StandardDoc


def get_clean_text():
    from utils.text_utils import clean_text
    return clean_text


def get_language_detector():
    from pipelines.language_detector import detect_language, is_supported_language
    return detect_language


__all__ = [
    "get_standard_doc",
    "get_clean_text",
    "get_language_detector",
]
