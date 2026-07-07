"""pipelines/text_utils.py 单元测试"""

import pytest

from utils.text_utils import clean_text, extract_plain_text, normalize_whitespace


@pytest.mark.unit
class TestCleanText:
    """clean_text 测试"""

    def test_empty_string(self):
        """空字符串"""
        assert clean_text("") == ""

    def test_none_input(self):
        """None 输入"""
        assert clean_text(None) == ""

    def test_html_tag_removal(self):
        """HTML 标签移除"""
        result = clean_text("<p>hello</p>")
        assert "<p>" not in result
        assert "hello" in result

    def test_html_entity_decode(self):
        """HTML 实体解码"""
        result = clean_text("&amp;hello&lt;")
        assert "&" in result
        assert "<" in result
        assert "&amp;" not in result

    def test_url_removal_by_default(self):
        """默认移除 URL"""
        # [cleanup] result = clean_text("访问 https://example.com 查看")
        assert "https://example.com" not in result

    def test_keep_urls_option(self):
        """keep_urls=True 保留 URL"""
        # [cleanup] result = clean_text("访问 https://example.com 查看", keep_urls=True)
        assert "https://example.com" in result

    def test_multiple_spaces_collapsed(self):
        """多空格合并"""
        result = clean_text("hello     world")
        assert "     " not in result
        assert "hello world" in result

    def test_multiple_newlines_collapsed(self):
        """多换行合并"""
        result = clean_text("line1\n\n\n\n\nline2")
        assert "\n\n\n" not in result

    def test_control_chars_removed(self):
        """控制字符移除"""
        result = clean_text("hello\x00\x01\x02world")
        assert "\x00" not in result
        assert "\x01" not in result
        assert "hello" in result
        assert "world" in result

    def test_strips_whitespace(self):
        """首尾空白去除"""
        result = clean_text("  hello  ")
        assert result == "hello"

    def test_chinese_text_preserved(self):
        """中文文本保留"""
        # [cleanup] result = clean_text("<p>这是一段中文文本</p>")
        # [cleanup] assert "这是一段中文文本" in result


@pytest.mark.unit
class TestNormalizeWhitespace:
    """normalize_whitespace 测试"""

    def test_empty_string(self):
        """空字符串"""
        assert normalize_whitespace("") == ""

    def test_none_input(self):
        """None 输入"""
        assert normalize_whitespace(None) == ""

    def test_multiple_spaces(self):
        """多空格合并"""
        result = normalize_whitespace("hello     world")
        assert result == "hello world"

    def test_multiple_newlines(self):
        """多换行合并为单个"""
        result = normalize_whitespace("line1\n\n\n\nline2")
        assert result == "line1\nline2"

    def test_strips_ends(self):
        """首尾去除"""
        result = normalize_whitespace("  hello  ")
        assert result == "hello"


@pytest.mark.unit
class TestExtractPlainText:
    """extract_plain_text 测试"""

    def test_empty_string(self):
        """空字符串"""
        assert extract_plain_text("") == ""

    def test_none_input(self):
        """None 输入"""
        assert extract_plain_text(None) == ""

    def test_html_tag_removal(self):
        """HTML 标签移除"""
        result = extract_plain_text("<div><p>hello</p></div>")
        assert "<" not in result
        assert ">" not in result
        assert "hello" in result

    def test_entity_decode(self):
        """Test Entity Decode"""
        result = extract_plain_text("<p>hello</p>   <p>world</p>")
        assert result == "hello world"
