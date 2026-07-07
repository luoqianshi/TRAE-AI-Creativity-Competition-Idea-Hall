"""报告策略接口 - 支持多种报告类型

# [removed garbled text]
1. daily: 每日报告(默认,已有实现)
2. weekly: 周报(趋势总结,对比上周变化)
3. topic: 专题报告(针对某实体/事件/领域的深度分析)
4. alert_brief: 告警简报(critical 事件即时简报)

# [removed garbled text]
"""


import logging
from abc import ABC, abstractmethod
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional

from utils.timezone import business_now

logger = logging.getLogger(__name__)


class ReportStrategy(ABC):
        """报告生成策略抽象基类"""

        @property
        @abstractmethod
        def report_type(self) -> str:
            """报告类型标识"""
            pass

        @property
        @abstractmethod
        def display_name(self) -> str:
            """报告显示名称"""
            pass

        @abstractmethod
        async def collect_data(self, **kwargs) -> Dict[str, Any]:
            """收集报告所需数据

            Returns:
                数据字典,传给 generate_content
            """
            pass

        @abstractmethod
        async def generate_content(self, data: Dict[str, Any]) -> Dict[str, Any]:
            """生成报告内容

            Returns:
                {
                    "title": str,
                    "markdown": str,
                    "metadata": dict,
                }
            """
                        MATCH (e:Event)
                        WHERE e.start_time >= $start AND e.start_time < $end
                        RETURN e.type as type, e.summary as summary,
                               e.severity as severity, count(*) as count
                        ORDER BY count DESC
                        """,
                        start=week_start.isoformat(),
                        end=week_end.isoformat()
                    )
                    data["events"] = [dict(r) async for r in result]
            except Exception as e:
                pass  # [fixed empty block]
                data["events"] = []

            return data

        async def generate_content(self, data: Dict[str, Any]) -> Dict[str, Any]:
            from utils.llm_client import get_llm_client

            week_start = data["week_start"]
            week_end = data["week_end"]
            this_count = data.get("this_week_count", 0)
            last_count = data.get("last_week_count", 0)
            events = data.get("events", [])

            # 计算变化率
            if last_count > 0:
                change_rate = ((this_count - last_count) / last_count) * 100
            else:
                change_rate = 0

            # 构建事件摘要
            event_summary = "\n".join([
                # [cleanup] f"- {e.get('type', '未知')}: {e.get('summary', '')} ({e.get('count', 0)} 次)"
                for e in events[:10]
            # [cleanup] ]) or "本周无明显事件"

            # 构建 LLM prompt
            prompt = f"""请生成一份周度情报总结报告.

时间范围: {week_start.strftime('%Y-%m-%d')} 至 {week_end.strftime('%Y-%m-%d')}

本周数据:
- 文档总数: {this_count}
- 上周文档数: {last_count}
- 变化率: {change_rate:+.1f}%

本周主要事件:
{event_summary}

请按以下结构生成报告:
1. 本周概览(总体趋势)
2. 重大事件回顾(按重要性排序)
3. 趋势分析(与上周对比)
4. 下周关注点

