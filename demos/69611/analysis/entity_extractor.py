"""Entity and relation extraction using LLM with Redis caching."""

import asyncio
import hashlib
import json
import logging
from typing import Any, Dict, List, Optional

import redis.asyncio as aioredis

from config import get_config
from utils.llm_client import get_llm_client

logger = logging.getLogger(__name__)

CACHE_TTL = 24 * 60 * 60  # 24 hours
BATCH_SIZE = 5
CONCURRENCY_LIMIT = 3

# ============================================================
# Prompt template
# ============================================================

ENTITY_EXTRACTION_PROMPT = """You are a professional entity and relation extraction system.
Extract all important entities and their relationships from the text below.

Rules:
1. Entity types: PERSON, ORGANIZATION, LOCATION, GPE (geo-political entity), EVENT, PRODUCT, TECHNOLOGY, CONCEPT, ASSET
2. Relations should include: subject, predicate, object
3. For LOCATION and GPE entities, include approximate geographic coordinates if determinable from context
4. Output must be strict JSON format only, no other text

Output format:
{
  "entities": [
    {
      "name": "entity name",
      "type": "entity type",
      "latitude": 0.0,
      "longitude": 0.0
    },
    ...
  ],
  "relations": [
    {"subject": "subject name", "predicate": "relationship", "object": "object name"},
    ...
  ]
}

Note: Set latitude and longitude to null for non-location entities or when coordinates cannot be determined.

Text to analyze:
{TEXT}

JSON output:"""


# ============================================================
# Utility functions
# ============================================================

