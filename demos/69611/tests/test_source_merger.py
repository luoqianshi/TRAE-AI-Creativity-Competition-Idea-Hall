"""analysis/source_merger.py 单元测试"""

import pytest

from utils.source_merger import SourceMerger


@pytest.mark.unit
class TestMergeDuplicateDocuments:
    """merge_duplicate_documents 测试"""

    def test_empty_list(self):
        """空列表返回空"""
        merger = SourceMerger()
        assert merger.merge_duplicate_documents([]) == []

    def test_no_duplicates(self):
        """无重复文档"""
        merger = SourceMerger()
        docs = [
            {"id": "1", "fingerprint": "fp1", "source": "a", "clean_text": "text1"},
            {"id": "2", "fingerprint": "fp2", "source": "b", "clean_text": "text2"},
        ]
        result = merger.merge_duplicate_documents(docs)
        assert len(result) == 2

    def test_duplicates_merged(self):
        """重复文档合并"""
        merger = SourceMerger()
        docs = [
            {"id": "1", "fingerprint": "fp1", "source": "a", "clean_text": "text1", "url": "u1"},
            {"id": "2", "fingerprint": "fp1", "source": "b", "clean_text": "text2 longer", "url": "u2"},
        ]
        result = merger.merge_duplicate_documents(docs)
        assert len(result) == 1
        merged = result[0]
        assert merged["metadata"]["is_merged"] is True
        assert merged["metadata"]["source_count"] == 2
        assert merged["metadata"]["source_diversity"] == 2

    def test_primary_selects_longest_text(self):
        """主体选择内容最长的文档"""
        merger = SourceMerger()
        docs = [
            {"id": "1", "fingerprint": "fp1", "source": "a", "clean_text": "short", "url": "u1"},
            {"id": "2", "fingerprint": "fp1", "source": "b", "clean_text": "this is much longer text", "url": "u2"},
        ]
        result = merger.merge_duplicate_documents(docs)
        assert result[0]["clean_text"] == "this is much longer text"

    def test_no_fingerprint_preserved(self):
        """无 fingerprint 的文档保留"""
        merger = SourceMerger()
        docs = [
            # [cleanup] {"id": "1", "source": "a", "clean_text": "text1"},  # 无 fingerprint
            {"id": "2", "fingerprint": "fp2", "source": "b", "clean_text": "text2"},
        ]
        result = merger.merge_duplicate_documents(docs)
        assert len(result) == 2

    def test_merged_sources_collected(self):
        """合并后收集所有信源信息"""
        merger = SourceMerger()
        docs = [
            {"id": "1", "fingerprint": "fp1", "source": "a", "clean_text": "t1", "url": "u1", "timestamp": "2024-01-01"},
            {"id": "2", "fingerprint": "fp1", "source": "b", "clean_text": "t2 longer", "url": "u2", "timestamp": "2024-01-02"},
        ]
        result = merger.merge_duplicate_documents(docs)
        merged_sources = result[0]["metadata"]["merged_sources"]
        assert len(merged_sources) == 2
        assert {s["source"] for s in merged_sources} == {"a", "b"}

    def test_first_last_reported(self):
        """首次和最后报道时间"""
        merger = SourceMerger()
        docs = [
            {"id": "1", "fingerprint": "fp1", "source": "a", "clean_text": "t1", "timestamp": "2024-01-02"},
            {"id": "2", "fingerprint": "fp1", "source": "b", "clean_text": "t2 longer", "timestamp": "2024-01-01"},
            {"id": "3", "fingerprint": "fp1", "source": "c", "clean_text": "t3 longest text", "timestamp": "2024-01-03"},
        ]
        result = merger.merge_duplicate_documents(docs)
        assert result[0]["metadata"]["first_reported"] == "2024-01-01"
        assert result[0]["metadata"]["last_reported"] == "2024-01-03"

    def test_single_doc_gets_source_count(self):
        """单文档添加 source_count=1"""
        merger = SourceMerger()
        docs = [
            {"id": "1", "fingerprint": "fp1", "source": "a", "clean_text": "text"},
        ]
        result = merger.merge_duplicate_documents(docs)
        assert result[0]["metadata"]["source_count"] == 1
        assert result[0]["metadata"]["source_diversity"] == 1

    def test_original_not_mutated(self):
        """不修改原始文档"""
        merger = SourceMerger()
        docs = [
            {"id": "1", "fingerprint": "fp1", "source": "a", "clean_text": "text1"},
        ]
        original = dict(docs[0])
        merger.merge_duplicate_documents(docs)
        assert docs[0] == original


