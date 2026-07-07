"""Natural Language Query Translator — NLQ → Cypher / ES Query.

Translates natural language questions into structured database queries using
an LLM, executes them, and returns natural language answers with citations.

Two query modes:
- **graph**: NLQ → Cypher (run against Neo4j knowledge graph)
- **search**: NLQ → ES Query DSL (run against Elasticsearch full-text index)
"""

import json
import logging
import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from utils.llm_client import get_llm_client
from utils.db_pool import get_pool_manager

logger = logging.getLogger(__name__)


def _strip_code_fence(text: str, lang: Optional[str] = None) -> str:
    """从 LLM 输出中剥离 markdown 代码围栏.

    修复: 原代码 `text.strip("```cypher")` 是 str.strip 误用 ——
    strip 删除两端所有出现在字符集中的字符, 而非删除前缀/后缀.
    例如 "CREATE (n)" 中的 C/R/E 会被剥离, 导致 "ATE (n)".
    新实现用正则按前缀/后缀语义剥离.
    """
    s = text.strip()
    # 剥离开头的 ```lang (lang 可选)
    if lang:
        s = re.sub(rf"^```{re.escape(lang)}\s*\n?", "", s)
    else:
        s = re.sub(r"^```[a-zA-Z0-9_+-]*\s*\n?", "", s)
    # 剥离结尾的 ```
    s = re.sub(r"\n?```\s*$", "", s)
    return s.strip()


# 危险 Cypher 关键字黑名单 (用于 LLM 生成查询的最小沙箱)
_DANGEROUS_CYPHER_KEYWORDS = (
    "DELETE", "DETACH DELETE", "REMOVE", "SET ", "CREATE ",
    "MERGE ", "DROP ", "CALL db.schema",
)

# ── Output schemas ──────────────────────────────────────────────────

_CYPHER_GENERATION_PROMPT = """You are a Neo4j Cypher query generator for an intelligence knowledge graph.

The graph has the following schema:

**Node types:**
- (:Entity {entity_id, name, type, criticality_score, risk_score, tier, latitude, longitude})
- (:Document {id, title, source, url, timestamp})
- (:Event {id, type, summary, severity, start_time})
- (:Report {id})
- (:ImpactPath {id, description, confidence})

**Relationship types:**
- (:Entity)-[:MENTIONED_IN {count, confidence}]->(:Document)
- (:Entity)-[:RELATED_TO {predicate, weight}]->(:Entity)
- (:Document)-[:PART_OF]->(:Report)
- (:Event)-[:MENTIONS]->(:Entity)
- (:Event)-[:EVOLUTION_OF]->(:Event)
- (:Event)-[:CAUSED_BY]->(:Event)

**Entity types:** PERSON, ORG, LOCATION, GPE, PRODUCT, TECHNOLOGY, CONCEPT, ASSET
**Event types:** funding, product_launch, security_vuln, personnel_change, merger_acquisition, regulation, partnership, breakthrough, supply_chain_disruption, geopolitical_risk
**Severity levels:** info, warning, critical

Translate the following natural language question into a Cypher query.
Return ONLY valid Cypher (no explanations). Use LIMIT 50 unless specified otherwise.

Question: {question}

Cypher:"""

_ES_GENERATION_PROMPT = """You are an Elasticsearch Query DSL generator for an intelligence document index.

The index `omnilog_docs` has the following mapping:
- id (keyword)
- source (keyword) — e.g. "rss:hacker_news", "rss:techcrunch"
- clean_text (text)
- language (keyword) — "en", "zh-cn", "ja", "ko", "ru", "ar", etc.
- tags (keyword array) — classification labels
- entities (nested): {text, label, confidence}
- timestamp (date)
- url (keyword)

Translate the following natural language question into an ES Query DSL.
Return ONLY valid JSON (no explanations). Use "size": 10 unless specified otherwise.
For full-text search, use "match" or "multi_match" on "clean_text".

Question: {question}

ES Query:"""

_ANSWER_SYNTHESIS_PROMPT = """You are an intelligence analyst answering questions based on query results.

Question: {question}

Query type: {query_type}
Query results: {results}

Produce a concise natural language answer (2-4 paragraphs) that:
1. Directly answers the question
2. References specific data points from the results
3. Notes any confidence level or data limitations
4. Cites source documents or entities where relevant

If the results are empty, say so clearly.
If you cannot answer from the data, say "I cannot answer this from the available data."
"""


@dataclass
class QueryResult:
    """Result of a natural language query."""

    question: str
    query_type: str  # "graph" or "search"
    generated_query: str
    raw_results: List[Dict[str, Any]]
    answer: str
    sources: List[Dict[str, Any]] = field(default_factory=list)
    error: Optional[str] = None


