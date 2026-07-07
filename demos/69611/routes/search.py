"""Search API endpoints v2.0

Provides full-text search, timeline aggregation, and document entity queries.
"""
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from utils.auth import verify_api_key, APIKeyInfo
from utils.cache import get_cache_manager
from utils.db_pool import get_pool_manager
logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/api/search")
async def search_documents(
    q: str = Query("", description="Search query"),
    language: Optional[str] = Query(None, description="Language filter"),
    source: Optional[str] = Query(None, description="Source filter"),
    tags: Optional[str] = Query(None, description="Tag filter (comma-separated)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Page size"),
    auth: APIKeyInfo = Depends(verify_api_key)
):
    """Full-text search across indexed documents"""
    try:
        pool_manager = get_pool_manager()
        es_client = await pool_manager.elasticsearch.get_client()
        must_clause = []
        filter_clause = []
        if q:
            must_clause.append({"multi_match": {"query": q, "fields": ["clean_text","source","tags","entities"], "fuzziness": "AUTO"}})
        else:
            must_clause.append({"match_all": {}})
        if language: filter_clause.append({"term": {"language": language}})
        if source: filter_clause.append({"term": {"source": source}})
        if tags:
            filter_clause.append({"terms": {"tags": [t.strip() for t in tags.split(",")]}})
        query_dsl = {"bool": {}}
        if must_clause: query_dsl["bool"]["must"] = must_clause
        if filter_clause: query_dsl["bool"]["filter"] = filter_clause
        result = await es_client.search(
            index="omnilog_docs",
            query=query_dsl,
            from_=(page - 1) * page_size,
            size=page_size,
            sort=[{"timestamp": {"order": "desc"}}],
            track_total_hits=True
        )
        if not result or not result.get("hits",{}).get("hits"):
            return {"total":0,"page":page,"page_size":page_size,"total_pages":0,"documents":[]}
        hits = result["hits"]["hits"]
        total = result["hits"].get("total",{}).get("value",0)
        documents = []
        for hit in hits:
            src = hit["_source"]
            documents.append({
                "id": hit["_id"], "source": src.get("source",""),
                "clean_text": src.get("clean_text",""), "language": src.get("language",""),
                "tags": src.get("tags",[]), "timestamp": src.get("timestamp",""),
                "url": src.get("url",""), "entities": src.get("entities",[]),
                "relevance_score": hit.get("_score",0.0)
            })
        return {"total":total,"page":page,"page_size":page_size,"total_pages":(total+page_size-1)//page_size,"documents":documents}
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(status_code=503, detail="Search service temporarily unavailable")


@router.get("/api/search/timeline")
async def get_search_timeline(q: str = Query("", description="Search query"), auth: APIKeyInfo = Depends(verify_api_key)):
    async def _compute_timeline():
        tl = []
        try:
            pool_manager = get_pool_manager()
            es_client = await pool_manager.elasticsearch.get_client()
            query_dsl = {"match_all": {}} if not q else {"multi_match": {"query": q, "fields": ["clean_text","source","tags","entities"]}}
            result = await es_client.search(
                index="omnilog_docs",
                query=query_dsl,
                aggs={"timeline": {"date_histogram": {"field": "timestamp","calendar_interval": "day","format": "yyyy-MM-dd"}}},
                size=0
            )
            for bucket in result.get("aggregations",{}).get("timeline",{}).get("buckets",[]):
                tl.append({"date": bucket["key_as_string"], "count": bucket["doc_count"]})
        except Exception as e:
            logger.error(f"Timeline aggregation failed: {e}")
            raise HTTPException(status_code=503, detail="Timeline service temporarily unavailable")
        return {"timeline": tl}
    cache = get_cache_manager()
    cache_key = f"search:timeline:{q or 'all'}"
    try:
        return await cache.get_or_set(cache_key, _compute_timeline, ttl=300)
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Cache layer error, falling back to direct query: {e}")
        return await _compute_timeline()


@router.get("/api/documents/{doc_id}/entities")
async def get_document_entities(doc_id: str, auth: APIKeyInfo = Depends(verify_api_key)):
    """Get entities related to a document"""
    entities = []
    try:
        pool_manager = get_pool_manager()
        driver = await pool_manager.neo4j.get_driver()
        async with driver.session() as session:
            result = await session.run(
                "MATCH (e:Entity)-[r:MENTIONED_IN]->(d:Document {id:$doc_id}) RETURN e.name as name, e.type as type, r.confidence as confidence ORDER BY confidence DESC",
                doc_id=doc_id
            )
            async for record in result:
                entities.append({"name":record["name"],"type":record["type"],"relation":"mentioned","confidence":record.get("confidence",0.0)})
    except Exception as e:
        logger.error(f"Entity query failed: {e}")
        raise HTTPException(status_code=503, detail="Entity query service temporarily unavailable")
    return {"entities": entities}
