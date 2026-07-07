"""每日报告生成器 - 从多源数据生成结构化深度报告

职责:
- 协调数据收集(ES + Neo4j)
- RAG 检索 + 引用验证
- LLM 报告生成
- 存储(PG 主路径 + MongoDB 降级)

数据收集 → reporting.data_collector.ReportDataCollector
存储     → reporting.report_storage.ReportStorage
HTML 渲染 → reporting.html_renderer
差异计算 → reporting.diff
"""

import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional

from config import get_config
from utils.llm_client import get_llm_client
from utils.timezone import BUSINESS_TZ, business_now
from utils.tracing import span
from reporting.html_renderer import (
    markdown_to_html,
    generate_event_section,
)
from reporting.diff import compute_diff
from reporting.data_collector import ReportDataCollector
from reporting.report_storage import ReportStorage

logger = logging.getLogger(__name__)


class ReportGenerator:
    """每日报告生成器 - 编排数据收集、生成和存储"""

    def __init__(self, use_pool_manager: bool = True):
        """初始化报告生成器

        Args:
            use_pool_manager: 是否优先使用项目统一的 ConnectionPoolManager.
                在 main.py lifespan 初始化后应为 True;独立进程运行时可设为 False.
        """
        self._use_pool_manager = use_pool_manager
        self._data_collector: Optional[ReportDataCollector] = None
        self._storage: Optional[ReportStorage] = None
        self._pool_manager = None

    async def _get_pool_manager(self):
        if self._pool_manager is None:
            from utils.db_pool import get_pool_manager
            self._pool_manager = get_pool_manager()
        return self._pool_manager

    async def _get_data_collector(self) -> ReportDataCollector:
        """Get or create a ReportDataCollector with shared pool manager."""
        if self._data_collector is None:
            self._data_collector = ReportDataCollector(
                use_pool_manager=self._use_pool_manager,
            )
        return self._data_collector

    async def _get_storage(self) -> ReportStorage:
        """Get or create a ReportStorage with shared pool manager."""
        if self._storage is None:
            config = get_config()
            self._storage = ReportStorage(
                minio_endpoint=config.minio.endpoint,
                minio_access_key=config.minio.access_key,
                minio_secret_key=config.minio.secret_key,
                mongo_uri=config.mongodb.url,
                mongo_db=config.mongodb.database,
                use_pool_manager=self._use_pool_manager,
            )
        return self._storage

    async def _generate_report_with_llm(
        self,
        date_str: str,
        es_stats: Dict[str, Any],
        neo4j_data: Dict[str, Any],
        rag_context: str,
    ) -> str:
        """Call LLM to generate the daily report markdown."""
        llm = await get_llm_client()

        system_prompt = (
            "You are an intelligence analyst. Generate a structured daily intelligence report "
            "in Markdown format based on the collected data below.\n\n"
            "Include sections:\n"
            "1. Executive Summary\n"
            "2. Key Events\n"
            "3. Entity Activity\n"
            "4. Impact Analysis\n"
            "5. Trend Notes\n\n"
            "Use headings (##), bullet lists, and bold for emphasis. Be concise and factual."
        )

        user_prompt = (
            f"Date: {date_str}\n\n"
            f"Document Statistics:\n"
            f"- Total documents collected: {es_stats.get('total_docs', 0)}\n"
            f"- Top tags: {', '.join(t['tag'] for t in es_stats.get('top_tags', [])[:5])}\n"
            f"- Top sources: {', '.join(s['source'] for s in es_stats.get('top_sources', [])[:5])}\n\n"
            f"Events detected: {len(neo4j_data.get('events', []))}\n"
            f"Active entities: {len(neo4j_data.get('entities', []))}\n"
            f"Impact paths: {len(neo4j_data.get('impact_paths', []))}\n\n"
        )

        if neo4j_data.get("events"):
            user_prompt += "Key Events:\n"
            for ev in neo4j_data["events"][:10]:
                summary = ev.get("summary", "")[:200]
                user_prompt += f"- {summary}\n"
            user_prompt += "\n"

        if rag_context:
            user_prompt += f"Additional context from related documents:\n{rag_context[:3000]}\n\n"

        user_prompt += "Generate the daily intelligence report in Markdown."

        response = await llm.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=4000,
        )

        return response["choices"][0]["message"]["content"].strip()

    async def generate(self, date: Optional[datetime] = None) -> Dict[str, Any]:
        """生成每日报告

        Args:
            date: 报告日期,默认为昨天

        Returns:
            报告结果字典
        """
        if date is None:
            date = business_now().replace(tzinfo=None) - timedelta(days=1)

        date_str = date.strftime("%Y-%m-%d")

        with span("generate_report", {"date": date_str}):
            logger.info("开始生成报告: %s", date_str)

            # 1. Collect data
            collector = await self._get_data_collector()
            es_stats = await collector.collect_es_stats(date)
            neo4j_data = await collector.collect_neo4j_data(date)

            # 2. RAG retrieval (non-blocking)
            rag_documents: List[Dict[str, Any]] = []
            rag_context = ""
            retriever = None
            try:
                from reporting.rag_retriever import RAGRetriever
                retriever = RAGRetriever()
                rag_documents = await retriever.retrieve_top_documents(date, top_k=30)
                rag_context = retriever.build_context(rag_documents)
            except Exception as e:
                logger.warning("RAG retrieval failed (non-blocking): %s", e)

            # 3. Generate report via LLM
            markdown_report = await self._generate_report_with_llm(
                date_str, es_stats, neo4j_data, rag_context,
            )

            # 4. Validate citations (non-blocking)
            citations: List[str] = []
            citation_validity: Dict[str, bool] = {}
            invalid_count = 0
            if retriever is not None:
                try:
                    citations = retriever.extract_citations(markdown_report)
                    citation_validity = await retriever.validate_citations(citations, date)
                    invalid_count = sum(1 for v in citation_validity.values() if not v)
                except Exception:
                    pass

            # 5. Generate event evolution section
            try:
                event_section = generate_event_section(neo4j_data.get("events", []))
                if event_section:
                    markdown_report += "\n\n" + event_section
            except Exception as e:
                logger.warning("Event section generation failed: %s", e)

            # 6. Convert to HTML and store to MinIO
            html_content = markdown_to_html(markdown_report, date_str)
            storage = await self._get_storage()
            html_url = await storage.store_html_to_minio(html_content, date_str)

            # 7. Compute diff from previous day
            try:
                async def _get_mongo_for_diff():
                    pool = await storage._get_pool_manager()
                    mongo = await pool.mongodb.get_client()
                    return mongo[get_config().mongodb.database]

                diff_text = await compute_diff(
                    markdown_report, date,
                    storage._get_pg_pool,
                    _get_mongo_for_diff,
                )
            except Exception as e:
                logger.warning("Diff computation failed (non-blocking): %s", e)
                diff_text = ""

            # 8. Store to PostgreSQL (primary), falls back to MongoDB
            rag_info = {
                "retrieved_docs": len(rag_documents),
                "citations": len(citations),
                "valid_citations": sum(1 for v in citation_validity.values() if v),
                "invalid_citations": invalid_count,
            }
            await storage.store_to_postgres(
                date_str=date_str, markdown_report=markdown_report,
                html_content=html_content, html_url=html_url,
                es_stats=es_stats, neo4j_data=neo4j_data,
                diff_text=diff_text, rag_info=rag_info,
            )

            result = {
                "date": date_str,
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "html_url": html_url,
                "total_docs": es_stats["total_docs"],
                "events_count": len(neo4j_data.get("events", [])),
                "entities_count": len(neo4j_data.get("entities", [])),
                "impact_paths_count": len(neo4j_data.get("impact_paths", [])),
                "has_diff": bool(diff_text),
                "rag": rag_info,
            }

            logger.info("报告生成完成: %s", date_str)
            return result

    async def close(self):
        """关闭所有连接"""
        if self._data_collector:
            await self._data_collector.close()
        if self._storage:
            await self._storage.close()


# ============================================================
# 便捷函数(向后兼容)
# ============================================================

_generator: Optional[ReportGenerator] = None


def _get_generator() -> ReportGenerator:
    """获取全局生成器实例"""
    global _generator
    if _generator is None:
        _generator = ReportGenerator()
    return _generator


async def generate_daily_report(date: Optional[datetime] = None) -> Dict[str, Any]:
    """Generate Daily Report"""
    generator = _get_generator()
    return await generator.generate(date)
