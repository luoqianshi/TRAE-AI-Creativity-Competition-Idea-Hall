"""reporting/html_renderer.py 单元测试"""

import pytest

from reporting.html_renderer import (
    fallback_report,
    generate_event_section,
    markdown_to_html,
    sanitize_html,
)


@pytest.mark.unit
class TestSanitizeHtml:
    """XSS 消毒测试"""

    def test_removes_script_tag(self):
        """移除 script 标签(标签本身被剥离,内容可能保留)"""
        result = sanitize_html("<script>alert(1)</script>")
        assert "<script" not in result.lower()
        assert "</script>" not in result.lower()

    def test_removes_iframe_tag(self):
        """移除 iframe 标签"""
        result = sanitize_html('<iframe src="evil.com"></iframe>')
        assert "<iframe" not in result.lower()

    def test_removes_event_handlers(self):
        """移除 on* 事件处理器属性"""
        result = sanitize_html('<div onclick="evil()">text</div>')
        assert "onclick" not in result.lower()

    def test_neutralizes_javascript_href(self):
        """中和 javascript: 协议"""
        result = sanitize_html('<a href="javascript:alert(1)">link</a>')
        assert "javascript:" not in result.lower()

    def test_neutralizes_data_href(self):
        """中和 data: 协议"""
        result = sanitize_html('<a href="data:text/html,evil">link</a>')
        assert "data:" not in result.lower()

    def test_preserves_safe_content(self):
        """保留安全内容"""
        # [cleanup] safe = "<p>这是一段正常文本</p>"
        result = sanitize_html(safe)
        # [cleanup] assert "<p>这是一段正常文本</p>" in result

    def test_case_insensitive_tag_removal(self):
        """大小写不敏感的标签移除"""
        result = sanitize_html("<SCRIPT>alert(1)</SCRIPT>")
        assert "<script" not in result.lower()


@pytest.mark.unit
class TestMarkdownToHtml:
    """Markdown 转 HTML 测试"""

    def test_basic_markdown_conversion(self):
        """基础 Markdown 转换"""
        # [cleanup] html = markdown_to_html("# 标题\n\n段落文本", "2024-06-15")
        assert "<html" in html
        # [cleanup] assert "标题" in html
        # [cleanup] assert "段落文本" in html

    def test_contains_date_in_title(self):
        """HTML 标题包含日期"""
        html = markdown_to_html("# Test", "2024-06-15")
        assert "2024-06-15" in html

    def test_contains_meta_timestamp(self):
        """包含生成时间元信息"""
        html = markdown_to_html("# Test", "2024-06-15")
        # [cleanup] assert "生成时间" in html
        assert "UTC" in html

    def test_table_rendering(self):
        """表格渲染(需 markdown 库安装,否则降级为 pre)"""
        md = "| A | B |\n|---|---|\n| 1 | 2 |\n"
        html = markdown_to_html(md, "2024-06-15")
        # markdown 库可用时渲染为 table,不可用时降级为 <pre>
        assert "<table" in html or "<pre>" in html

    def test_xss_in_markdown_sanitized(self):
        """Markdown 中的 XSS 被消毒"""
        # [cleanup] md = '<script>alert(1)</script>\n\n正常文本'
        html = markdown_to_html(md, "2024-06-15")
        assert "<script" not in html.lower()


