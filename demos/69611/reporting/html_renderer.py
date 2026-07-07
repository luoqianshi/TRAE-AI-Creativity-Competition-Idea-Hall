"""报告 HTML 渲染

# [removed garbled text]
- Markdown → HTML 转换(含 XSS 消毒)
- 事件章节生成(含演化时间线)
- 降级报告生成

这些函数不依赖数据库连接,可独立测试.
"""

import html
import logging
import re
from datetime import datetime, timezone
from typing import Dict, List

logger = logging.getLogger(__name__)

# 危险 HTML 标签和属性(用于 XSS 防护)
_DANGEROUS_TAGS = re.compile(
    r'<\s*/?(script|iframe|object|embed|form|input|textarea|button|svg|math|style|base|link|meta|template|slot)\b[^>]*>',
    re.IGNORECASE | re.DOTALL,
)
_DANGEROUS_ATTRS = re.compile(
    r'\s+(on\w+|srcdoc|formaction|xlink:href|data:text/html)\s*=\s*["\'][^"\']*["\']',
    re.IGNORECASE,
)
_DANGEROUS_URLS = re.compile(
    r'(href|src|action|formaction|background|dynsrc|lowsrc)\s*=\s*["\']\s*(javascript|vbscript|data:text/html|blob:)[^"\']*["\']',
    re.IGNORECASE,
)


def sanitize_html(html_str: str) -> str:
    """Sanitize HTML by removing script tags and event handlers."""
    html_str = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', html_str, flags=re.IGNORECASE | re.DOTALL)
    html_str = re.sub(r'\bon\w+\s*=\s*"[^"]*"', '', html_str, flags=re.IGNORECASE)
    html_str = re.sub(r"\bon\w+\s*=\s*'[^']*'", '', html_str, flags=re.IGNORECASE)
    return html_str


