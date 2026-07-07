"""Intelligence brief generator — multi-level structured intelligence products.

Produces three brief types:
- **executive**: One-page executive summary (top N events + key entities + trends)
- **sector**: Domain-specific deep-dive (e.g. tech, energy, finance)
- **flash**: Event-driven immediate alert brief with minimal turnaround

Each brief uses LLM + RAG + Neo4j context and is stored in PostgreSQL for
distribution.

Reference: WorldMonitor AI-powered news brief synthesis.
"""

import json
import logging
import os
import uuid
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from enum import Enum
from typing import Any, Dict, List, Optional

from config import get_config
from utils.llm_client import get_llm_client
from utils.timezone import business_now

logger = logging.getLogger(__name__)


class BriefType(str, Enum):
    """Supported intelligence brief types."""

    EXECUTIVE = "executive"
    SECTOR = "sector"
    FLASH = "flash"


@dataclass
class IntelBrief:
    """A structured intelligence brief."""

    brief_id: str
    brief_type: BriefType
    title: str
    summary: str
    markdown: str
    key_findings: List[str] = field(default_factory=list)
    entities: List[Dict[str, Any]] = field(default_factory=list)
    events: List[Dict[str, Any]] = field(default_factory=list)
    sources: List[Dict[str, Any]] = field(default_factory=list)
    confidence: float = 0.5
    classification: str = "internal"
    generated_at: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)


# ── Prompt templates ─────────────────────────────────────────────────


def _executive_prompt(context: Dict[str, Any]) -> str:
    return f"""You are an intelligence analyst producing an **Executive Summary Brief**.

Today's date: {context.get('today', 'Unknown')}
Period covered: Last {context.get('period_hours', 24)} hours

Context:
- Total documents collected: {context.get('doc_count', 0)}
- Top sources: {', '.join(context.get('top_sources', ['N/A'])[:5])}
- Top tags/labels: {', '.join(context.get('top_tags', ['N/A'])[:8])}
- Languages: {', '.join(context.get('languages', ['N/A']))}
- Active entities: {context.get('entity_count', 0)}
- Recent events: {json.dumps(context.get('events', [])[:5], ensure_ascii=False)}

Key entities this period:
{json.dumps(context.get('top_entities', [])[:10], ensure_ascii=False)}

Instructions:
1. Produce a concise executive summary (2-3 paragraphs).
2. Highlight the 3-5 most significant developments.
3. List key findings as bullet points.
4. Rate overall intelligence significance (Low / Moderate / High / Critical).
5. Output as structured Markdown with sections: Summary, Key Findings, Entity Spotlight, Outlook.

Output format:
```markdown
# Executive Brief: {{date}}

## Summary
...

## Key Findings
- ...

## Entity Spotlight
- ...

## Outlook
...

**Significance**: {{level}}
```"""


def _sector_prompt(context: Dict[str, Any]) -> str:
    sector = context.get("sector", "technology")
    return f"""You are an intelligence analyst producing a **Sector Brief** focused on **{sector}**.

Today's date: {context.get('today', 'Unknown')}
Period: Last {context.get('period_hours', 24)} hours

Sector-specific context:
- Documents: {context.get('doc_count', 0)}
- Key entities in sector: {json.dumps(context.get('top_entities', [])[:8], ensure_ascii=False)}
- Relevant events: {json.dumps(context.get('events', [])[:5], ensure_ascii=False)}

Instructions:
1. Analyze the most important developments in the {sector} sector.
2. Identify trends, risks, and opportunities.
3. Compare against previous period where possible.
4. Output as structured Markdown.

Output format:
```markdown
# Sector Brief: {sector} — {{date}}

## Overview
...

## Key Developments
- ...

## Risk Assessment
- ...

## Opportunities
- ...

## Outlook
```"""


