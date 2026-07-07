"""Multi-source intelligence merging — deduplicate and annotate source count."""

import copy
import logging
from collections import defaultdict
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


class SourceMerger:
    """Multi-source intelligence merger.

    Merges duplicate documents by fingerprint, preserving source
    attribution. Adds multi-source confidence bonuses for events
    verified by multiple independent sources.
    """

    def merge_duplicate_documents(
        self, documents: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Merge duplicate documents by fingerprint, preserving source info.

        Args:
            documents: List of documents, each with fingerprint, source,
                       url, and timestamp fields.

        Returns:
            Merged document list with merged_sources in metadata.
        """
        groups: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        for doc in documents:
            fp = doc.get("fingerprint", doc.get("id", ""))
            groups[fp].append(doc)

        merged = []
        for fp, group in groups.items():
            if len(group) == 1:
                merged.append(group[0])
            else:
                base = copy.deepcopy(group[0])
                sources = []
                urls = []
                timestamps = []
                for d in group:
                    src = d.get("source", "")
                    if src and src not in sources:
                        sources.append(src)
                    url = d.get("url", "")
                    if url and url not in urls:
                        urls.append(url)
                    ts = d.get("timestamp", "")
                    if ts:
                        timestamps.append(ts)

                base.setdefault("metadata", {})
                base["metadata"]["merged_sources"] = sources
                base["metadata"]["merged_urls"] = urls
                base["metadata"]["merged_count"] = len(group)
                base["metadata"]["merged_timestamps"] = timestamps
                merged.append(base)

        return merged

    def enrich_events(
        self, events: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Enrich events with source diversity statistics and confidence bonuses.

        Args:
            events: List of event dicts with sources, documents fields.

        Returns:
            Enriched events with source_count, source_diversity,
            and multi_source_verified fields.
        """
        for event in events:
            sources = event.get("sources", []) or []
            documents = event.get("documents", []) or []

            unique_sources = set(sources)
            event["source_count"] = len(sources)
            event["source_diversity"] = len(unique_sources)
            event["unique_sources"] = list(unique_sources)

            if event["source_diversity"] >= 3:
                original_conf = event.get("confidence", 0.5)
                event["confidence"] = min(original_conf + 0.1, 1.0)
                event["multi_source_verified"] = True
            elif event["source_diversity"] >= 2:
                original_conf = event.get("confidence", 0.5)
                event["confidence"] = min(original_conf + 0.05, 1.0)
                event["multi_source_verified"] = True
            else:
                event["multi_source_verified"] = False

        return events

    def format_source_attribution(self, event: Dict[str, Any]) -> str:
        """Format source attribution text for reports.

        Args:
            event: Event dict with source_count, source_diversity,
                   unique_sources fields.

        Returns:
            Human-readable source attribution string.
        """
        source_count = event.get("source_count", 1)
        diversity = event.get("source_diversity", 1)
        sources = event.get("unique_sources", [])

        if source_count == 1:
            return f"Source: {sources[0] if sources else 'unknown'}"
        elif diversity == 1:
            return f"Source: {sources[0] if sources else 'unknown'} ({source_count} articles)"
        else:
            sources_str = ", ".join(sources[:3])
            if len(sources) > 3:
                sources_str += f" and {len(sources) - 3} more"
            verified = " [multi-source verified]" if event.get("multi_source_verified") else ""
            return f"Sources: {sources_str} ({source_count} articles, {diversity} independent){verified}"
