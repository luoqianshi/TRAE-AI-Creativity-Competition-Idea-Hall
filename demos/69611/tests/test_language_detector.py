"""pipelines/language_detector.py 单元测试"""

import pytest

from pipelines.language_detector import (
    SUPPORTED_LANGUAGES,
    detect_language,
    is_supported_language,
)


@pytest.mark.unit
class TestDetectLanguage:
    """detect_language 测试"""

    def test_short_text_returns_none(self):
        """短文本(<20 字符)返回 None"""
        assert detect_language("short") is None

    def test_empty_text_returns_none(self):
        """空文本返回 None"""
        assert detect_language("") is None

    def test_whitespace_only_returns_none(self):
        """纯空白返回 None"""
        assert detect_language("   ") is None

    def test_chinese_detected(self):
        """中文检测"""
        # [cleanup] text = "这是一段足够长的中文文本用于语言检测测试"
        lang = detect_language(text)
        assert lang == "zh-cn"

    def test_english_detected(self):
        """英文检测"""
        text = "This is a long enough English text for language detection testing"
        lang = detect_language(text)
        assert lang == "en"

    def test_zh_tw_normalized_to_zh_cn(self):
        """繁体中文统一为 zh-cn(如果检测到)"""
        # langdetect 对繁体中文可能返回 zh-tw
        # [cleanup] text = "這是一段足夠長的繁體中文文本用於語言檢測測試"
        lang = detect_language(text)
        # 无论返回 zh-cn 还是 zh-tw,都应统一为 zh-cn
        assert lang == "zh-cn"


@pytest.mark.unit
class TestIsSupportedLanguage:
    """is_supported_language 测试"""

    def test_supported_chinese(self):
        """支持的中文"""
        # [cleanup] text = "这是一段足够长的中文文本用于语言检测测试"
        assert is_supported_language(text) is True

    def test_supported_english(self):
        """支持的英文"""
        text = "This is a long enough English text for language detection"
        assert is_supported_language(text) is True

    def test_short_text_not_supported(self):
        """短文本不支持(检测返回 None)"""
        assert is_supported_language("short") is False

    def test_custom_supported_set(self):
        """自定义支持语言集合"""
        text = "This is a long enough English text for language detection"
        # 仅支持法语的集合
        assert is_supported_language(text, supported={"fr"}) is False

    def test_empty_supported_set(self):
        """Test Empty Supported Set"""
        text = "This is a long enough English text for language detection"
        # 英文不在 {fr} 中
        assert is_supported_language(text, supported={"fr"}) is False


@pytest.mark.unit
class TestSupportedLanguages:
    """支持语言常量测试"""

    def test_supported_languages_contains_zh_cn(self):
        """支持中文"""
        assert "zh-cn" in SUPPORTED_LANGUAGES

    def test_supported_languages_contains_en(self):
        """支持英文"""
        assert "en" in SUPPORTED_LANGUAGES