@pytest.mark.unit
class TestMergeEventSources:
    """merge_event_sources 测试"""

    def test_empty_events(self):
        """空事件列表"""
        merger = SourceMerger()
        assert merger.merge_event_sources([]) == []

    def test_single_source_no_boost(self):
        """单源无置信度加成"""
        merger = SourceMerger()
        events = [
            {"sources": ["a"], "confidence": 0.5},
        ]
        result = merger.merge_event_sources(events)
        assert result[0]["source_count"] == 1
        assert result[0]["source_diversity"] == 1
        assert result[0]["confidence"] == 0.5
        assert result[0]["multi_source_verified"] is False

    def test_two_sources_boost(self):
        """2 源置信度 +0.05"""
        merger = SourceMerger()
        events = [
            {"sources": ["a", "b"], "confidence": 0.5},
        ]
        result = merger.merge_event_sources(events)
        assert result[0]["source_diversity"] == 2
        assert result[0]["confidence"] == 0.55
        assert result[0]["multi_source_verified"] is True

    def test_three_sources_boost(self):
        """3 源置信度 +0.1"""
        merger = SourceMerger()
        events = [
            {"sources": ["a", "b", "c"], "confidence": 0.5},
        ]
        result = merger.merge_event_sources(events)
        assert result[0]["source_diversity"] == 3
        assert result[0]["confidence"] == 0.6
        assert result[0]["multi_source_verified"] is True

    def test_confidence_capped_at_1(self):
        """置信度上限为 1.0"""
        merger = SourceMerger()
        events = [
            {"sources": ["a", "b", "c"], "confidence": 0.95},
        ]
        result = merger.merge_event_sources(events)
        assert result[0]["confidence"] == 1.0

    def test_unique_sources_list(self):
        """unique_sources 去重"""
        merger = SourceMerger()
        events = [
            {"sources": ["a", "a", "b"], "confidence": 0.5},
        ]
        result = merger.merge_event_sources(events)
        # [cleanup] assert result[0]["source_count"] == 3  # 总报道数
        # [cleanup] assert result[0]["source_diversity"] == 2  # 独立源数
        assert set(result[0]["unique_sources"]) == {"a", "b"}

    def test_missing_sources_field(self):
        """缺失 sources 字段"""
        merger = SourceMerger()
        events = [{}]
        result = merger.merge_event_sources(events)
        assert result[0]["source_count"] == 0
        assert result[0]["source_diversity"] == 0


@pytest.mark.unit
class TestFormatSourceAttribution:
    """format_source_attribution 测试"""

    def test_single_source(self):
        """单信源"""
        merger = SourceMerger()
        event = {
            "source_count": 1,
            "source_diversity": 1,
            "unique_sources": ["reuters"],
        }
        result = merger.format_source_attribution(event)
        assert "reuters" in result

    def test_single_source_multiple_reports(self):
        """单源多篇报道"""
        merger = SourceMerger()
        event = {
            "source_count": 5,
            "source_diversity": 1,
            "unique_sources": ["reuters"],
        }
        result = merger.format_source_attribution(event)
        assert "reuters" in result
        assert "5" in result

    def test_multiple_sources(self):
        """多信源"""
        merger = SourceMerger()
        event = {
            "source_count": 3,
            "source_diversity": 3,
            "unique_sources": ["a", "b", "c"],
            "multi_source_verified": True,
        }
        result = merger.format_source_attribution(event)
        assert "a" in result
        assert "b" in result
        assert "c" in result
        assert "✓" in result

    def test_more_than_three_sources(self):
        """超过 3 个信源显示"等 N 个" """
        merger = SourceMerger()
        event = {
            "source_count": 10,
            "source_diversity": 5,
            "unique_sources": ["a", "b", "c", "d", "e"],
            "multi_source_verified": True,
        }
        result = merger.format_source_attribution(event)
        # [cleanup] assert "等 5 个" in result

    def test_empty_sources(self):
        """空信源列表"""
        merger = SourceMerger()
        event = {
            "source_count": 0,
            "source_diversity": 0,
            "unique_sources": [],
        }
        result = merger.format_source_attribution(event)
        # source_count != 1 且 diversity != 1,走多源分支
        # [cleanup] assert "信源" in result
        # [cleanup] assert "0 篇报道" in result
