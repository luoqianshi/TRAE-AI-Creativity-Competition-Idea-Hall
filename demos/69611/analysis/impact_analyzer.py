"""影响分析模块 - 实体共现, 时间趋势, 因果链推断"""

import json
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional, Tuple

import numpy as np
from sklearn.linear_model import LinearRegression
from neo4j import AsyncGraphDatabase, AsyncDriver
try:
    from elasticsearch import AsyncElasticsearch
except ImportError:
    AsyncElasticsearch = None

from config import get_config
from utils.llm_client import get_llm_client

logger = logging.getLogger(__name__)

# ============================================================
# 配置
# ============================================================

# 趋势检测参数
TREND_WINDOW_DAYS = 7  # Trend analysis window in days
# [cleanup] MOVING_AVERAGE_WINDOW = 3  # 移动平均窗口
# [cleanup] ANOMALY_THRESHOLD = 2.0  # 异动阈值(标准差倍数)


# ============================================================
# ImpactAnalyzer 类
# ============================================================

class ImpactAnalyzer:
    """影响分析器"""

    def __init__(
        self,
        neo4j_uri: Optional[str] = None,
        neo4j_user: Optional[str] = None,
        neo4j_password: Optional[str] = None,
        es_hosts: Optional[List[str]] = None,
        es_index: Optional[str] = None,
        deepseek_base_url: Optional[str] = None,
        deepseek_api_key: Optional[str] = None,
        llm_model: Optional[str] = None,
        use_pool_manager: bool = True,
    ):
        """
        初始化影响分析器

        Args:
            neo4j_uri: Neo4j URI(独立运行时)
            neo4j_user: Neo4j 用户名(独立运行时)
            neo4j_password: Neo4j 密码(独立运行时)
            es_hosts: Elasticsearch 主机列表(独立运行时)
            es_index: Elasticsearch 索引名
            deepseek_base_url: DeepSeek API URL
            deepseek_api_key: DeepSeek API Key
            llm_model: LLM 模型名称
            use_pool_manager: 是否优先使用项目统一的 ConnectionPoolManager
        """
        cfg = get_config()
        self.neo4j_uri = neo4j_uri or cfg.neo4j.uri
        self.neo4j_user = neo4j_user or cfg.neo4j.user
        self.neo4j_password = neo4j_password or cfg.neo4j.password
        self.es_hosts = es_hosts or cfg.elasticsearch.hosts
        self.es_index = es_index or "omnilog_docs"
        self.deepseek_base_url = deepseek_base_url or cfg.llm.base_url
        self.deepseek_api_key = deepseek_api_key or cfg.llm.api_key
        self.llm_model = llm_model or cfg.llm.model
        self._use_pool_manager = use_pool_manager

        # 延迟初始化
        self._pool_manager = None
        self._neo4j_driver: Optional[AsyncDriver] = None
        self._es_client: Optional[AsyncElasticsearch] = None

    async def _get_pool_manager(self):
        """获取统一连接池管理器"""
        if self._pool_manager is None:
            from utils.db_pool import get_pool_manager
            self._pool_manager = get_pool_manager()
        return self._pool_manager

    async def _get_neo4j_driver(self) -> AsyncDriver:
        """获取 Neo4j 驱动(优先使用统一连接池)"""
        if self._neo4j_driver is None:
            if self._use_pool_manager:
                try:
                    pool = await self._get_pool_manager()
                    self._neo4j_driver = await pool.neo4j.get_driver()
                    # [cleanup] logger.info("ImpactAnalyzer 使用统一连接池的 Neo4j 驱动")
                    return self._neo4j_driver
                except Exception:
                    pass  # Pool unavailable, fall through to standalone connection

            driver = AsyncGraphDatabase.driver(
                self.neo4j_uri,
                auth=(self.neo4j_user, self.neo4j_password)
            )
            try:
                await driver.verify_connectivity()
            except Exception as e:
                await driver.close()
                self._neo4j_driver = None
                # [cleanup] logger.error(f"Neo4j 连接验证失败: {e}")
                raise
            self._neo4j_driver = driver
            # [cleanup] logger.info(f"已连接到 Neo4j: {self.neo4j_uri}")
        return self._neo4j_driver

    async def _get_es_client(self) -> AsyncElasticsearch:
        """获取 Elasticsearch 客户端(优先使用统一连接池)"""
        if self._es_client is None:
            if self._use_pool_manager:
                try:
                    pool = await self._get_pool_manager()
                    self._es_client = await pool.elasticsearch.get_client()
                    # [cleanup] logger.info("ImpactAnalyzer 使用统一连接池的 ES 客户端")
                    return self._es_client
                except Exception:
                    pass  # Pool ES unavailable, fall through

            client = AsyncElasticsearch(hosts=self.es_hosts)
            try:
                await client.info()
            except Exception as e:
                await client.close()
                self._es_client = None
                # [cleanup] logger.error(f"Elasticsearch 连接验证失败: {e}")
                raise
            self._es_client = client
            # [cleanup] logger.info(f"已连接到 Elasticsearch: {self.es_hosts}")
        return self._es_client

    async def _get_openai_client(self):
        """获取 OpenAI 兼容客户端(共用全局 LLM 单例)"""
        return await get_llm_client().get_client()

    # ============================================================
    # 1. 实体共现关联分析
    # ============================================================

    async def analyze_entity_cooccurrence(self, doc_ids: Optional[List[str]] = None):
        """
        分析实体共现关系,更新 RELATED_TO 权重

        Args:
            doc_ids: 指定文档 ID 列表,None 表示所有文档
        """
        driver = await self._get_neo4j_driver()

        async with driver.session() as session:
            # 查询每个文档中的实体
            if doc_ids:
                query = """
                MATCH (d:Document)-[:MENTIONED_IN]-(e:Entity)
                WHERE d.id IN $doc_ids
                RETURN d.id as doc_id, collect(e.name) as entities
                """
                result = await session.run(query, doc_ids=doc_ids)
            else:
                query = """
                MATCH (d:Document)-[:MENTIONED_IN]-(e:Entity)
                RETURN d.id as doc_id, collect(e.name) as entities
                """
                result = await session.run(query)

            records = [record async for record in result]

            # 统计共现频次
            cooccurrence_count: Dict[Tuple[str, str], int] = {}

            for record in records:
                entities = record["entities"]
                # 生成实体对
                for i in range(len(entities)):
                    for j in range(i + 1, len(entities)):
                        e1, e2 = sorted([entities[i], entities[j]])
                        key = (e1, e2)
                        cooccurrence_count[key] = cooccurrence_count.get(key, 0) + 1

            # 批量更新 RELATED_TO 关系权重(UNWIND 替代 N+1 循环)
            # 使用覆盖式 SET(而非累加),避免重复运行导致权重无限增长
            if cooccurrence_count:
                pairs = [
                    {"e1": e1, "e2": e2, "count": count}
                    for (e1, e2), count in cooccurrence_count.items()
                ]
                await session.run(
                    """
                    UNWIND $pairs AS p
                    MATCH (a:Entity {name: p.e1})
                    MATCH (b:Entity {name: p.e2})
                    MERGE (a)-[r:RELATED_TO]-(b)
                    SET r.cooccurrence_weight = p.count
                    """,
                    pairs=pairs,
                )

            # [cleanup] logger.info(f"实体共现分析完成: {len(cooccurrence_count)} 对实体关系已更新")

    # ============================================================
    # 2. 时间序列趋势分析
    # ============================================================

    async def analyze_entity_trends(self, days: int = TREND_WINDOW_DAYS):
        """
        分析实体提及频次趋势,检测异动

        Args:
            days: 分析窗口(天)
        """
        es = await self._get_es_client()
        driver = await self._get_neo4j_driver()

        # 1. 从 Elasticsearch 聚合每日实体提及频次
        end_time = datetime.now(timezone.utc).replace(tzinfo=None)
        start_time = end_time - timedelta(days=days)

        try:
            response = await es.search(
                index=self.es_index,
                size=0,
                query={
                    "range": {
                        "timestamp": {
                            "gte": start_time.isoformat(),
                            "lte": end_time.isoformat()
                        }
                    }
                },
                aggs={
                    "entities_per_day": {
                        "date_histogram": {
                            "field": "timestamp",
                            "calendar_interval": "day"
                        },
                        "aggs": {
                            "entity_mentions": {
                                "nested": {
                                    "path": "entities"
                                },
                                "aggs": {
                                    "entity_names": {
                                        "terms": {
                                            "field": "entities.text.keyword",
                                            "size": 100
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            )
        except Exception as e:
            # [cleanup] logger.error(f"Elasticsearch 聚合查询失败: {e}")
            return

        # 2. 解析聚合结果
        buckets = response["aggregations"]["entities_per_day"]["buckets"]

        # 构建时间序列数据 {entity_name: [count_per_day]}
        entity_timeseries: Dict[str, List[int]] = {}

        for day_index, bucket in enumerate(buckets):
            entity_buckets = bucket["entity_mentions"]["entity_names"]["buckets"]
            for entity_bucket in entity_buckets:
                entity_name = entity_bucket["key"]
                count = entity_bucket["doc_count"]

                if entity_name not in entity_timeseries:
                    entity_timeseries[entity_name] = [0] * len(buckets)

                entity_timeseries[entity_name][day_index] = count

        # 3. 对每个实体进行趋势分析
        # 收集所有实体的更新数据,批量写入 Neo4j
        entity_updates: List[Dict[str, Any]] = []

        for entity_name, counts in entity_timeseries.items():
            if len(counts) < 3:
                continue

            # 计算标准差
            std = np.std(counts)
            mean = np.mean(counts)

            # 检测异动(最后一天是否超过阈值)
            last_count = counts[-1]
            is_anomaly = last_count > mean + ANOMALY_THRESHOLD * std if std > 0 else False

            # 线性回归检测趋势
            if len(counts) >= 2:
                X = np.arange(len(counts)).reshape(-1, 1)
                y = np.array(counts)
                model = LinearRegression()
                model.fit(X, y)
                slope = model.coef_[0]

                # 判断趋势方向
                if slope > 0.5:
                    trend = "rising"
                elif slope < -0.5:
                    trend = "falling"
                else:
                    trend = "stable"
            else:
                trend = "stable"
                slope = 0

            entity_updates.append({
                "name": entity_name,
                "trend": trend,
                "slope": float(slope),
                "is_anomaly": bool(is_anomaly),
                "last_count": int(last_count),
                "mean": float(mean),
            })

        # 批量更新 Neo4j 实体节点(UNWIND 替代 N+1 循环)
        if entity_updates:
            async with driver.session() as session:
                await session.run(
                    """
                    UNWIND $updates AS u
                    MATCH (e:Entity {name: u.name})
                    SET e.trend = u.trend,
                        e.trend_slope = u.slope,
                        e.is_anomaly = u.is_anomaly,
                        e.last_mention_count = u.last_count,
                        e.avg_mention_count = u.mean
                    """,
                    updates=entity_updates,
                )

            # [cleanup] logger.info(f"时间序列趋势分析完成: {len(entity_updates)} 个实体已更新")

    # ============================================================
    # 3. 因果链推断
    # ============================================================

    async def infer_causal_chains(self, events: Optional[List[Dict[str, Any]]] = None):
        """
        推断事件之间的因果链

        Args:
            events: 事件列表,None 表示从 Neo4j 查询最近事件
        """
        driver = await self._get_neo4j_driver()

        # 1. 获取最近事件
        if events is None:
            async with driver.session() as session:
                result = await session.run(
                    """
                UNWIND $rows AS row
                MERGE (p:ImpactPath {id: row.path_id})
                SET p.description = row.description,
                    p.confidence = row.confidence,
                    p.created_at = row.created_at
                """,
                rows=path_rows,
            )

            # 2. 批量关联源事件(过滤空 ID)
            source_rows = [
                {"path_id": r["path_id"], "event_id": r["source_event_id"]}
                for r in path_rows
                if r["source_event_id"]
            ]
            if source_rows:
                await session.run(
                    """
                    UNWIND $rows AS row
                    MATCH (p:ImpactPath {id: row.path_id})
                    MATCH (e:Event {id: row.event_id})
                    MERGE (p)-[:ORIGINATES_FROM]->(e)
                    """,
                    rows=source_rows,
                )

            # 3. 批量关联目标事件(过滤空 ID)
            target_rows = [
                {"path_id": r["path_id"], "event_id": r["target_event_id"]}
                for r in path_rows
                if r["target_event_id"]
            ]
            if target_rows:
                await session.run(
                    """
                    UNWIND $rows AS row
                    MATCH (p:ImpactPath {id: row.path_id})
                    MATCH (e:Event {id: row.event_id})
                    MERGE (p)-[:LEADS_TO]->(e)
                    """,
                    rows=target_rows,
                )

    # ============================================================
    # 综合分析
    # ============================================================

    async def run_full_analysis(self, doc_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        # [cleanup] 运行完整的影响分析流程

        Args:
            # [cleanup] doc_ids: 指定文档 ID 列表

        Returns:
            # [cleanup] 分析结果字典
        """
        logger.info("开始完整影响分析...")

        results = {}

        # 1. 实体共现分析
        logger.info("步骤 1/3: 实体共现分析")
        await self.analyze_entity_cooccurrence(doc_ids)
        results["cooccurrence"] = "completed"

        # 2. 时间序列趋势分析
        logger.info("步骤 2/3: 时间序列趋势分析")
        await self.analyze_entity_trends()
        results["trends"] = "completed"

        # 3. 因果链推断
        logger.info("步骤 3/3: 因果链推断")
        chains = await self.infer_causal_chains()
        results["causal_chains"] = len(chains)

        logger.info("完整影响分析完成")
        return results

    async def close(self):
        """关闭所有连接"""
        if self._neo4j_driver:
            await self._neo4j_driver.close()
        if self._es_client:
            await self._es_client.close()
        logger.info("ImpactAnalyzer 已关闭")


# ============================================================
# 便捷函数
# ============================================================

_analyzer: Optional[ImpactAnalyzer] = None


def _get_analyzer() -> ImpactAnalyzer:
    """获取全局分析器实例"""
    global _analyzer
    if _analyzer is None:
        _analyzer = ImpactAnalyzer()
    return _analyzer


async def analyze_entity_cooccurrence(doc_ids: Optional[List[str]] = None):
    """Analyze entity co-occurrence patterns (convenience)."""
    analyzer = _get_analyzer()
    return await analyzer.analyze_entity_cooccurrence(doc_ids)


async def analyze_entity_trends(days: int = TREND_WINDOW_DAYS):
    """Analyze entity trends over time (convenience)."""
    analyzer = _get_analyzer()
    return await analyzer.analyze_entity_trends(days)


async def infer_causal_chains(events: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
    """Infer causal chains between events (convenience)."""
    analyzer = _get_analyzer()
    return await analyzer.infer_causal_chains(events)


async def run_full_analysis(doc_ids: Optional[List[str]] = None) -> Dict[str, Any]:
    """Run the full impact analysis pipeline (convenience)."""
    analyzer = _get_analyzer()
    return await analyzer.run_full_analysis(doc_ids)