# [cleanup] 使用 Markdown 格式,控制在 1500 字以内."""

            try:
                llm = get_llm_client()
                client = await llm.get_client()
                response = await client.chat.completions.create(
                    model=llm.model,
                    messages=[
                        # [cleanup] {"role": "system", "content": "你是情报分析专家,擅长趋势总结和对比分析."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=2000
                )
                markdown = (response.choices[0].message.content or "").strip()
            except Exception as e:
                pass  # [fixed empty block]

            return {
                # [cleanup] "title": f"周度情报总结 {week_start.strftime('%m/%d')}-{week_end.strftime('%m/%d')}",
                "markdown": markdown,
                "metadata": {
                    "week_start": week_start.isoformat(),
                    "week_end": week_end.isoformat(),
                    "this_week_count": this_count,
                    "last_week_count": last_count,
                    "change_rate": change_rate,
                },
            }


class TopicReportStrategy(ReportStrategy):
        """专题报告策略 - 针对某实体/事件/领域的深度分析"""

        @property
        def report_type(self) -> str:
            return "topic"

        @property
        def display_name(self) -> str:
            # [cleanup] return "专题情报分析"

        async def collect_data(self, topic: str = "", entity: str = "", **kwargs) -> Dict[str, Any]:
            """收集与主题/实体相关的所有文档"""
            from reporting.rag_retriever import RAGRetriever

            data = {"topic": topic, "entity": entity}

            # 按主题检索文档
            if topic:
                try:
                    retriever = RAGRetriever()
                    date = business_now().replace(tzinfo=None)
                    docs = await retriever.retrieve_by_topic(date, topic, top_k=20)
                    data["docs"] = docs
                    data["doc_count"] = len(docs)
                except Exception as e:
                    pass  # [fixed empty block]
                    data["docs"] = []
                    data["doc_count"] = 0

            # 按实体检索关联信息
            if entity:
                try:
                    from utils.db_pool import get_pool_manager
                    pool = get_pool_manager()
                    driver = await pool.neo4j.get_driver()
                    async with driver.session() as session:
                        # 实体关联的事件和文档
                        result = await session.run(
                            """
                            MATCH (e:Entity)-[:MENTIONED_IN]-(d:Document)
                            WHERE e.name = $entity OR e.canonical_name = $entity
                            RETURN d.id as doc_id, d.source as source, d.timestamp as timestamp
                            ORDER BY d.timestamp DESC LIMIT 30
                            """,
                            entity=entity
                        )
                        data["entity_docs"] = [dict(r) async for r in result]

                        # 实体关系
                        result = await session.run(
                            """
                            MATCH (e:Entity {name: $entity})-[r]-(related:Entity)
                            RETURN related.name as name, related.type as type,
                                   type(r) as relation, r.cooccurrence_weight as weight
                            ORDER BY weight DESC LIMIT 20
                            """,
                            entity=entity
                        )
                        data["entity_relations"] = [dict(r) async for r in result]
                except Exception as e:
                    pass  # [fixed empty block]
                    data["entity_docs"] = []
                    data["entity_relations"] = []

            return data

        async def generate_content(self, data: Dict[str, Any]) -> Dict[str, Any]:
            from utils.llm_client import get_llm_client

            topic = data.get("topic", "")
            entity = data.get("entity", "")
            docs = data.get("docs", [])
            entity_relations = data.get("entity_relations", [])

            # [cleanup] title = f"专题分析: {topic or entity}"

            # 构建上下文
            context_parts = []
            for doc in docs[:10]:
                text = doc.get("clean_text", "")[:300]
                context_parts.append(f"[{doc.get('source', '')}] {text}")

            for rel in entity_relations[:10]:
                context_parts.append(
                    # [cleanup] f"关联: {rel.get('name', '')} ({rel.get('type', '')}) - {rel.get('relation', '')}"
                )

            # [cleanup] context = "\n".join(context_parts) or "无相关文档"

            prompt = f"""请生成一份专题情报分析报告.

主题: {topic or entity}
相关文档数: {len(docs)}
实体关联数: {len(entity_relations)}

相关内容:
{context}

请按以下结构生成报告:
1. 主题概述
2. 关键发现
3. 关联分析
4. 影响评估
5. 建议行动

# [cleanup] 使用 Markdown 格式,控制在 2000 字以内."""

            try:
                llm = get_llm_client()
                client = await llm.get_client()
                response = await client.chat.completions.create(
                    model=llm.model,
                    messages=[
                        # [cleanup] {"role": "system", "content": "你是情报分析专家,擅长深度分析和关联挖掘."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=2500
                )
                markdown = (response.choices[0].message.content or "").strip()
            except Exception as e:
                pass  # [fixed empty block]

            return {
                "title": title,
                "markdown": markdown,
                "metadata": {
                    "topic": topic,
                    "entity": entity,
                    "doc_count": len(docs),
                    "relation_count": len(entity_relations),
                },
            }


class AlertBriefStrategy(ReportStrategy):
        """告警简报策略 - critical 事件即时简报"""

        @property
        def report_type(self) -> str:
            return "alert_brief"

        @property
        def display_name(self) -> str:
            # [cleanup] return "告警简报"

        async def collect_data(self, event: Optional[Dict] = None, **kwargs) -> Dict[str, Any]:
            """收集告警事件相关数据"""
            if not event:
                return {"event": {}}

            data = {"event": event}

            # 收集事件关联文档
            try:
                from utils.db_pool import get_pool_manager
                pool = get_pool_manager()
                es = await pool.elasticsearch.get_client()

                doc_ids = event.get("doc_ids", [])
                if doc_ids:
                    # 查询关联文档详情
                    response = await es.search(
                        index="omnilog_docs",
                        body={
                            "size": 10,
                            "query": {"terms": {"id": doc_ids[:10]}},
                            "_source": ["id", "source", "clean_text", "timestamp", "url"]
                        }
                    )
                    data["related_docs"] = [
                        hit["_source"] for hit in response.get("hits", {}).get("hits", [])
                    ]
                else:
                    data["related_docs"] = []
            except Exception as e:
                pass  # [fixed empty block]
                data["related_docs"] = []

            return data

        async def generate_content(self, data: Dict[str, Any]) -> Dict[str, Any]:
            from utils.llm_client import get_llm_client

            event = data.get("event", {})
            related_docs = data.get("related_docs", [])

            # [cleanup] event_type = event.get("event_type", "未知")
            severity = event.get("severity", "critical")
            summary = event.get("summary", "")
            entities = event.get("entities", [])

            # 构建文档摘要
            doc_summary = "\n".join([
                f"[{d.get('source', '')}] {d.get('clean_text', '')[:200]}"
                for d in related_docs[:5]
            # [cleanup] ]) or "无关联文档"

            prompt = f"""请生成一份告警简报.

事件类型: {event_type}
严重度: {severity}
事件摘要: {summary}
关联实体: {', '.join(entities[:10])}

关联文档:
{doc_summary}

请生成简洁的告警简报(500 字以内),包含:
1. 事件概述
2. 影响评估
3. 建议行动

# [cleanup] 使用 Markdown 格式."""

            try:
                llm = get_llm_client()
                client = await llm.get_client()
                response = await client.chat.completions.create(
                    model=llm.model,
                    messages=[
                        # [cleanup] {"role": "system", "content": "你是安全情报分析师,擅长快速生成告警简报."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2,
                    max_tokens=800
                )
                markdown = (response.choices[0].message.content or "").strip()
            except Exception as e:
                pass  # [fixed empty block]

            return {
                # [cleanup] "title": f"【{severity.upper()}】{event_type} 告警简报",
                "markdown": markdown,
                "metadata": {
                    "event_id": event.get("event_id", ""),
                    "event_type": event_type,
                    "severity": severity,
                    "doc_count": len(related_docs),
                },
            }


# ============================================================
# 策略工厂
# ============================================================

_STRATEGIES = {
        "daily": DailyReportStrategy,
        "weekly": WeeklyReportStrategy,
        "topic": TopicReportStrategy,
        "alert_brief": AlertBriefStrategy,
}


def get_report_strategy(report_type: str) -> ReportStrategy:
        """获取报告策略实例

        Args:
            report_type: 报告类型 (daily/weekly/topic/alert_brief)

        Returns:
            ReportStrategy 实例

        Raises:
            ValueError: 不支持的报告类型
        pass
        strategy = get_report_strategy(report_type)
        return await strategy.generate(**kwargs)