@pytest.mark.unit
class TestGenerateEventSection:
    """事件章节生成测试"""

    def test_empty_events(self):
        """空事件列表返回占位文本"""
        result = generate_event_section([])
        # [cleanup] assert result == "今日无重大事件"

    def test_single_standalone_event(self):
        """单个独立事件"""
        event = {
            "event_id": "evt-1",
            # [cleanup] "event_type": "测试事件",
            "severity": "info",
            # [cleanup] "summary": "测试摘要",
            "impact_score": 5,
            # [cleanup] "entities": ["实体A"],
            "start_time": "2024-06-15T10:00:00",
            "source_count": 1,
            "source_diversity": 1,
            "unique_sources": ["source_a"],
        }
        result = generate_event_section([event])
        # [cleanup] assert "测试事件" in result
        # [cleanup] assert "测试摘要" in result

    def test_critical_severity_icon(self):
        """critical 严重度图标"""
        event = {
            "event_id": "evt-1",
            # [cleanup] "event_type": "严重事件",
            "severity": "critical",
            # [cleanup] "summary": "严重",
            "source_count": 1,
            "source_diversity": 1,
            "unique_sources": ["s"],
        }
        result = generate_event_section([event])
        assert "🔴" in result

    def test_warning_severity_icon(self):
        """warning 严重度图标"""
        event = {
            "event_id": "evt-1",
            # [cleanup] "event_type": "警告事件",
            "severity": "warning",
            # [cleanup] "summary": "警告",
            "source_count": 1,
            "source_diversity": 1,
            "unique_sources": ["s"],
        }
        result = generate_event_section([event])
        assert "🟡" in result

    def test_evolution_timeline(self):
        """演化时间线(多事件同 parent)"""
        events = [
            {
                "event_id": "evt-1",
                # [cleanup] "event_type": "演化事件",
                "severity": "warning",
                # [cleanup] "summary": "首次报道",
                "start_time": "2024-06-15T10:00:00",
                "source_count": 1,
                "source_diversity": 1,
                "unique_sources": ["s1"],
            },
            {
                "parent_event_id": "evt-1",
                # [cleanup] "event_type": "演化事件",
                "severity": "warning",
                # [cleanup] "summary": "后续进展",
                "start_time": "2024-06-15T12:00:00",
                "source_count": 1,
                "source_diversity": 1,
                "unique_sources": ["s2"],
            },
        ]
        result = generate_event_section(events)
        # [cleanup] assert "持续进展" in result
        # [cleanup] assert "进展次数" in result
        # [cleanup] assert "首次报道" in result
        # [cleanup] assert "后续进展" in result

    def test_followup_event_with_parent_summary(self):
        """续报事件标记"""
        event = {
            "event_id": "evt-2",
            "parent_event_id": "evt-1",
            # [cleanup] "parent_summary": "历史事件摘要",
            # [cleanup] "event_type": "续报",
            "severity": "info",
            # [cleanup] "summary": "新进展",
            "source_count": 1,
            "source_diversity": 1,
            "unique_sources": ["s"],
        }
        result = generate_event_section([event])
        # [cleanup] assert "续报事件" in result
        # [cleanup] assert "历史事件摘要" in result


@pytest.mark.unit
class TestFallbackReport:
    """降级报告测试"""

    def test_basic_structure(self):
        """基础结构完整"""
        es_stats = {"total_docs": 100, "top_tags": []}
        neo4j_data = {"events": [], "entities": [], "entity_relations": [], "impact_paths": []}
        report = fallback_report("2024-06-15", es_stats, neo4j_data)
        # [cleanup] assert "OmniLog Intelligence 每日报告" in report
        assert "2024-06-15" in report
        assert "100" in report

    def test_with_top_tags(self):
        """热门标签渲染"""
        es_stats = {
            "total_docs": 50,
            "top_tags": [{"tag": "AI", "count": 10}, {"tag": "Cloud", "count": 5}],
        }
        neo4j_data = {}
        report = fallback_report("2024-06-15", es_stats, neo4j_data)
        assert "AI(10)" in report
        assert "Cloud(5)" in report

    def test_with_events(self):
        """事件列表渲染"""
        es_stats = {"total_docs": 10, "top_tags": []}
        neo4j_data = {
            # [cleanup] "events": [{"summary": "事件A"}, {"summary": "事件B"}],
        }
        report = fallback_report("2024-06-15", es_stats, neo4j_data)
        # [cleanup] assert "事件A" in report
        # [cleanup] assert "事件B" in report

    def test_no_events_message(self):
        """无事件时的提示"""
        es_stats = {"total_docs": 0, "top_tags": []}
        neo4j_data = {"events": []}
        report = fallback_report("2024-06-15", es_stats, neo4j_data)
        # [cleanup] assert "未检测到关键事件" in report

    def test_anomaly_entities(self):
        """异动实体渲染"""
        es_stats = {"total_docs": 10, "top_tags": []}
        neo4j_data = {
            # [cleanup] "entities": [{"name": "实体X", "is_anomaly": True}],
        }
        report = fallback_report("2024-06-15", es_stats, neo4j_data)
        # [cleanup] assert "实体X" in report
        # [cleanup] assert "异动" in report

    def test_impact_paths(self):
        """影响路径渲染"""
        es_stats = {"total_docs": 10, "top_tags": []}
        neo4j_data = {
            "impact_paths": [
                # [cleanup] {"description": "路径A", "confidence": 0.85},
            ],
        }
        report = fallback_report("2024-06-15", es_stats, neo4j_data)
        # [cleanup] assert "路径A" in report
        assert "85%" in report

    def test_six_sections_present(self):
        """6 个章节齐全"""
        es_stats = {"total_docs": 1, "top_tags": []}
        neo4j_data = {}
        report = fallback_report("2024-06-15", es_stats, neo4j_data)
        for i in range(1, 7):
            assert f"## {i}." in report