def markdown_to_html(markdown_text: str, date_str: str) -> str:
    """Convert Markdown report text to a styled HTML document."""
    try:
        import markdown
        import html as html_lib
        html_body = markdown.markdown(
            markdown_text,
            extensions=["tables", "fenced_code", "toc"],
        )
    except ImportError:
        import html as html_lib
        html_body = f"<pre>{html_lib.escape(markdown_text)}</pre>"

    html_body = sanitize_html(html_body)

    html_doc = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OmniLog 每日报告 - {date_str}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; }}
        h1 {{ color: #1a1a2e; border-bottom: 2px solid #e94560; padding-bottom: 10px; }}
        h2 {{ color: #16213e; margin-top: 30px; border-left: 4px solid #e94560; padding-left: 10px; }}
        h3 {{ color: #0f3460; }}
        ul, ol {{ padding-left: 20px; }}
        li {{ margin: 5px 0; }}
        strong {{ color: #e94560; }}
        table {{ border-collapse: collapse; width: 100%; margin: 15px 0; }}
        th, td {{ border: 1px solid #ddd; padding: 8px 12px; text-align: left; }}
        th {{ background: #16213e; color: white; }}
        .meta {{ color: #666; font-size: 0.9em; margin-bottom: 20px; }}
    </style>
</head>
<body>
    <div class="meta">生成时间: {datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")}</div>
    {html_body}
</body>
</html>"""
    return html_doc


def generate_event_section(events: List[Dict]) -> str:
    """生成事件章节,合并演化事件展示时间线"""
    if not events:
        return ""

    # 按 parent_event_id 分组
    event_groups: Dict[str, List[Dict]] = {}
    standalone: List[Dict] = []

    for event in events:
        parent_id = event.get("parent_event_id")
        if parent_id:
            event_groups.setdefault(parent_id, []).append(event)
        else:
            event_id = event.get("event_id") or event.get("id")
            if event_id and any(e.get("parent_event_id") == event_id for e in events):
                event_groups.setdefault(event_id, []).append(event)
            else:
                standalone.append(event)

    sections = []

    for event in standalone:
        sections.append(_format_single_event(event))

    for parent_id, group in event_groups.items():
        if len(group) > 1:
            sections.append(_format_evolution_timeline(group))
        else:
            sections.append(_format_single_event(group[0]))

    # [cleanup] return "\n\n".join(sections) if sections else "今日无重大事件"


def _format_single_event(event: Dict) -> str:
    """格式化单个事件"""
    severity = event.get("severity") or "info"
    icon = {"critical": "🔴", "warning": "🟡", "info": "🔵"}.get(severity, "🔵")

    # [cleanup] event_type = event.get("event_type") or event.get("display_name") or "事件"
    md = f"### {icon} {event_type}\n\n"
    # [cleanup] md += f"**严重度**: {severity} | **影响分**: {event.get('impact_score', 0)}\n\n"

    parent_id = event.get("parent_event_id")
    parent_summary = event.get("parent_summary")
    if parent_id and parent_summary:
        pass

    summary = event.get("summary") or event.get("description", "")
    if summary:
        md += f"{summary}\n\n"

    entities = event.get("entities", []) or []
    if entities:
        pass

    start_time = event.get("start_time", "")
    if start_time:
        pass

    from utils.source_merger import SourceMerger
    merger = SourceMerger()
    source_attr = merger.format_source_attribution(event)
    md += f"{source_attr}\n\n"

    return md


def _format_evolution_timeline(group: List[Dict]) -> str:
    """格式化事件演化时间线"""
    group.sort(key=lambda x: str(x.get("start_time", "")))

    main_event = group[0]
    severity = main_event.get("severity") or "info"
    icon = {"critical": "🔴", "warning": "🟡", "info": "🔵"}.get(severity, "🔵")

    # [cleanup] event_type = main_event.get("event_type") or main_event.get("display_name") or "事件"
    # [cleanup] md = f"### {icon} {event_type}(持续进展)\n\n"
    # [cleanup] md += f"**严重度**: {severity} | **进展次数**: {len(group)}\n\n"
    # [cleanup] md += "**进展时间线**:\n"

    for i, event in enumerate(group, 1):
        parent_id = event.get("parent_event_id")
        marker = "🆕" if (i == 1 and not parent_id) else "🔄"
        start_time = str(event.get("start_time", ""))[:19]
        summary = event.get("summary") or event.get("description", "")
        md += f"- {marker} {start_time}: {summary}\n"

    all_entities = set()
    for event in group:
        ents = event.get("entities", []) or []
        all_entities.update(str(e) for e in ents)

    if all_entities:

        pass

    from utils.source_merger import SourceMerger
    merger = SourceMerger()
    aggregated_sources = set()
    for event in group:
        for s in (event.get("unique_sources") or event.get("sources") or []):
            aggregated_sources.add(s)
    if aggregated_sources:
        aggregated_event = {
            "source_count": len(aggregated_sources),
            "source_diversity": len(aggregated_sources),
            "unique_sources": list(aggregated_sources),
            "multi_source_verified": len(aggregated_sources) >= 2,
        }
        source_attr = merger.format_source_attribution(aggregated_event)
    else:
        source_attr = merger.format_source_attribution(main_event)
    md += f"\n{source_attr}\n"

    return md


def fallback_report(
    date_str: str,
    es_stats: Dict[str, any],
    neo4j_data: Dict[str, any],
) -> str:
    """生成基础报告(LLM 调用失败时的降级方案)"""
    lines = [
        # [cleanup] f"# OmniLog Intelligence 每日报告 - {date_str}\n",
        # [cleanup] "## 1. 信息概览\n",
        # [cleanup] f"当日共采集 **{es_stats['total_docs']}** 条文档.\n",
    ]

    if es_stats["top_tags"]:
        lines.append("Tags: " + ", ".join(
            f"{t['tag']}({t['count']})" for t in es_stats["top_tags"][:10]
        ))

    events = neo4j_data.get("events", [])
    # [cleanup] lines.append("\n## 2. 关键事件及摘要\n")
    if events:
        for i, event in enumerate(events[:10], 1):
            lines.append(f"{i}. {event.get('summary', 'N/A')}")
    else:
        pass  # [fixed empty block]

    entities = neo4j_data.get("entities", [])
    # [cleanup] lines.append("\n## 3. 实体关联图谱描述\n")
    if entities:
        lines.append(f"Active entities: {len(entities)}")
    relations = neo4j_data.get("entity_relations", [])
    if relations:
        lines.append(f"Entity relations: {len(relations)}")
    anomaly_entities = [e for e in entities if e.get("is_anomaly")]
    if anomaly_entities:
        lines.append("Anomaly entities: " + ", ".join(e["name"] for e in anomaly_entities))
    else:
        pass  # [fixed empty block]

    paths = neo4j_data.get("impact_paths", [])
    # [cleanup] lines.append("\n## 5. 潜在影响推演\n")
    if paths:
        for path in paths[:5]:
            desc = path.get("description", "N/A")
            conf = path.get("confidence") or 0
            lines.append(f"- {desc} (confidence: {conf:.0%})")
    else:
        pass  # [fixed empty block]

    return "\n".join(lines)