class QueryTranslator:
    """Translate natural language to database queries via LLM."""

    async def ask(
        self,
        question: str,
        query_type: Optional[str] = None,
    ) -> QueryResult:
        """Ask a natural language question.

        Args:
            question: Natural language question.
            query_type: Force "graph" or "search". Auto-detected if None.

        Returns:
            QueryResult with generated query, raw results, and synthesized answer.
        """
        if query_type is None:
            query_type = await self._detect_query_type(question)

        llm = get_llm_client()

        if query_type == "graph":
            return await self._query_graph(question, llm)
        else:
            return await self._query_search(question, llm)

    async def _query_graph(self, question: str, llm) -> QueryResult:
        """NLQ → Cypher → Neo4j → NL answer."""
        # Step 1: Generate Cypher
        prompt = _CYPHER_GENERATION_PROMPT.format(question=question)
        resp = await llm.chat_completion(
            messages=[
                {"role": "system", "content": "You are a Cypher query generator. Output ONLY Cypher."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=500,
        )
        cypher = resp["choices"][0]["message"]["content"].strip()
        # 修复: 用 _strip_code_fence 替代误用的 str.strip
        cypher = _strip_code_fence(cypher, lang="cypher")

        # 修复: 沙箱校验 —— 拒绝 LLM 生成的写操作 (防 prompt injection 破坏图数据)
        cypher_upper = cypher.upper()
        for kw in _DANGEROUS_CYPHER_KEYWORDS:
            if kw in cypher_upper:
                logger.warning(
                    "Refusing to execute dangerous Cypher (contains %s): %s",
                    kw, cypher[:200],
                )
                return QueryResult(
                    question=question,
                    query_type="graph",
                    generated_query=cypher,
                    raw_results=[],
                    answer="Refused: generated Cypher contains write/destructive operation.",
                    sources=[],
                    error=f"safety: blocked keyword '{kw.strip()}'",
                )

        # Step 2: Execute
        raw_results = []
        error = None
        try:
            pool = await get_pool_manager()
            driver = await pool.neo4j.get_driver()
            async with driver.session() as session:
                result = await session.run(cypher)
                raw_results = [dict(r) async for r in result]
        except Exception as e:
            error = str(e)
            logger.warning("Cypher execution failed: %s", e)

        # Step 3: Summarize with LLM
        answer, sources = await self._synthesize_answer(
            question, "graph", raw_results, llm
        )

        return QueryResult(
            question=question,
            query_type="graph",
            generated_query=cypher,
            raw_results=raw_results[:20],
            answer=answer,
            sources=sources,
            error=error,
        )

    async def _query_search(self, question: str, llm) -> QueryResult:
        """NLQ → ES Query → Elasticsearch → NL answer."""
        # Step 1: Generate ES Query
        prompt = _ES_GENERATION_PROMPT.format(question=question)
        resp = await llm.chat_completion(
            messages=[
                {"role": "system", "content": "You are an ES Query DSL generator. Output ONLY valid JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=500,
        )
        es_query_str = resp["choices"][0]["message"]["content"].strip()
        # 修复: 用 _strip_code_fence 替代误用的 str.strip
        es_query_str = _strip_code_fence(es_query_str, lang="json")

        # Step 2: Execute
        raw_results = []
        error = None
        try:
            es_query = json.loads(es_query_str)
            pool = await get_pool_manager()
            es = await pool.elasticsearch.get_client()
            es_response = await es.search(index="omnilog_docs", body=es_query)
            hits = es_response.get("hits", {}).get("hits", [])
            raw_results = [
                {
                    "id": h["_id"],
                    "score": h["_score"],
                    "source": h["_source"].get("source", ""),
                    "content": h["_source"].get("clean_text", "")[:500],
                    "language": h["_source"].get("language", ""),
                    "timestamp": h["_source"].get("timestamp", ""),
                    "tags": h["_source"].get("tags", []),
                    "entities": h["_source"].get("entities", []),
                }
                for h in hits
            ]
        except Exception as e:
            error = str(e)
            logger.warning("ES query execution failed: %s", e)

        # Step 3: Summarize
        answer, sources = await self._synthesize_answer(
            question, "search", raw_results, llm
        )

        return QueryResult(
            question=question,
            query_type="search",
            generated_query=es_query_str,
            raw_results=raw_results[:20],
            answer=answer,
            sources=sources,
            error=error,
        )

    async def _detect_query_type(self, question: str) -> str:
        """Auto-detect whether to use graph or search based on the question."""
        graph_keywords = [
            "relationship", "connected", "related", "network",
            "path between", "how is.*related", "graph",
            "entity.*type", "nodes", "link",
            "supply chain", "who owns", "partnership",
            "relation", "association",
        ]
        search_keywords = [
            "find.*about", "search.*for", "articles about",
            "news.*about", "mention", "document",
            "what.*said", "report.*about",
            "information about",
        ]

        q_lower = question.lower()

        # 修复: re 已在模块顶部 import, 移除函数内重复 import
        for kw in graph_keywords:
            if re.search(kw, q_lower):
                return "graph"
        for kw in search_keywords:
            if re.search(kw, q_lower):
                return "search"

        # Default: if it mentions specific entities, use graph
        entity_indicators = ["company", "organization", "person", "country",
                             "location", "who is", "what is"]
        if any(ind in q_lower for ind in entity_indicators):
            return "graph"
        return "search"

    async def _synthesize_answer(
        self,
        question: str,
        query_type: str,
        results: List[Dict[str, Any]],
        llm,
    ) -> tuple:
        """LLM summarization of raw query results."""
        if not results:
            return ("No results found for this question.", [])

        prompt = _ANSWER_SYNTHESIS_PROMPT.format(
            question=question,
            query_type=query_type,
            results=json.dumps(results[:10], indent=2, ensure_ascii=False),
        )
        resp = await llm.chat_completion(
            messages=[
                {"role": "system", "content": "You are an intelligence analyst. Answer clearly and cite sources."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=800,
        )
        answer = resp["choices"][0]["message"]["content"].strip()

        # Extract sources
        sources = []
        for r in results[:10]:
            if query_type == "graph":
                sources.append({
                    "type": "entity",
                    "name": r.get("name") or r.get("entity_name") or r.get("summary", "")[:60],
                })
            else:
                sources.append({
                    "type": "document",
                    "id": r.get("id", ""),
                    "source": r.get("source", ""),
                })

        return answer, sources


# Global singleton
_translator: Optional[QueryTranslator] = None


def get_query_translator() -> QueryTranslator:
    global _translator
    if _translator is None:
        _translator = QueryTranslator()
    return _translator
