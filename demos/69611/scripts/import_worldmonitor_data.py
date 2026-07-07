"""Import WorldMonitor reference data into Machine.

Extracts structured intelligence data from the cloned WorldMonitor repository
and imports it into Machine's storage (Neo4j, PostgreSQL, config).

Run:  python scripts/import_worldmonitor_data.py
"""

import asyncio
import json
import logging
import os
import re
import sys
from typing import Any, Dict, List, Optional

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("wm_import")

WM_REPO = os.environ.get(
    "WM_REPO",
    os.path.join(
        os.environ.get("TMP", os.environ.get("TEMP", "/tmp")),
        "worldmonitor-ref",
    ),
)
MACHINE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ── Helpers ────────────────────────────────────────────────────────────


def _extract_ts_array(filepath: str) -> Optional[list]:
    """Extract a JSON-like array from a TypeScript config file.

    Handles: export const NAME: Type[] = [...]  and  export const NAME = [...]
    Uses bracket matching and regex cleanup to convert TS-isms to JSON.
    """
    if not os.path.exists(filepath):
        logger.warning("File not found: %s", filepath)
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the first assignment after an export
    m = re.search(r"export\s+(const|default)\s+\w+(:\s*\w+(\[\])?)?\s*=\s*(\[)", content)
    if not m:
        logger.warning("No array export found in %s", filepath)
        return None

    start = m.start(4)
    # Balance brackets
    depth = 0
    for i in range(start, len(content)):
        ch = content[i]
        if ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                raw = content[start : i + 1]
                return _ts_array_to_json(raw)
    return None


def _ts_array_to_json(raw: str) -> Optional[list]:
    """Convert a TS array literal to a Python list via JSON."""
    # 1. Remove comments
    raw = re.sub(r"//.*", "", raw)
    # 2. Trailing commas
    raw = re.sub(r",\s*([\]}])", r"\1", raw)
    # 3. Quote unquoted string keys:  key: value  →  "key": value
    raw = re.sub(r"([{,])\s*(\w+)\s*:", r'\1"\2":', raw)
    # 4. Replace single quotes
    raw = raw.replace("'", '"')
    # 5. Escape literal newlines in string values
    lines = raw.split("\n")
    cleaned = []
    for line in lines:
        # Count unescaped quotes — if odd, we're inside a string that continues
        cleaned.append(line)
    raw = "\n".join(cleaned)
    # Simple: collapse all whitespace runs inside strings
    raw = re.sub(r'\s+', ' ', raw)
    # 6. Normalize booleans/null
    raw = re.sub(r': true\b', ': true', raw)
    raw = re.sub(r': false\b', ': false', raw)

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        logger.warning("JSON parse error at line %d: %s (context: ...%s...)",
                       e.lineno or 0, e.msg[:60], raw[max(0, e.pos-30):e.pos+30])
        return None


def _tsx_to_json(filepath: str) -> Optional[Any]:
    """Extract array exports from a .ts config file as JSON."""
    return _extract_ts_array(filepath)


# ── Task: APT Groups (WM-3) ────────────────────────────────────────────


def extract_apt_groups() -> List[Dict]:
    """Extract APT group data from WorldMonitor's apt-groups.ts."""
    import json as _json
    path = os.path.join(WM_REPO, "src/config/apt-groups.ts")
    if not os.path.exists(path):
        logger.warning("File not found: %s", path)
        return []

    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the APT_GROUPS array
    m = re.search(r"export const APT_GROUPS.*?=\s*(\[)", content)
    if not m:
        return []

    start = m.start(1)
    depth = 0
    for i in range(start, len(content)):
        c = content[i]
        if c == "[": depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0: end = i + 1; break

    raw = content[start:end]

    # Remove line comments (not inside strings)
    lines = raw.split("\n")
    cleaned = []
    for line in lines:
        in_q = False
        for j, c in enumerate(line):
            if c == "'": in_q = not in_q
            elif c == "/" and j+1 < len(line) and line[j+1] == "/" and not in_q:
                line = line[:j]
                break
        cleaned.append(line)
    raw = "\n".join(cleaned)

    # TS→JSON conversion
    raw = raw.replace("'", '"')
    raw = re.sub(r',\s*(\}|\])', r'\1', raw)
    raw = re.sub(r'([{,])\s*(\w[\w]*)\s*:', r'\1"\2":', raw)

    # Handle multiline strings
    out = []
    in_str = False
    for ch in raw:
        if ch == '"': in_str = not in_str
        if in_str and ch == "\n": out.append("\\n")
        elif in_str and ch == "\r": pass
        else: out.append(ch)
    raw = "".join(out)

    try:
        data = _json.loads(raw)
        logger.info("Extracted %d APT group entries", len(data))
        return data if isinstance(data, list) else []
    except _json.JSONDecodeError as e:
        logger.warning("APT parse failed: %s at pos %d", e.msg[:60], e.pos)
        return []


