"""Source independence scoring — assess how independent a set of sources are.

Two sources reporting the same event are more corroborative when they come
from different organizations, geographic regions, media types, or publisher
ecosystems. This module scores that independence.
"""

import logging
import re
from typing import Dict, List, Optional, Set

logger = logging.getLogger(__name__)

# Known media groups / parent organizations (source URL → parent)
_MEDIA_CONGLO_MAP: Dict[str, str] = {
    "cnn.com": "Warner Bros. Discovery",
    "reuters.com": "Thomson Reuters",
    "apnews.com": "Associated Press",
    "bbc.com": "BBC",
    "bbc.co.uk": "BBC",
    "nytimes.com": "The New York Times Company",
    "wsj.com": "News Corp",
    "bloomberg.com": "Bloomberg L.P.",
    "washingtonpost.com": "Nash Holdings / Jeff Bezos",
    "theguardian.com": "Guardian Media Group",
    "economist.com": "The Economist Group",
    "ft.com": "Nikkei Inc.",
    "nikkei.com": "Nikkei Inc.",
    "spiegel.de": "Spiegel-Verlag",
    "elpais.com": "Prensa Ibérica",
    "lemonde.fr": "Groupe Le Monde",
    "xinhuanet.com": "Xinhua News Agency",
    "globaltimes.cn": "Global Times",
    "tass.com": "TASS",
    "rt.com": "RT / TV-Novosti",
    "aljazeera.com": "Al Jazeera Media Network",
    "kyivindependent.com": "Kyiv Independent",
    "haaretz.com": "Haaretz Group",
    "timesofindia.indiatimes.com": "Times Group",
    "scmp.com": "South China Morning Post / Alibaba",
    "techcrunch.com": "Yahoo / Apollo Global",
    "theverge.com": "Vox Media",
    "arstechnica.com": "Condé Nast",
    "wired.com": "Condé Nast",
}

# Domain → geographic region mapping
_REGION_MAP: Dict[str, str] = {
    "us": "north_america",
    "uk": "europe",
    "cn": "asia",
    "jp": "asia",
    "kr": "asia",
    "in": "asia",
    "ru": "europe",
    "de": "europe",
    "fr": "europe",
    "it": "europe",
    "es": "europe",
    "br": "south_america",
    "au": "oceania",
    "sg": "asia",
    "hk": "asia",
    "ae": "middle_east",
    "sa": "middle_east",
    "il": "middle_east",
    "za": "africa",
    "ng": "africa",
    "ke": "africa",
    "eg": "africa",
}

# Media type classification by domain keywords
_TYPE_PATTERNS: Dict[str, str] = {
    r"(news|times|post|herald|tribune|chronicle|mirror|daily|observer)": "traditional_media",
    r"(blog|substack|medium\.com)": "blog",
    r"(techcrunch|theverge|wired|arstechnica|zdnet|theregister)": "tech_media",
    r"(twitter\.com|x\.com)": "social_media",
    r"(reddit\.com)": "social_media",
    r"(linkedin\.com)": "social_media",
    r"(youtube\.com)": "video",
    r"(github\.com)": "developer_platform",
    r"(arxiv\.org|ssrn\.com|researchgate)": "academic",
    r"(gov\.|\.gov|\.mil)": "government",
    r"(who\.int|un\.org|imf\.org|worldbank\.org)": "international_org",
}


class SourceIndependence:
    """Evaluate independence of a set of sources reporting the same event."""

    @staticmethod
    def compute(urls: List[str]) -> float:
        """Return an independence score (0-1) for a list of source URLs.

        1.0 = perfectly independent (different owners, regions, types)
        0.0 = completely dependent (same owner, same type, same region)
        """
        if len(urls) <= 1:
            return 1.0 if urls else 0.0

        domains = [_extract_domain(u) for u in urls]
        owners = [_get_owner(d) for d in domains]
        regions = [_get_region_from_tld(d) for d in domains]
        types = [_get_media_type(d) for d in domains]

        unique_owners = len(set(owners))
        unique_regions = len(set(r for r in regions if r is not None))
        unique_types = len(set(t for t in types if t is not None))

        n = len(urls)

        # Weighted combination
        owner_score = unique_owners / n if n > 0 else 0.0
        region_score = unique_regions / min(n, 5) if n > 0 else 0.0  # cap at 5 regions
        type_score = unique_types / min(n, 4) if n > 0 else 0.0  # cap at 4 types

        # Weight: owner independence matters most
        return round(owner_score * 0.5 + region_score * 0.3 + type_score * 0.2, 3)

    @staticmethod
    def cluster_independent_groups(urls: List[str]) -> List[List[str]]:
        """Group URLs into clusters by parent owner.

        Returns a list of groups, where each group shares a parent.
        """
        groups: Dict[str, List[str]] = {}
        for url in urls:
            domain = _extract_domain(url)
            owner = _get_owner(domain)
            groups.setdefault(owner, []).append(url)
        return list(groups.values())


# --- helpers -----------------------------------------------------------


def _extract_domain(url: str) -> str:
    """Extract the registered domain from a URL."""
    m = re.search(r"https?://([^:/]+)", url.lower())
    if m:
        return m.group(1)
    return url.lower().strip()


def _get_owner(domain: str) -> str:
    """Return the parent organization for a domain, or the domain itself."""
    for suffix, parent in _MEDIA_CONGLO_MAP.items():
        if domain.endswith(suffix) or domain == suffix:
            return parent
    return domain


def _get_region_from_tld(domain: str) -> Optional[str]:
    """Infer geographic region from the TLD."""
    parts = domain.split(".")
    if len(parts) >= 2:
        tld = parts[-1]
        return _REGION_MAP.get(tld)
    return None


def _get_media_type(domain: str) -> Optional[str]:
    """Classify the media type based on domain keywords."""
    for pattern, media_type in _TYPE_PATTERNS.items():
        if re.search(pattern, domain, re.IGNORECASE):
            return media_type
    return None
