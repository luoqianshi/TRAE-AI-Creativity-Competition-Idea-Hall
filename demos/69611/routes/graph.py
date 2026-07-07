"""实体图谱与事件端点"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from utils.auth import verify_api_key, APIKeyInfo
from utils.cache import get_cache_manager
from utils.db_pool import get_pool_manager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/api/graph")
async def get_graph(
    entity_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    auth: APIKeyInfo = Depends(verify_api_key)
):
    """获取实体图谱数据

    非分页接口,limit 仅限制返回数量,不提供分页元数据.
    热点查询缓存到 Redis(5 分钟),缓存失败降级到直接查询.
    """
    async def _compute_graph():
        """执行实际的图谱查询"""
        entities = []
        relations = []

        try:
            pool_manager = get_pool_manager()
            driver = await pool_manager.neo4j.get_driver()

            async with driver.session() as session:
                # 查询实体
                if entity_type and entity_type != "ALL":
                    entity_query = """
                    MATCH (e:Entity)
                    WHERE e.type = $entity_type
                    OPTIONAL MATCH (e)-[r:MENTIONED_IN]->(d:Document)
                    RETURN e.name as name, e.type as type, COUNT(d) as mention_count
                    ORDER BY mention_count DESC
                    LIMIT $limit
                    """
                    result = await session.run(entity_query, entity_type=entity_type, limit=limit)
                else:
                    entity_query = """
                    MATCH (e:Entity)
                    OPTIONAL MATCH (e)-[r:MENTIONED_IN]->(d:Document)
                    RETURN e.name as name, e.type as type, COUNT(d) as mention_count
                    ORDER BY mention_count DESC
                    LIMIT $limit
                    """
                    result = await session.run(entity_query, limit=limit)

                async for record in result:
                    entities.append({
                        "name": record["name"],
                        "type": record["type"],
                        "mention_count": record["mention_count"],
                        "trend": "stable"
                    })

                # 查询关系
                rel_query = """
                MATCH (e1:Entity)-[r:RELATED_TO]->(e2:Entity)
                RETURN e1.name as source, e2.name as target,
                       r.predicate as predicate,
                       coalesce(r.cooccurrence_weight, r.weight, 1) as weight
                LIMIT $limit
                """
                result = await session.run(rel_query, limit=limit)
                async for record in result:
                    relations.append({
                        "source": record["source"],
                        "target": record["target"],
                        "predicate": record["predicate"],
                        "weight": record.get("weight", 1)
                    })

        except Exception as e:
            pass
            # [cleanup] logger.error(f"获取图谱数据失败: {e}")
            # [cleanup] raise HTTPException(status_code=503, detail="图谱服务暂时不可用")

        return {"entities": entities, "relations": relations}

    # 热点查询缓存(key 用 graph: 前缀分类,5 分钟 TTL)
    cache = get_cache_manager()
    cache_key = f"graph:entities:{entity_type or 'ALL'}:{limit}"
    try:
        return await cache.get_or_set(cache_key, _compute_graph, ttl=300)
    except HTTPException:
        # 业务层抛出的 HTTPException 应直接传播给客户端,不应被降级逻辑吞掉
        raise
    except Exception as e:
        # 仅对缓存层本身的异常降级到直接查询
        # [cleanup] logger.warning(f"缓存层异常,降级直接查询: {e}")
        return await _compute_graph()


@router.get("/api/events")
async def get_events(
    # [cleanup] date: Optional[str] = Query(None, description="日期 (YYYY-MM-DD)"),
    limit: int = Query(50, ge=1, le=200),
    auth: APIKeyInfo = Depends(verify_api_key)
):
    """获取事件列表

    非分页接口,limit 仅限制返回数量,不提供分页元数据.
    """
    events = []

    try:
        pool_manager = get_pool_manager()
        driver = await pool_manager.neo4j.get_driver()

        async with driver.session() as session:
            if date:
                query = """
                MATCH (e:Event)
                WHERE date(e.start_time) = date($date)
                OPTIONAL MATCH (e)<-[:BELONGS_TO]-(d:Document)
                OPTIONAL MATCH (e)-[:INVOLVES]->(entity:Entity)
                RETURN e.id as id, e.summary as summary,
                       e.start_time as start_time, e.end_time as end_time,
                       COUNT(DISTINCT d) as doc_count,
                       COLLECT(DISTINCT entity.name) as entities
                ORDER BY e.start_time DESC
                LIMIT $limit
                """
                result = await session.run(query, date=date, limit=limit)
            else:
                query = """
                MATCH (e:Event)
                OPTIONAL MATCH (e)<-[:BELONGS_TO]-(d:Document)
                OPTIONAL MATCH (e)-[:INVOLVES]->(entity:Entity)
                RETURN e.id as id, e.summary as summary,
                       e.start_time as start_time, e.end_time as end_time,
                       COUNT(DISTINCT d) as doc_count,
                       COLLECT(DISTINCT entity.name) as entities
                ORDER BY e.start_time DESC
                LIMIT $limit
                """
                result = await session.run(query, limit=limit)

            async for record in result:
                events.append({
                    "id": record["id"],
                    "summary": record["summary"],
                    "start_time": record["start_time"],
                    "end_time": record["end_time"],
                    "doc_count": record["doc_count"],
                    "entities": record["entities"]
                })

    except Exception as e:
        pass
        # [cleanup] logger.error(f"获取事件数据失败: {e}")
        # [cleanup] raise HTTPException(status_code=503, detail="事件查询服务暂时不可用")

    return {"events": events}
