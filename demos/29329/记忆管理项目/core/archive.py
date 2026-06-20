"""
永久全量层 — append-only + 哈希链
比喻：保险柜，只写不读不改不删
"""
import json, time, hashlib, os
from pathlib import Path
from typing import Optional

class Archive:
    """永久全量档案——每条原始数据永久保存"""

    def __init__(self, path: str = None):
        self.path = Path(path or os.path.join(
            os.path.dirname(__file__), "..", "storage", "archive.jsonl"
        ))
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def write(self, entry: dict) -> str:
        """写入一条记录，返回记录ID（时间戳+哈希前缀）"""
        # 读取上一条的哈希形成链
        prev_hash = "0000"
        if self.path.exists() and self.path.stat().st_size > 0:
            with open(self.path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        prev_hash = json.loads(line).get("_hash", prev_hash)

        entry["_ts"] = time.time()
        entry["_prev_hash"] = prev_hash
        raw = json.dumps(entry, sort_keys=True, ensure_ascii=False)
        entry["_hash"] = hashlib.sha256(raw.encode()).hexdigest()[:16]

        with open(self.path, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

        return f"{entry['_ts']:.0f}_{entry['_hash']}"

    def read(self, record_id: str) -> Optional[dict]:
        """按记录ID读取（仅审计/反查时用）"""
        ts_part = record_id.split("_")[0]
        with open(self.path, "r", encoding="utf-8") as f:
            for line in f:
                d = json.loads(line)
                if f"{d['_ts']:.0f}_{d['_hash']}" == record_id:
                    return d
        return None

    def verify_chain(self) -> bool:
        """验证整条哈希链的完整性"""
        prev = "0000"
        with open(self.path, "r", encoding="utf-8") as f:
            for line in f:
                d = json.loads(line)
                if d.get("_prev_hash") != prev:
                    return False
                prev = d.get("_hash")
        return True

    def iter_all(self, after_ts: float = 0):
        """从头遍历全量（用于重新总结/审计）"""
        with open(self.path, "r", encoding="utf-8") as f:
            for line in f:
                d = json.loads(line)
                if d.get("_ts", 0) >= after_ts:
                    yield d
