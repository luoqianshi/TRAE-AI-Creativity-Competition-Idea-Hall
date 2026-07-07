"""Entity merging module — auto-detect and merge duplicate entities in the knowledge graph.

Handles cases where:
1. Entity linking cold-start creates the same entity multiple times (e.g. "OpenAI" vs "OpenAI Inc")
2. Incomplete alias tables lead to duplicate entity creation under different names
3. Entity extraction produces variant forms (e.g. "Apple Inc" vs "Apple")

Strategy:
1. Select the entity with the highest source_count as the primary
2. Merge aliases from secondary entities into the primary
3. Update Neo4j relationships to point to the primary
4. Delete the merged secondary entities
"""

import json
import logging
from typing import Any, Dict, List, Optional, Tuple

from utils.db_pool import get_pool_manager

logger = logging.getLogger(__name__)

# Merge thresholds
NAME_SIMILARITY_THRESHOLD = 0.85
DESCRIPTION_SIMILARITY_THRESHOLD = 0.7
MIN_SOURCE_COUNT_FOR_MERGE = 2


class EntityMerger:
    """Entity merger that detects and consolidates duplicate entities."""

    def __init__(self):
        self._pool_manager = None

    async def _get_pool_manager(self):
        if self._pool_manager is None:
            self._pool_manager = get_pool_manager()
        return self._pool_manager

    async def find_duplicate_entities(
        self, entity_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Find potential duplicate entity pairs.

        Args:
            entity_type: Limit to a specific entity type, or None for all.

        Returns:
            List of duplicate pairs with similarity scores and reasons.
        """
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()

            async with pg_pool.acquire() as conn:
                if entity_type:
                    rows = await conn.fetch(
                        "SELECT entity_id, canonical_name, aliases, entity_type, "
                        "description, source_count "
                        "FROM entity_knowledge_base "
                        "WHERE entity_type = $1 AND source_count >= $2 "
                        "ORDER BY source_count DESC",
                        entity_type, MIN_SOURCE_COUNT_FOR_MERGE,
                    )
                else:
                    rows = await conn.fetch(
                        "SELECT entity_id, canonical_name, aliases, entity_type, "
                        "description, source_count "
                        "FROM entity_knowledge_base "
                        "WHERE source_count >= $1 "
                        "ORDER BY source_count DESC",
                        MIN_SOURCE_COUNT_FOR_MERGE,
                    )

            if len(rows) < 2:
                return []

            by_type: Dict[str, List[Dict]] = {}
            for row in rows:
                etype = row["entity_type"]
                by_type.setdefault(etype, []).append(dict(row))

            duplicates = []
            for etype, entities in by_type.items():
                if len(entities) < 2:
                    continue
                for i in range(len(entities)):
                    for j in range(i + 1, len(entities)):
                        e1, e2 = entities[i], entities[j]
                        sim, reason = self._compute_similarity(e1, e2)
                        if sim >= NAME_SIMILARITY_THRESHOLD:
                            duplicates.append({
                                "entity1": e1, "entity2": e2,
                                "similarity": sim, "reason": reason,
                            })

            duplicates.sort(key=lambda x: x["similarity"], reverse=True)
            logger.info("Found %d potential duplicate entity pairs", len(duplicates))
            return duplicates

        except Exception as e:
            logger.warning("Duplicate entity search failed: %s", e)
            return []

    def _compute_similarity(
        self, e1: Dict, e2: Dict
    ) -> Tuple[float, str]:
        """Compute similarity between two entities.

        Returns:
            Tuple of (similarity_score, reason_string).
        """
        name1 = e1.get("canonical_name", "").lower()
        name2 = e2.get("canonical_name", "").lower()

        # 1. Exact name match
        if name1 == name2 and name1:
            return 1.0, "exact name match"

        # 2. Substring containment (e.g., "OpenAI" in "OpenAI Inc")
        if name1 and name2:
            if name1 in name2 or name2 in name1:
                return 0.95, "name containment"

        # 3. Alias overlap
        aliases1 = set(self._parse_aliases(e1.get("aliases")))
        aliases2 = set(self._parse_aliases(e2.get("aliases")))
        if aliases1 and aliases2:
            overlap = aliases1 & aliases2
            if overlap:
                union = aliases1 | aliases2
                overlap_rate = len(overlap) / len(union) if union else 0
                if overlap_rate >= 0.5:
                    return 0.9, f"alias overlap {overlap_rate:.0%}"

        # 4. Name edit-distance similarity
        name_sim = self._string_similarity(name1, name2)
        if name_sim >= NAME_SIMILARITY_THRESHOLD:
            return name_sim, "name edit-distance similarity"

        # 5. Description similarity (weighted combination)
        desc1 = e1.get("description", "") or ""
        desc2 = e2.get("description", "") or ""
        if desc1 and desc2:
            desc_sim = self._string_similarity(desc1[:200], desc2[:200])
            if desc_sim >= DESCRIPTION_SIMILARITY_THRESHOLD:
                combined = name_sim * 0.6 + desc_sim * 0.4
                if combined >= NAME_SIMILARITY_THRESHOLD:
                    return combined, "name + description similarity"

        return name_sim, "low similarity"

    @staticmethod
    def _parse_aliases(aliases_field) -> List[str]:
        """Parse aliases field (JSON array, Python list, or plain string)."""
        if not aliases_field:
            return []
        if isinstance(aliases_field, list):
            return [str(a).lower() for a in aliases_field if a]
        if isinstance(aliases_field, str):
            try:
                parsed = json.loads(aliases_field)
                if isinstance(parsed, list):
                    return [str(a).lower() for a in parsed if a]
            except json.JSONDecodeError:
                return [aliases_field.lower()]
        return []

    @staticmethod
    def _string_similarity(s1: str, s2: str) -> float:
        """Compute normalized string similarity based on Levenshtein distance."""
        if not s1 and not s2:
            return 1.0
        if not s1 or not s2:
            return 0.0

        # Levenshtein distance
        len1, len2 = len(s1), len(s2)
        if len1 == 0 or len2 == 0:
            return 0.0

        # Use simple ratio: 1 - (edit_distance / max_length)
        # Use a simple character-level Jaccard-like approach for speed
        set1, set2 = set(s1), set(s2)
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        char_sim = intersection / union if union > 0 else 0.0

        # Also consider bigram overlap
        bigrams1 = {s1[i:i+2] for i in range(len1 - 1)}
        bigrams2 = {s2[i:i+2] for i in range(len2 - 1)}
        if bigrams1 and bigrams2:
            bi_intersection = len(bigrams1 & bigrams2)
            bi_union = len(bigrams1 | bigrams2)
            bigram_sim = bi_intersection / bi_union if bi_union > 0 else 0.0
            return char_sim * 0.3 + bigram_sim * 0.7

        return char_sim

    async def merge_entities(
        self, primary_id: str, secondary_id: str
    ) -> bool:
        """Merge a secondary entity into a primary entity.

        Merges aliases, accumulates source_count, updates descriptions,
        and rewires Neo4j relationships before deleting the secondary.

        Args:
            primary_id: Entity to keep.
            secondary_id: Entity to merge and delete.

        Returns:
            True if merge succeeded.
        """
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()

            async with pg_pool.acquire() as conn:
                primary = await conn.fetchrow(
                    "SELECT * FROM entity_knowledge_base WHERE entity_id = $1",
                    primary_id,
                )
                secondary = await conn.fetchrow(
                    "SELECT * FROM entity_knowledge_base WHERE entity_id = $1",
                    secondary_id,
                )

                if not primary or not secondary:
                    logger.error(
                        "Merge failed: entity not found primary=%s secondary=%s",
                        primary_id, secondary_id,
                    )
                    return False

                primary_aliases = set(self._parse_aliases(primary["aliases"]))
                secondary_aliases = set(self._parse_aliases(secondary["aliases"]))
                merged_aliases = primary_aliases | secondary_aliases | {
                    secondary["canonical_name"].lower()
                }
                merged_aliases_json = json.dumps(
                    list(merged_aliases), ensure_ascii=False
                )

                new_source_count = (
                    (primary["source_count"] or 0) + (secondary["source_count"] or 0)
                )

                primary_desc = primary["description"] or ""
                secondary_desc = secondary["description"] or ""
                merged_desc = (
                    primary_desc
                    if len(primary_desc) >= len(secondary_desc)
                    else secondary_desc
                )

                await conn.execute(
                    """
                    UPDATE entity_knowledge_base
                    SET aliases = $1::jsonb,
                        source_count = $2,
                        description = $3,
                        updated_at = NOW()
                    WHERE entity_id = $4
                    """,
                    merged_aliases_json, new_source_count, merged_desc, primary_id,
                )

                await conn.execute(
                    "DELETE FROM entity_knowledge_base WHERE entity_id = $1",
                    secondary_id,
                )

            # Update Neo4j relationships
            await self._update_neo4j_relations(primary_id, secondary_id)

            logger.info(
                "Entity merge succeeded: %s (%s) -> %s (%s)",
                secondary["canonical_name"], secondary_id,
                primary["canonical_name"], primary_id,
            )
            return True

        except Exception as e:
            logger.error("Entity merge failed: %s", e)
            return False

    async def _update_neo4j_relations(
        self, primary_id: str, secondary_id: str
    ):
        """Update Neo4j relationships to point to the primary entity."""
        try:
            pool = await self._get_pool_manager()
            driver = await pool.neo4j.get_driver()

            async with driver.session() as session:
                # Redirect inbound relationships to primary
                await session.run(
                    """
                    MATCH (n)-[r]->(secondary:Entity {entity_id: $secondary_id})
                    MERGE (primary:Entity {entity_id: $primary_id})
                    MERGE (n)-[new_r]->(primary)
                    SET new_r += properties(r)
                    DELETE r
                    """,
                    primary_id=primary_id, secondary_id=secondary_id,
                )

                # Redirect outbound relationships to primary
                await session.run(
                    """
                    MATCH (secondary:Entity {entity_id: $secondary_id})-[r]->(n)
                    MERGE (primary:Entity {entity_id: $primary_id})
                    MERGE (primary)-[new_r]->(n)
                    SET new_r += properties(r)
                    DELETE r
                    """,
                    primary_id=primary_id, secondary_id=secondary_id,
                )

                # Delete secondary node
                await session.run(
                    "MATCH (secondary:Entity {entity_id: $id}) DETACH DELETE secondary",
                    id=secondary_id,
                )

                logger.info(
                    "Neo4j relations updated: %s -> %s", secondary_id, primary_id
                )

        except Exception as e:
            logger.warning(
                "Neo4j relation update failed (data already merged in PG): %s", e
            )

    async def auto_merge(
        self, dry_run: bool = False
    ) -> Dict[str, Any]:
        """Auto-merge all detected duplicate entities.

        Args:
            dry_run: Only detect duplicates without actually merging.

        Returns:
            Dict with checked, duplicates_found, merged, failed, details.
        """
        duplicates = await self.find_duplicate_entities()

        result = {
            "checked": len(duplicates),
            "duplicates_found": len(duplicates),
            "merged": 0,
            "failed": 0,
            "details": [],
        }

        if dry_run or not duplicates:
            result["details"] = [
                {
                    "primary": d["entity1"]["canonical_name"],
                    "secondary": d["entity2"]["canonical_name"],
                    "similarity": d["similarity"],
                    "reason": d["reason"],
                }
                for d in duplicates
            ]
            return result

        merged_ids = set()
        for dup in duplicates:
            e1, e2 = dup["entity1"], dup["entity2"]

            if e1["entity_id"] in merged_ids or e2["entity_id"] in merged_ids:
                continue

            if e1["source_count"] >= e2["source_count"]:
                primary_id, secondary_id = e1["entity_id"], e2["entity_id"]
                primary_name, secondary_name = e1["canonical_name"], e2["canonical_name"]
            else:
                primary_id, secondary_id = e2["entity_id"], e1["entity_id"]
                primary_name, secondary_name = e2["canonical_name"], e1["canonical_name"]

            success = await self.merge_entities(primary_id, secondary_id)

            if success:
                result["merged"] += 1
                merged_ids.add(secondary_id)
                result["details"].append({
                    "primary": primary_name, "secondary": secondary_name,
                    "similarity": dup["similarity"], "status": "merged",
                })
            else:
                result["failed"] += 1
                result["details"].append({
                    "primary": primary_name, "secondary": secondary_name,
                    "similarity": dup["similarity"], "status": "failed",
                })

        logger.info(
            "Auto-merge complete: %d found, %d merged, %d failed",
            result["duplicates_found"], result["merged"], result["failed"],
        )
        return result


# Global singleton
_entity_merger: Optional[EntityMerger] = None


def get_entity_merger() -> EntityMerger:
    """Get or create the global EntityMerger singleton."""
    global _entity_merger
    if _entity_merger is None:
        _entity_merger = EntityMerger()
    return _entity_merger
