"""Watchlist module — entity monitoring and alerting.

Enables users to subscribe to entity changes and receive notifications
when monitored entities appear in new documents or exhibit trend shifts.

Reference: WorldMonitor Country Brief Page entity deep-dive patterns.
"""

from .watchlist_manager import WatchlistManager, WatchlistEntry, get_watchlist_manager

__all__ = ["WatchlistManager", "WatchlistEntry", "get_watchlist_manager"]