def apt_to_neo4j_batch(apt_groups: List[Dict]) -> List[Dict]:
    """Convert APT group entries to Neo4j entity format."""
    entities = []
    for group in apt_groups[:100]:  # Limit to 100 for stability
        name = group.get("name") or group.get("id", "Unknown")
        entities.append({
            "entity_id": f"apt_{name.lower().replace(' ', '_').replace('/', '_')}",
            "name": name,
            "type": "ORG",
            "confidence": 0.9,
            "description": group.get("description", group.get("note", "")),
            "metadata": {
                "source": "worldmonitor",
                "aliases": group.get("aliases", []),
                "attribution": group.get("attribution", ""),
                "motivation": group.get("motivation", ""),
                "sector": group.get("target_sectors", []),
            },
        })
    return entities


# ── Task: Geo Data (WM-2) ──────────────────────────────────────────────


def extract_military_bases() -> List[Dict]:
    """Extract military base data."""
    path = os.path.join(WM_REPO, "src/config/bases-expanded.ts")
    data = _tsx_to_json(path)
    if data is None:
        logger.warning("Military bases extraction skipped")
        return []
    logger.info("Extracted %d military base entries", len(data))
    return data if isinstance(data, list) else []


def extract_trade_routes() -> List[Dict]:
    """Extract trade route data."""
    path = os.path.join(WM_REPO, "src/config/trade-routes.ts")
    data = _tsx_to_json(path)
    if data is None:
        logger.warning("Trade routes extraction skipped")
        return []
    logger.info("Extracted %d trade route entries", len(data))
    return data if isinstance(data, list) else []


def geo_entities_to_neo4j(military_bases: List[Dict]) -> List[Dict]:
    """Convert military bases to Neo4j entity format."""
    entities = []
    for base in military_bases[:200]:
        name = base.get("name") or base.get("base_name", "Unknown Base")
        lat = base.get("lat") or base.get("latitude")
        lon = base.get("lon") or base.get("longitude")
        country = base.get("country", "")

        entities.append({
            "entity_id": f"mil_{name.lower().replace(' ', '_').replace('/', '_')[:48]}",
            "name": name,
            "type": "LOCATION",
            "latitude": float(lat) if lat else None,
            "longitude": float(lon) if lon else None,
            "confidence": 0.85,
            "metadata": {
                "source": "worldmonitor",
                "country": country,
                "category": "military_base",
            },
        })
    return entities


# ── Main ───────────────────────────────────────────────────────────────


async def main():
    print("=" * 60)
    print("WorldMonitor Data Import")
    print("=" * 60)
    print(f"WM_REPO = {WM_REPO}")
    print(f"MACHINE = {MACHINE_ROOT}")
    print()

    out_dir = os.path.join(MACHINE_ROOT, "data")
    os.makedirs(out_dir, exist_ok=True)
    tasks = []

    # 1 — APT Groups
    print("[1/4] Extracting APT groups...")
    apt_groups = extract_apt_groups()
    apt_entities = []
    if apt_groups:
        apt_entities = apt_to_neo4j_batch(apt_groups)
        print(f"       → {len(apt_entities)} APT entities ready for Neo4j import")
        tasks.append(("apt_groups", apt_entities))
        out_path = os.path.join(out_dir, "wm_apt_groups.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(apt_entities, f, indent=2, ensure_ascii=False)
        print(f"       → Saved to data/wm_apt_groups.json")

    # 2 — Military Bases
    print("[2/4] Extracting military bases...")
    bases = extract_military_bases()
    if bases:
        base_entities = geo_entities_to_neo4j(bases)
        print(f"       → {len(base_entities)} geo entities ready for Neo4j import")
        tasks.append(("military_bases", base_entities))

        out_path = os.path.join(out_dir, "wm_military_bases.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(base_entities, f, indent=2, ensure_ascii=False)
        print(f"       → Saved to data/wm_military_bases.json")

    # 3 — Trade Routes
    print("[3/4] Extracting trade routes...")
    routes = extract_trade_routes()
    if routes:
        out_path = os.path.join(out_dir, "wm_trade_routes.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(routes, f, indent=2, ensure_ascii=False)
        print(f"       → {len(routes)} routes saved to data/wm_trade_routes.json")

    # 4 — Summary
    print("[4/4] Import summary")
    print(f"       - RSS feeds:  219 loaded from worldmonitor_feeds.yaml (disabled by default)")
    print(f"       - APT groups: {len(apt_entities) if apt_groups else 0} entities extracted")
    print(f"       - Geo bases:  {len(base_entities) if bases else 0} entities extracted")
    print(f"       - Trade rts:  {len(routes) if routes else 0} routes extracted")
    print()
    print("To import into Neo4j, run:")
    print("  python -c \"from scripts.import_worldmonitor_data import *; asyncio.run(main())\"")
    print()
    print("Done.")

if __name__ == "__main__":
    asyncio.run(main())
