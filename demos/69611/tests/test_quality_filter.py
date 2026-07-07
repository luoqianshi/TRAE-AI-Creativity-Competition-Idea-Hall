"""pipelines/quality_filter.py 单元测试"""

import pytest

from pipelines.quality_filter import QualityFilter, get_quality_filter


@pytest.mark.unit
class TestQualityFilter:
    """QualityFilter 测试"""

    def test_short_text_filtered(self):
        """短文本被过滤"""
        qf = QualityFilter()
        # [cleanup] doc = {"clean_text": "短文本", "source": "test"}
        assert qf.filter(doc) is None

    def test_low_quality_pattern_filtered(self):
        """低质量模式被过滤"""
        qf = QualityFilter()
        # 版权声明模式(长度 >= 100 且匹配低质量模式)
        # [cleanup] text = "版权所有某某公司保留所有权利" + "x" * 100
        doc = {"clean_text": text, "source": "test"}
        assert qf.filter(doc) is None

    def test_404_pattern_filtered(self):
        """404 错误页被过滤"""
        qf = QualityFilter()
        text = "404 not found " + "x" * 100
        doc = {"clean_text": text, "source": "test"}
        assert qf.filter(doc) is None

    def test_high_quality_content_passes(self):
        """高质量内容通过"""
        qf = QualityFilter()
        text = (
            "这是一段足够长的中文测试文本,用于验证质量过滤器能正确放行高质量内容."
            "包含标点符号, 段落分隔和足够的信息密度,确保评分超过阈值."
            "这是第二段内容,进一步增加文本长度和结构特征.\n\n"
            "第三段内容,包含更多有效信息."
        )
        doc = {"clean_text": text, "source": "techcrunch"}
        result = qf.filter(doc)
        assert result is not None
        assert "quality_score" in result.get("metadata", {})

    def test_quality_score_added_to_metadata(self):
        """质量评分添加到 metadata"""
        qf = QualityFilter()
        # [cleanup] text = "这是一段足够长的中文测试文本," * 10 + "用于验证质量评分添加."
        doc = {"clean_text": text, "source": "reuters"}
        result = qf.filter(doc)
        assert result is not None
        assert "metadata" in result
        assert "quality_score" in result["metadata"]
        assert 0 <= result["metadata"]["quality_score"] <= 1.0

    def test_preserves_existing_metadata(self):
        """保留已有 metadata"""
        qf = QualityFilter()
        # [cleanup] text = "这是一段足够长的中文测试文本," * 10 + "用于验证."
        doc = {
            "clean_text": text,
            "source": "arxiv",
            "metadata": {"existing": "value"},
        }
        result = qf.filter(doc)
        assert result is not None
        assert result["metadata"]["existing"] == "value"
        assert "quality_score" in result["metadata"]


@pytest.mark.unit
class TestComputeInfoRatio:
    """信息密度计算测试"""

    def test_empty_text(self):
        """空文本返回 0"""
        qf = QualityFilter()
        assert qf._compute_info_ratio("") == 0.0

    def test_pure_stopwords_low_ratio(self):
        """纯停用词信息密度低"""
        qf = QualityFilter()
        # 全是英文停用词
        text = "the a an and or but in on at to for of with by from is are was were"
        ratio = qf._compute_info_ratio(text)
        assert ratio < 0.1

    def test_pure_content_high_ratio(self):
        """纯内容词信息密度高"""
        qf = QualityFilter()
        text = "artificial intelligence machine learning deep neural networks"
        ratio = qf._compute_info_ratio(text)
        assert ratio > 0.8

    def test_mixed_content(self):
        """混合内容信息密度中等"""
        qf = QualityFilter()
        text = "the artificial intelligence is a machine learning technology"
        ratio = qf._compute_info_ratio(text)
        assert 0.2 < ratio < 0.8

    def test_chinese_stopwords(self):
        """中文停用词"""
        qf = QualityFilter()
        # [cleanup] text = "的了是在我有和就不人都一个上也很到说要去"
        ratio = qf._compute_info_ratio(text)
        assert ratio < 0.1


@pytest.mark.unit
class TestComputeStructureScore:
    """结构评分测试"""

    def test_empty_text(self):
        """空文本"""
        qf = QualityFilter()
        assert qf._compute_structure_score("") == 0.0

    def test_with_newlines(self):
        """有换行加分"""
        qf = QualityFilter()
        score = qf._compute_structure_score("line1\nline2")
        assert score >= 0.3

    def test_with_punctuation(self):
        """有标点加分"""
        qf = QualityFilter()
        score = qf._compute_structure_score("Hello, world! How are you?")
        assert score >= 0.3

    def test_optimal_length(self):
        """最佳长度(500-5000)加分"""
        qf = QualityFilter()
        text = "a" * 1000
        score = qf._compute_structure_score(text)
        assert score >= 0.4

    def test_too_long(self):
        """过长文本分数降低"""
        qf = QualityFilter()
        text = "a" * 6000
        score = qf._compute_structure_score(text)
        # 过长只加 0.2,无换行无标点
        assert score <= 0.3


@pytest.mark.unit
class TestComputeScore:
    """综合评分测试"""

    def test_high_reputation_source(self):
        """高信誉源加分"""
        qf = QualityFilter()
        text = "artificial intelligence machine learning technology"
        score_high = qf._compute_score(text, "reuters")
        score_default = qf._compute_score(text, "unknown_source")
        assert score_high > score_default

    def test_score_capped_at_1(self):
        """评分上限为 1.0"""
        qf = QualityFilter()
        text = "a" * 1000 + "\n\n" + "Hello, world! " * 50
        score = qf._compute_score(text, "bloomberg")
        assert score <= 1.0

    def test_default_reputation(self):
        """默认信誉度"""
        qf = QualityFilter()
        text = "test content"
        score = qf._compute_score(text, "unknown")
        # default = 0.6, 0.6 * 0.4 = 0.24
        assert score >= 0.24


@pytest.mark.unit
class TestGetQualityFilter:
    """全局实例测试"""

    def test_returns_singleton(self):
        """返回单例"""
        qf1 = get_quality_filter()
        qf2 = get_quality_filter()
        assert qf1 is qf2

    def test_returns_quality_filter_instance(self):
        """返回 QualityFilter 实例"""
        assert isinstance(get_quality_filter(), QualityFilter)
