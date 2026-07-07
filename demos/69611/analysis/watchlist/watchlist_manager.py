"""Watchlist manager — CRUD for entity watchlists with notification triggers.

Stores watchlist entries in PostgreSQL and integrates with the alert router
for real-time notifications when monitored entities appear.
"""

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


@dataclass
class WatchlistEntry:
    """A single watchlist entry."""

    id: int
    user_id: str
    entity_id: str
    entity_name: str
    entity_type: Optional[str] = None
    notes: str = ""
    alert_on_appearance: bool = True
    alert_on_trend_change: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class WatchlistManager:
    """CRUD manager for entity watchlists backed by PostgreSQL."""

    _TABLE = "watchlist"

    async def add(
        self,
        user_id: str,
        entity_id: str,
        entity_name: str,
        entity_type: Optional[str] = None,
        notes: str = "",
        alert_on_appearance: bool = True,
        alert_on_trend_change: bool = True,
    ) -> Optional[WatchlistEntry]:
        """Add an entity to a user's watchlist."""
        try:
            from utils.db_pool import get_pool_manager
            pool = await get_pool_manager()
            pg = await pool.postgres.get_pool()
            async with pg.acquire() as conn:
                row = await conn.fetchrow(
                    f"""
                    INSERT INTO {self._TABLE}
                        (user_id, entity_id, entity_name, entity_type, notes,
                         alert_on_appearance, alert_on_trend_change)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (user_id, entity_id) DO UPDATE SET
                        alert_on_appearance = EXCLUDED.alert_on_appearance,
                        alert_on_trend_change = EXCLUDED.alert_on_trend_change,
                        notes = EXCLUDED.notes,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING id, created_at, updated_at
                    """,
                    user_id, entity_id, entity_name, entity_type,
                    notes, alert_on_appearance, alert_on_trend_change,
                )
                if row:
                    return WatchlistEntry(
                        id=row["id"],
                        user_id=user_id,
                        entity_id=entity_id,
                        entity_name=entity_name,
                        entity_type=entity_type,
                        notes=notes,
                        alert_on_appearance=alert_on_appearance,
                        alert_on_trend_change=alert_on_trend_change,
                        created_at=str(row["created_at"]) if row["created_at"] else None,
                        updated_at=str(row["updated_at"]) if row["updated_at"] else None,
                    )
        except Exception as e:
            logger.error("Failed to add watchlist entry: %s", e)
        return None

    async def remove(self, user_id: str, entity_id: str) -> bool:
        """Remove an entity from a user's watchlist."""
        try:
            from utils.db_pool import get_pool_manager
            pool = await get_pool_manager()
            pg = await pool.postgres.get_pool()
            async with pg.acquire() as conn:
                result = await conn.execute(
                    f"DELETE FROM {self._TABLE} WHERE user_id = $1 AND entity_id = $2",
                    user_id, entity_id,
                )
                return "DELETE" in result and int(result.split()[-1]) > 0
        except Exception as e:
            logger.error("Failed to remove watchlist entry: %s", e)
            return False

    async def list_for_user(
        self, user_id: str
    ) -> List[WatchlistEntry]:
        """List all watchlist entries for a user."""
        try:
            from utils.db_pool import get_pool_manager
            pool = await get_pool_manager()
            pg = await pool.postgres.get_pool()
            async with pg.acquire() as conn:
                rows = await conn.fetch(
                    f"""
                    SELECT * FROM {self._TABLE}
                    WHERE user_id = $1
                    ORDER BY created_at DESC
                    """,
                    user_id,
                )
            return [
                WatchlistEntry(
                    id=r["id"],
                    user_id=r["user_id"],
                    entity_id=r["entity_id"],
                    entity_name=r["entity_name"],
                    entity_type=r.get("entity_type"),
                    notes=r.get("notes", ""),
                    alert_on_appearance=r.get("alert_on_appearance", True),
                    alert_on_trend_change=r.get("alert_on_trend_change", True),
                    created_at=str(r["created_at"]) if r.get("created_at") else None,
                    updated_at=str(r["updated_at"]) if r.get("updated_at") else None,
                )
                for r in rows
            ]
        except Exception as e:
            logger.error("Failed to list watchlist: %s", e)
            return []

    async def get_watched_entity_ids(self) -> List[str]:
        """Get all unique entity IDs being watched across all users."""
        try:
            from utils.db_pool import get_pool_manager
            pool = await get_pool_manager()
            pg = await pool.postgres.get_pool()
            async with pg.acquire() as conn:
                rows = await conn.fetch(
                    f"SELECT DISTINCT entity_id FROM {self._TABLE}"
                )
            return [r["entity_id"] for r in rows]
        except Exception as e:
            logger.error("Failed to get watched entity IDs: %s", e)
            return []

    async def check_and_notify(
        self,
        entity_id: str,
        entity_name: str,
        doc_id: str,
        doc_title: str,
        source: str,
    ) -> int:
        """Notify all users watching an entity when it appears in a new document.

        Returns the number of users notified.
        """
        try:
            from utils.db_pool import get_pool_manager
            pool = await get_pool_manager()
            pg = await pool.postgres.get_pool()
            async with pg.acquire() as conn:
                rows = await conn.fetch(
                    f"""
                    SELECT user_id FROM {self._TABLE}
                    WHERE entity_id = $1 AND alert_on_appearance = TRUE
                    """,
                    entity_id,
                )
            if not rows:
                return 0

            # Fire alert via AlertRouter
            from analysis.alert_router import get_alert_router
            router = get_alert_router()
            for row in rows:
                await router.route_alert({
                    "title": f"Watchlist Alert: {entity_name} detected",
                    "summary": (
                        f"Monitored entity '{entity_name}' appeared in "
                        f"'{doc_title}' ({source})"
                    ),
                    "severity": "info",
                    "entities": [entity_name],
                    "sources": [source],
                })

            logger.info(
                "Watchlist notified %d users for entity '%s'",
                len(rows), entity_name,
            )
            return len(rows)
        except Exception as e:
            logger.error("Watchlist notification failed: %s", e)
            return 0


# Global singleton
_manager: Optional[WatchlistManager] = None


def get_watchlist_manager() -> WatchlistManager:
    global _manager
    if _manager is None:
        _manager = WatchlistManager()
    return _manager
