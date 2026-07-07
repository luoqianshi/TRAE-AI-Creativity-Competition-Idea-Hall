"""Entity linking and disambiguation — link extracted entities to the knowledge graph."""

import json
import logging
import uuid
from typing import Any, Dict, List, Optional, Tuple

from utils.db_pool import get_pool_manager
from utils.llm_client import get_llm_client

logger = logging.getLogger(__name__)


class LinkedEntity:
    """A linked entity with knowledge graph metadata."""

    def __init__(
        self,
        text: str,
        label: str,
        confidence: float,
        entity_id: Optional[str] = None,
        canonical_name: Optional[str] = None,
        link_confidence: float = 0.0,
        linked: bool = False,
    ):
        self.text = text
        self.label = label
        self.confidence = confidence
        self.entity_id = entity_id
        self.canonical_name = canonical_name or text
        self.link_confidence = link_confidence
        self.linked = linked

    def to_dict(self) -> Dict[str, Any]:
        return {
            "text": self.text,
            "label": self.label,
            "confidence": self.confidence,
            "entity_id": self.entity_id,
            "canonical_name": self.canonical_name,
            "link_confidence": self.link_confidence,
            "linked": self.linked,
        }


class EntityLinker:
    """Entity linker resolving extracted entities against the knowledge graph.

    Strategy:
    1. Exact match by canonical name or alias (same entity type)
    2. LLM-based disambiguation for ambiguous matches
    3. Create new entity with generated entity_id if no match found
    """

    LINK_THRESHOLD = 0.7

    def __init__(self):
        self._pool_manager = None
        self._llm_client = None

    async def _get_pool_manager(self):
        if self._pool_manager is None:
            self._pool_manager = get_pool_manager()
        return self._pool_manager

    def _get_llm(self):
        if self._llm_client is None:
            self._llm_client = get_llm_client()
        return self._llm_client

    async def _search_knowledge_base(
        self, text: str, label: str
    ) -> List[Dict[str, Any]]:
        """Search the knowledge graph for matching entities.

        Matches by canonical name or alias, restricted to the same
        entity type to avoid false matches.
        """
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()
            async with pg_pool.acquire() as conn:
                rows = await conn.fetch(
                    """
                    SELECT entity_id, canonical_name, aliases, entity_type, description
                    FROM entity_knowledge_base
                    WHERE entity_type = $2
                      AND (
                        canonical_name = $1
                        OR aliases @> to_jsonb($1::text)
                      )
                    LIMIT 10
                    """,
                    text,
                    label,
                )
                return [dict(row) for row in rows]
        except Exception as e:
            logger.warning("Knowledge base search failed: %s", e)
            return []

    async def _disambiguate_with_llm(
        self, text: str, label: str, context: str, candidates: List[Dict]
    ) -> Tuple[Dict, float]:
        """Use LLM to disambiguate between candidate entities.

        Returns the best-matching candidate and a confidence score.
        """
        try:
            llm = self._get_llm()
            client = await llm.get_client()

            cand_desc = "\n".join([
                f"{i+1}. {c['canonical_name']} ({c['entity_type']}): "
                f"{self._truncate(c.get('description'), 200)}"
                for i, c in enumerate(candidates)
            ])

            prompt = (
                f'Which entity does "{text}" refer to in the following context?\n\n'
                f"Context: {self._truncate(context, 500)}\n\n"
                f"Candidates:\n{cand_desc}\n\n"
                f"Reply with the candidate number (1-{len(candidates)}) and "
                f"confidence (0-1). Format: NUMBER,CONFIDENCE\n"
                f"If none match, reply: 0,0.0"
            )

            response = await client.chat.completions.create(
                model=llm.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=50,
                temperature=0.1,
            )

            result = (response.choices[0].message.content or "").strip()
            parts = result.replace(",", ",").split(",")
            idx = int(parts[0].strip()) - 1
            score = float(parts[1].strip()) if len(parts) > 1 else 0.5

            if 0 <= idx < len(candidates):
                return candidates[idx], score
            return candidates[0], 0.3

        except Exception as e:
            logger.warning("LLM disambiguation failed: %s", e)
            return candidates[0], 0.3

    async def _create_new_entity(
        self, text: str, label: str, context: str
    ) -> str:
        """Create a new entity in the knowledge graph.

        Uses full 32-hex-char UUID (128-bit) to avoid birthday collisions.
        """
        entity_id = f"ent_{uuid.uuid4().hex}"
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()
            async with pg_pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO entity_knowledge_base
                    (entity_id, canonical_name, aliases, entity_type, description, source_count)
                    VALUES ($1, $2, $3::jsonb, $4, $5, 1)
                    ON CONFLICT (entity_id) DO NOTHING
                    """,
                    entity_id,
                    text,
                    json.dumps([text], ensure_ascii=False),
                    label,
                    self._truncate(context, 500),
                )
            logger.info("Created new entity: %s -> %s", text, entity_id)
        except Exception as e:
            logger.warning("Failed to create new entity: %s", e)
        return entity_id

    async def _increment_source_count(self, entity_id: str):
        """Increment the source count for an entity."""
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()
            async with pg_pool.acquire() as conn:
                await conn.execute(
                    "UPDATE entity_knowledge_base "
                    "SET source_count = source_count + 1, updated_at = NOW() "
                    "WHERE entity_id = $1",
                    entity_id,
                )
        except Exception as e:
            logger.warning("Failed to update source count: %s", e)

    @staticmethod
    def _truncate(text: Optional[str], max_len: int) -> str:
        """Safely truncate text to a maximum length."""
        if not text:
            return ""
        return text[:max_len]

    async def link_entities(
        self, entities: List[Dict[str, Any]], context: str
    ) -> List[LinkedEntity]:
        """Link a batch of extracted entities to the knowledge graph.

        Args:
            entities: List of entity dicts with 'text'/'name' and 'label'/'type'.
            context: Source text context for disambiguation.

        Returns:
            List of LinkedEntity objects.
        """
        results = []
        for ent in entities:
            text = ent.get("text") or ent.get("name", "")
            label = ent.get("label") or ent.get("type", "UNKNOWN")
            confidence = ent.get("confidence", 0.9)

            try:
                candidates = await self._search_knowledge_base(text, label)

                if not candidates:
                    # No match — create new entity
                    entity_id = await self._create_new_entity(text, label, context)
                    results.append(LinkedEntity(
                        text=text, label=label, confidence=confidence,
                        entity_id=entity_id, canonical_name=text,
                        link_confidence=0.0, linked=False,
                    ))
                elif len(candidates) == 1:
                    # Single exact match
                    c = candidates[0]
                    await self._increment_source_count(c["entity_id"])
                    results.append(LinkedEntity(
                        text=text, label=label, confidence=confidence,
                        entity_id=c["entity_id"],
                        canonical_name=c["canonical_name"],
                        link_confidence=1.0, linked=True,
                    ))
                else:
                    # Multiple candidates — LLM disambiguation
                    best, score = await self._disambiguate_with_llm(
                        text, label, context, candidates
                    )
                    if score >= self.LINK_THRESHOLD:
                        await self._increment_source_count(best["entity_id"])
                        results.append(LinkedEntity(
                            text=text, label=label, confidence=confidence,
                            entity_id=best["entity_id"],
                            canonical_name=best["canonical_name"],
                            link_confidence=score, linked=True,
                        ))
                    else:
                        # Low confidence — create new entity
                        entity_id = await self._create_new_entity(text, label, context)
                        results.append(LinkedEntity(
                            text=text, label=label, confidence=confidence,
                            entity_id=entity_id, canonical_name=text,
                            link_confidence=score, linked=False,
                        ))
            except Exception as e:
                logger.warning("Entity linking failed for '%s': %s", text, e)
                results.append(LinkedEntity(
                    text=text, label=label, confidence=confidence,
                    canonical_name=text, linked=False,
                ))

        return results
