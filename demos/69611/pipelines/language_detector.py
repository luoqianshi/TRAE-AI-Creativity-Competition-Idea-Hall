"""Language detection with multi-language support (Phase 4.3).

Extended from zh-cn/en to 12 languages including CJK, RTL, and European languages.
Reference: WorldMonitor 24-language support.
"""

import logging
from typing import Optional, Set

from langdetect import detect, DetectorFactory, LangDetectException

logger = logging.getLogger(__name__)

# Seed for deterministic results
DetectorFactory.seed = 0

# Supported languages — expanded from {zh-cn, en} to include major world languages
SUPPORTED_LANGUAGES: Set[str] = {
    "zh-cn", "en",
    # European
    "ja", "ko",
    "ru", "de", "fr", "es", "pt", "it",
    # Middle Eastern / RTL
    "ar", "he", "fa",
    # South Asian
    "hi", "bn", "ta",
    # Southeast Asian
    "th", "vi", "id",
    # Others
    "tr", "nl", "pl", "sv",
}

# Language display names
LANGUAGE_NAMES = {
    "zh-cn": "Chinese (Simplified)",
    "en": "English",
    "ja": "Japanese",
    "ko": "Korean",
    "ru": "Russian",
    "de": "German",
    "fr": "French",
    "es": "Spanish",
    "pt": "Portuguese",
    "it": "Italian",
    "ar": "Arabic",
    "he": "Hebrew",
    "fa": "Persian",
    "hi": "Hindi",
    "bn": "Bengali",
    "ta": "Tamil",
    "th": "Thai",
    "vi": "Vietnamese",
    "id": "Indonesian",
    "tr": "Turkish",
    "nl": "Dutch",
    "pl": "Polish",
    "sv": "Swedish",
}

# RTL languages (for layout considerations)
RTL_LANGUAGES = {"ar", "he", "fa"}

# Minimum text length for reliable detection
_MIN_TEXT_LENGTH = 20


def detect_language(text: str) -> Optional[str]:
    """Detect the language of input text.

    Args:
        text: Input text to analyze.

    Returns:
        ISO language code (e.g., 'zh-cn', 'en', 'ja'), or None if detection fails.
    """
    if not text or len(text.strip()) < _MIN_TEXT_LENGTH:
        return None

    try:
        lang = detect(text)
        # Normalize Chinese variants
        if lang.startswith("zh"):
            return "zh-cn"
        return lang
    except LangDetectException:
        return None


def is_supported_language(text: str, supported: Optional[Set[str]] = None) -> bool:
    """Check if the text is in a supported language.

    Args:
        text: Input text.
        supported: Set of supported language codes. Defaults to SUPPORTED_LANGUAGES.

    Returns:
        True if the detected language is in the supported set.
    """
    supported = supported or SUPPORTED_LANGUAGES
    lang = detect_language(text)
    return lang in supported


def get_language_name(lang_code: str) -> str:
    """Get the display name for a language code."""
    return LANGUAGE_NAMES.get(lang_code, lang_code)


def is_rtl(lang_code: str) -> bool:
    """Check if a language is right-to-left."""
    return lang_code in RTL_LANGUAGES