def _compute_text_hash(text: str) -> str:
    """Compute a hash of the text for cache key lookup."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


def _parse_llm_response(response_text: str) -> Dict[str, Any]:
    """Parse JSON from LLM response with bracket-matching fallback."""
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        start = response_text.find("{")
        if start == -1:
            return {"entities": [], "relations": []}
        depth = 0
        for i in range(start, len(response_text)):
            if response_text[i] == "{":
                depth += 1
            elif response_text[i] == "}":
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(response_text[start : i + 1])
                    except json.JSONDecodeError as e:
                        logger.error("Failed to parse JSON: %s", e)
                        return {"entities": [], "relations": []}
        return {"entities": [], "relations": []}


# ============================================================
# EntityExtractor class
# ============================================================

class EntityExtractor:
    """Entity and relation extractor using LLM with caching."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        redis_url: Optional[str] = None,
        cache_ttl: int = CACHE_TTL,
    ):
        cfg = get_config()
        self.base_url = base_url or cfg.llm.base_url
        self.api_key = api_key or cfg.llm.api_key
        self.model = model or cfg.llm.model
        self.redis_url = redis_url or cfg.redis.url
        self.cache_ttl = cache_ttl

        self._redis: Optional[aioredis.Redis] = None
        self._semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)
        self._pool_manager = None

    async def _get_pool_manager(self):
        """Get the unified connection pool manager."""
        if self._pool_manager is None:
            from utils.db_pool import get_pool_manager
            self._pool_manager = get_pool_manager()
        return self._pool_manager

    async def _get_client(self):
        """Get the OpenAI-compatible LLM client (shared global singleton)."""
        return await get_llm_client().get_client()

    async def _get_redis(self) -> aioredis.Redis:
        """Get Redis client (prefers unified connection pool)."""
        if self._redis is None:
            try:
                pool = await self._get_pool_manager()
                self._redis = await pool.redis.get_connection()
                logger.info("EntityExtractor using unified pool Redis client")
                return self._redis
            except Exception as e:
                logger.warning(
                    "Unified pool Redis unavailable, falling back to standalone: %s", e
                )
            self._redis = aioredis.from_url(self.redis_url, decode_responses=True, max_connections=10)
        return self._redis

    async def _get_from_cache(self, text_hash: str) -> Optional[Dict[str, Any]]:
        """Get extraction result from Redis cache."""
        try:
            redis = await self._get_redis()
            cache_key = f"entity_extraction:{text_hash}"
            cached = await redis.get(cache_key)
            if cached:
                logger.debug("Cache hit: %s", text_hash)
                return json.loads(cached)
        except Exception as e:
            logger.warning("Cache read failed: %s", e)
        return None

    async def _set_to_cache(self, text_hash: str, result: Dict[str, Any]):
        """Store extraction result in Redis cache."""
        try:
            redis = await self._get_redis()
            cache_key = f"entity_extraction:{text_hash}"
            await redis.set(
                cache_key,
                json.dumps(result, ensure_ascii=False),
                ex=self.cache_ttl,
            )
        except Exception as e:
            logger.warning("Cache write failed: %s", e)

    async def _extract_raw(self, text: str) -> Dict[str, Any]:
        """Call LLM to extract entities and relations, with caching."""
        text_hash = _compute_text_hash(text)

        cached = await self._get_from_cache(text_hash)
        if cached is not None:
            return cached

        try:
            client = await self._get_client()
            prompt = ENTITY_EXTRACTION_PROMPT.replace("{TEXT}", text)
            response = await client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=2000,
            )
            response_text = response.choices[0].message.content
            result = _parse_llm_response(response_text)
            await self._set_to_cache(text_hash, result)
            return result
        except Exception as e:
            logger.error("LLM extraction failed: %s", e)
            return {"entities": [], "relations": []}

    async def _link_entities(
        self, result: Dict[str, Any], text: str
    ) -> Dict[str, Any]:
        """Link extracted entities to the knowledge graph.

        Returns results with entity_id assigned. Link failures do not
        block the pipeline; original entities are returned unlinked.
        """
        try:
            from analysis.entity_linker import EntityLinker
            linker = EntityLinker()
            raw_entities = result.get("entities", [])
            if raw_entities:
                linker_input = [
                    {
                        "text": e.get("name", ""),
                        "label": e.get("type", "UNKNOWN"),
                        "confidence": e.get("confidence", 0.9),
                    }
                    for e in raw_entities
                ]
                linked_entities = await linker.link_entities(linker_input, text)
                new_entities = []
                for orig, linked in zip(raw_entities, linked_entities):
                    entity = dict(orig)
                    entity["entity_id"] = linked.entity_id
                    entity["canonical_name"] = linked.canonical_name
                    entity["linked"] = linked.linked
                    entity["link_confidence"] = linked.link_confidence
                    new_entities.append(entity)
                result["entities"] = new_entities
        except Exception as link_err:
            logger.warning(
                "Entity linking failed, returning unlinked entities: %s", link_err
            )
        return result

    async def extract(self, text: str) -> Dict[str, Any]:
        """Extract entities and relations from a single text.

        Uses the LLM pipeline with caching and links results against
        the knowledge graph.

        Args:
            text: Input text to analyze.

        Returns:
            Dict with "entities" and "relations" lists.
        """
        result = await self._extract_raw(text)
        return await self._link_entities(result, text)

    async def extract_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Extract entities from multiple texts in parallel.

        Args:
            texts: List of input texts.

        Returns:
            List of result dicts (failures return empty entities/relations).
        """
        tasks = [self.extract(text) for text in texts]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        final_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error("Batch extraction item %d failed: %s", i, result)
                final_results.append({"entities": [], "relations": []})
            else:
                final_results.append(result)

        return final_results

    async def close(self):
        """Close the Redis connection."""
        if self._redis:
            await self._redis.close()
            self._redis = None


# ============================================================
# Convenience functions
# ============================================================

_extractor: Optional[EntityExtractor] = None


def _get_extractor() -> EntityExtractor:
    """Get or create the global EntityExtractor singleton."""
    global _extractor
    if _extractor is None:
        _extractor = EntityExtractor()
    return _extractor


async def extract_entities(text: str) -> Dict[str, Any]:
    """Extract entities and relations from a single text (convenience)."""
    extractor = _get_extractor()
    return await extractor.extract(text)


async def extract_entities_batch(texts: List[str]) -> List[Dict[str, Any]]:
    """Extract entities from multiple texts in parallel (convenience)."""
    extractor = _get_extractor()
    return await extractor.extract_batch(texts)