def _flash_prompt(context: Dict[str, Any]) -> str:
    return f"""You are an intelligence analyst producing a **Flash Brief** — immediate alert.

Trigger event:
{json.dumps(context.get('trigger_event', {}), ensure_ascii=False)}

Associated entities:
{json.dumps(context.get('entities', [])[:5], ensure_ascii=False)}

Supporting sources:
{json.dumps(context.get('sources', [])[:3], ensure_ascii=False)}

Confidence assessment:
{json.dumps(context.get('confidence_info', {}), ensure_ascii=False)}

Instructions:
1. Summarize what happened in 2-3 sentences.
2. Assess initial impact (what does this change?).
3. State confidence level and information gaps.
4. Recommend immediate attention items.
5. Output as concise structured Markdown.

Output format:
```markdown
# FLASH: {{title}}

## What Happened
...

## Initial Assessment
...

## Confidence
...

## Recommended Actions
- ...
```"""


# ── Brief Generator ──────────────────────────────────────────────────


class IntelBriefGenerator:
    """Generate intelligence briefs using LLM + RAG context."""

    PROMPTS = {
        BriefType.EXECUTIVE: _executive_prompt,
        BriefType.SECTOR: _sector_prompt,
        BriefType.FLASH: _flash_prompt,
    }

    # Storage: PostgreSQL-backed
    _TABLE = "daily_reports"  # Reuses the reports table

    async def generate(
        self,
        brief_type: BriefType,
        context: Dict[str, Any],
        persist: bool = True,
    ) -> IntelBrief:
        """Generate a brief.

        Args:
            brief_type: Type of brief to produce.
            context: Data context dict (varies by brief type).
            persist: If True, save to PostgreSQL.

        Returns:
            IntelBrief with generated content.
        """
        prompt_fn = self.PROMPTS.get(brief_type)
        if not prompt_fn:
            raise ValueError(f"Unknown brief type: {brief_type}")

        # Collect context data
        enriched = await self._enrich_context(brief_type, context)
        prompt = prompt_fn(enriched)

        # LLM call
        llm = get_llm_client()
        brief_text = await llm.generate(
            system_prompt=(
                "You are a professional intelligence analyst. Produce clear, "
                "concise, evidence-based intelligence briefs. Use Markdown."
            ),
            user_prompt=prompt,
            temperature=0.3,
        )

        # Parse result
        brief_id = f"brief_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        title = self._extract_title(brief_text, brief_type)

        now_dt = datetime.now(timezone.utc)

        brief = IntelBrief(
            brief_id=brief_id,
            brief_type=brief_type,
            title=title,
            summary=brief_text[:500],
            markdown=brief_text,
            key_findings=self._extract_findings(brief_text),
            entities=enriched.get("top_entities", enriched.get("entities", [])),
            events=enriched.get("events", []),
            sources=enriched.get("sources", []),
            confidence=enriched.get("confidence", 0.5),
            classification=enriched.get("classification", "internal"),
            generated_at=now,
            metadata={
                "doc_count": enriched.get("doc_count", 0),
                "period_hours": enriched.get("period_hours", 24),
                "sector": enriched.get("sector"),
                "trigger_event_id": enriched.get("trigger_event", {}).get("event_id"),
            },
        )

        if persist:
            await self._persist(brief)

        logger.info(
            "Generated %s brief '%s' (id=%s)",
            brief_type.value,
            title,
            brief_id,
        )
        return brief

    async def generate_from_report(
        self,
        report_id: str,
        brief_types: Optional[List[BriefType]] = None,
    ) -> List[IntelBrief]:
        """Generate briefs from an existing daily report."""
        brief_types = brief_types or [BriefType.EXECUTIVE]

        # Load report context from DB
        context = await self._load_report_context(report_id)
        if not context:
            logger.warning("Report %s not found, skipping brief generation", report_id)
            return []

        results = []
        for bt in brief_types:
            brief = await self.generate(bt, {**context, "report_id": report_id})
            results.append(brief)
        return results

    # ── internal ────────────────────────────────────────────────────

    async def _enrich_context(
        self, brief_type: BriefType, base: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Add dynamic context from Neo4j/ES based on brief type."""
        ctx = dict(base)
        ctx.setdefault("today", business_now().strftime("%Y-%m-%d"))
        ctx.setdefault("period_hours", 24)

        try:
            from utils.db_pool import get_pool_manager
            pool = await get_pool_manager()
            driver = await pool.neo4j.get_driver()

            async with driver.session() as session:
                # Get active events
                result = await session.run(
                    """
                    MATCH (ev:Event)
                    RETURN ev.id as id, ev.summary as summary,
                           ev.severity as severity, ev.type as type
                    ORDER BY ev.severity DESC
                    LIMIT 20
                    """
                )
                events_data = [dict(r) async for r in result]
                if events_data:
                    ctx["events"] = events_data

                # Get top entities by mention count
                result = await session.run(
                    """
                    MATCH (e:Entity)
                    WHERE e.updated_at > (timestamp() - 7 * 24 * 60 * 60 * 1000)
                    RETURN e.name as name, e.type as type,
                           e.criticality_score as score,
                           e.tier as tier
                    ORDER BY e.criticality_score DESC NULLS LAST
                    LIMIT 20
                    """
                )
                top_entities = [dict(r) async for r in result]
                if top_entities:
                    ctx["top_entities"] = top_entities

            # ES stats
            try:
                es = await pool.elasticsearch.get_client()
                stats = await es.count(index="omnilog_docs")
                ctx["doc_count"] = stats.get("count", 0)
            except Exception:
                pass

        except Exception as e:
            logger.warning("Context enrichment failed: %s", e)

        return ctx

    async def _load_report_context(self, report_id: str) -> Optional[Dict]:
        """Load an existing report from PostgreSQL for brief generation."""
        try:
            from utils.db_pool import get_pool_manager
            pool = await get_pool_manager()
            pg = await pool.postgres.get_pool()
            async with pg.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT title, summary, full_markdown, metadata, rag_info "
                    "FROM daily_reports WHERE id = $1",
                    report_id,
                )
            if row:
                return {
                    "title": row["title"],
                    "summary": row["summary"],
                    "full_markdown": row["full_markdown"],
                    "metadata": row.get("metadata", {}),
                    "rag_info": row.get("rag_info", {}),
                }
        except Exception as e:
            logger.warning("Failed to load report context: %s", e)
        return None

    async def _persist(self, brief: IntelBrief) -> None:
        """Save the brief to PostgreSQL daily_reports table."""
        try:
            from utils.db_pool import get_pool_manager
            pool = await get_pool_manager()
            pg = await pool.postgres.get_pool()
            async with pg.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO daily_reports
                        (id, report_date, title, summary, full_markdown,
                         metadata, classification)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (id) DO UPDATE SET
                        summary = EXCLUDED.summary,
                        metadata = EXCLUDED.metadata
                    """,
                    brief.brief_id,
                    business_now().date(),
                    brief.title,
                    brief.summary,
                    brief.markdown,
                    json.dumps(brief.metadata),
                    brief.classification,
                )
        except Exception as e:
            logger.error("Failed to persist brief %s: %s", brief.brief_id, e)

    @staticmethod
    def _extract_title(text: str, brief_type: BriefType) -> str:
        """Extract the title from the generated markdown."""
        for line in text.split("\n"):
            line = line.strip()
            if line.startswith("# ") or line.startswith("# "):
                title = line.lstrip("#").strip()
                if len(title) < 120:
                    return title
                return title[:117] + "..."
            if line.startswith("## ") and brief_type == BriefType.FLASH:
                return line.lstrip("#").strip()
        # Fallback
        prefix_map = {
            BriefType.EXECUTIVE: "Executive Brief",
            BriefType.SECTOR: "Sector Brief",
            BriefType.FLASH: "Flash Brief",
        }
        today = business_now().strftime("%Y-%m-%d")
        return f"{prefix_map.get(brief_type, 'Brief')} — {today}"

    @staticmethod
    def _extract_findings(text: str) -> List[str]:
        """Extract bullet-point findings from generated markdown."""
        findings = []
        in_findings = False
        for line in text.split("\n"):
            stripped = line.strip()
            if "Key Findings" in stripped or "key findings" in stripped.lower():
                in_findings = True
                continue
            if in_findings:
                if stripped.startswith("- ") or stripped.startswith("* "):
                    findings.append(stripped.lstrip("-* ").strip())
                elif stripped.startswith("##"):
                    in_findings = False
        return findings[:10]


# Global singleton
_generator: Optional[IntelBriefGenerator] = None


def get_brief_generator() -> IntelBriefGenerator:
    global _generator
    if _generator is None:
        _generator = IntelBriefGenerator()
    return _generator
