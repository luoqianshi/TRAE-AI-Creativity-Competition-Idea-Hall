#!/usr/bin/env python3
"""
MAP 文件内存分析工具

解析 ARM armlink 生成的 MAP 文件，生成交互式 HTML 内存分析报告。

Usage:
    python map_analyzer.py omni.map
    python map_analyzer.py omni.map -o report.html
    python map_analyzer.py omni.map --json map_data.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from parser import parse_map_file

SCRIPT_DIR = Path(__file__).resolve().parent
TEMPLATE_PATH = SCRIPT_DIR / "assets" / "template.html"


def generate_html(data: dict, output: Path) -> None:
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    json_str = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    html = template.replace("__MAP_DATA__", json_str)
    output.write_text(html, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="ARM MAP file memory analyzer")
    parser.add_argument("map_file", type=Path, help="Path to .map file")
    parser.add_argument(
        "-o", "--output",
        type=Path,
        default=None,
        help="Output HTML report path (default: <map_file>.html)",
    )
    parser.add_argument(
        "--json",
        type=Path,
        default=None,
        help="Also export parsed data as JSON",
    )
    args = parser.parse_args()

    if not args.map_file.exists():
        print(f"Error: file not found: {args.map_file}", file=sys.stderr)
        return 1

    analysis = parse_map_file(args.map_file)
    data = analysis.to_dict()

    output = args.output or args.map_file.with_suffix(".html")
    generate_html(data, output)

    if args.json:
        args.json.write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    s = data["summary"]
    print(f"Parsed: {args.map_file.name}")
    print(f"  ROM: {s['total_rom']:,} B ({s['total_rom']/1024:.2f} kB)")
    print(f"  RAM: {s['total_ram']:,} B ({s['total_ram']/1024:.2f} kB)")
    obj_count = sum(1 for e in data["entries"] if e["kind"] == "object")
    lib_count = sum(1 for e in data["entries"] if e["kind"] == "library")
    print(f"  Files: {obj_count} objects + {lib_count} library members")
    print(f"  Categories: {len(data['categories'])}")
    print(f"Report: {output}")
    if args.json:
        print(f"JSON:   {args.json}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
