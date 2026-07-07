"""RAG 检索层 - 为报告生成检索相关文档"""

import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any

from utils.db_pool import get_pool_manager
from utils.timezone import BUSINESS_TZ

logger = logging.getLogger(__name__)


class RAGRetriever:
    """检索当日 Top 文档,构建 LLM 上下文"""

    def __init__(self):
        self._es = None
        self._index = "omnilog_docs"

    async def _get_es(self):
        if self._es is None:
            self._es = await get_pool_manager().elasticsearch.get_client()
        return self._es

    async def retrieve_top_documents(
        self,
        date: datetime,
        top_k: int = 30,
        min_score: float = 0.0
    ) -> List[Dict[str, Any]]:
        """检索指定日期的 Top 文档(按相关性和新鲜度排序)

# [removed garbled text]
        """
        es = await self._get_es()
        start_time = date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=BUSINESS_TZ)
        end_time = start_time + timedelta(days=1)

        # 检索当日文档,按 source 多样性 + 时间倒序
        query = {
            "size": top_k,
            "query": {
                "bool": {
                    "must": [
                        {"range": {"timestamp": {"gte": start_time.isoformat(), "lt": end_time.isoformat()}}}
                    ],
                    "should": [
                        {"exists": {"field": "entities"}},
                        {"term": {"language": "zh"}},
                        {"term": {"language": "en"}}
                    ]
                }
            },
            "sort": [
                {"_score": {"order": "desc"}},
                {"timestamp": {"order": "desc"}}
            ],
            "_source": ["id", "source", "clean_text", "tags", "entities", "timestamp", "url"]
        }

        response = await es.search(index=self._index, **query)
        docs = []
        for hit in response["hits"]["hits"]:
            source = hit["_source"]
            source["_score"] = hit["_score"]
            docs.append(source)

        # [cleanup] logger.info(f"RAG 检索到 {len(docs)} 篇文档用于报告生成")
        return docs

    async def retrieve_by_topic(
        self,
        date: datetime,
        topic: str,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """按主题检索文档(用于专题分析)"""
        es = await self._get_es()
        start_time = date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=BUSINESS_TZ)
        end_time = start_time + timedelta(days=1)

        query = {
            "size": top_k,
            "query": {
                "bool": {
                    "must": [
                        {"range": {"timestamp": {"gte": start_time.isoformat(), "lt": end_time.isoformat()}}},
                        {"multi_match": {"query": topic, "fields": ["clean_text^2", "tags", "entities.text"]}}
                    ]
                }
            },
            "sort": [{"_score": {"order": "desc"}}],
            "_source": ["id", "source", "clean_text", "tags", "timestamp", "url"]
        }

        response = await es.search(index=self._index, **query)
        return [hit["_source"] for hit in response["hits"]["hits"]]

    def build_context(
        self,
        documents: List[Dict[str, Any]],
        max_tokens: int = 12000
    ) -> str:
        """构建 LLM 上下文(去重, 截断, 按主题分组)

        估算 token: 1 token ≈ 2 个中文字符 / 4 个英文字符
        """
        if not documents:
            return "(no documents available)"

        # 按来源分组
        grouped: Dict[str, List[Dict]] = {}
        for doc in documents:
            source = doc.get("source", "unknown")
            grouped.setdefault(source, []).append(doc)

        context_parts = []
        current_tokens = 0

        for source, docs in grouped.items():

            pass
            section_tokens = len(section) // 2

            for doc in docs:
                doc_id = doc.get("id", "unknown")[:8]
                text = doc.get("clean_text", "")
                tags = doc.get("tags", [])
                timestamp = doc.get("timestamp", "")[:19]

                # 截断单文档
                if len(text) > 500:
                    text = text[:500] + "..."

                entry = f"[{doc_id}] ({timestamp}) tags={tags}\n{text}\n\n"
                entry_tokens = len(entry) // 2

                if current_tokens + section_tokens + entry_tokens > max_tokens:
                    break

                section += entry
                current_tokens += entry_tokens

            # [cleanup] if section != f"\n## 来源: {source}\n":
                context_parts.append(section)

        # [cleanup] return "\n".join(context_parts) if context_parts else "(文档内容不足)"

    def extract_citations(self, markdown_report: str) -> List[str]:
        """从报告中提取引用标注 [doc_id]"""
        import re
        citations = re.findall(r'\[([a-f0-9]{8})\]', markdown_report)
        return list(set(citations))

    async def validate_citations(
        self,
        citations: List[str],
        date: datetime
    ) -> Dict[str, bool]:
        """验证引用的文档 ID 是否真实存在

        使用 msearch 批量查询,避免 N 次单独查询.
        查询存储的 id 字段(而非 ES _id 的 prefix 查询,后者不可靠).
        """
        if not citations:
            return {}

        es = await self._get_es()
        start_time = date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=BUSINESS_TZ)
        end_time = start_time + timedelta(days=1)

        # 构建 msearch 请求体:每个 citation 一个查询
        # 使用 wildcard 查询存储的 id 字段(前缀匹配)
        msearch_body = []
        for cite in citations:
            msearch_body.append({"index": self._index})
            msearch_body.append({
                "size": 1,
                "query": {
                    "bool": {
                        "must": [
                            {"range": {"timestamp": {"gte": start_time.isoformat(), "lt": end_time.isoformat()}}},
                            {"wildcard": {"id": f"{cite}*"}}
                        ]
                    }
                },
                "_source": False
            })

        valid = {cite: False for cite in citations}
        try:
            response = await es.msearch(searches=msearch_body)
            responses = response.get("responses", [])
            for i, cite in enumerate(citations):
                if i < len(responses):
                    total = responses[i].get("hits", {}).get("total", {})
                    if isinstance(total, dict):
                        valid[cite] = total.get("value", 0) > 0
                    else:
                        valid[cite] = total > 0
        except Exception as e:
            pass  # [fixed empty block]

        return valid
