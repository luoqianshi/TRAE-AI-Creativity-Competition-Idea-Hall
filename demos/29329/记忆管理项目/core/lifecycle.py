"""
时间轨道生命周期 — 归档 / 反查 / 复活
比喻：项目档案室 + 档案调取 + 重新上架
"""
import json, time, hashlib, shutil
from pathlib import Path
from typing import Optional
from .block import Block, BlockStore
from .archive import Archive


class LifecycleManager:
    """
    时间轨道管理——横向能力，贯穿所有层
    
    职责：
      - 项目收工时归档（打编码、打包、存静态库）
      - 按项目编码反查
      - 确认复活时回迁到活跃区
    """

    def __init__(self, store: BlockStore, archive: Archive):
        self.store = store
        self.archive = archive
        self.static_dir = Path(__file__).parent.parent / "storage" / "static"
        self.static_dir.mkdir(parents=True, exist_ok=True)

    def archive_project(self, project: str, summary: str = "") -> dict:
        """
        归档一个项目
        
        流程：
          1. 收集该项目所有区块
          2. 生成最终总结 + 快照
          3. 打包到静态库
          4. 活跃区只留摘要+项目编码+引用
        """
        blocks = self.store.by_project(project)
        if not blocks:
            return {"status": "error", "reason": "project not found"}

        # 1. 写入永久全量
        archive_id = self.archive.write({
            "type": "archive_snapshot",
            "project": project,
            "summary": summary,
            "block_count": len(blocks),
            "blocks": [b.to_dict() for b in blocks],
            "timestamp": time.time(),
        })

        # 2. 打包到静态库
        package = {
            "project": project,
            "archive_ref": archive_id,
            "summary": summary,
            "time": time.time(),
            "blocks": [b.to_dict() for b in blocks],
        }
        pkg_path = self.static_dir / f"{project}.json"
        with open(pkg_path, "w", encoding="utf-8") as f:
            json.dump(package, f, ensure_ascii=False, indent=2)

        # 3. 活跃区标记为archived，只留摘要
        for b in blocks:
            b.status = "archived"
            # 保留标题、摘要、project、archive_ref
            # 清空详细内容节省空间
            b.content = ""

        return {
            "status": "archived",
            "project": project,
            "block_count": len(blocks),
            "archive_ref": archive_id,
            "static_path": str(pkg_path),
        }

    def retrieve_project(self, project: str) -> Optional[dict]:
        """
        反查：按项目编码从静态库调取全部数据
        """
        pkg_path = self.static_dir / f"{project}.json"
        if not pkg_path.exists():
            return None
        with open(pkg_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def revive_project(self, project: str) -> dict:
        """
        复活：将已归档的项目从静态库恢复到活跃区
        
        流程：
          1. 从静态库读取数据包
          2. 重建区块（恢复content）
          3. 状态改回active
        """
        data = self.retrieve_project(project)
        if not data:
            return {"status": "error", "reason": "static package not found"}

        count = 0
        for bd in data.get("blocks", []):
            bd["status"] = "active"
            block = Block.from_dict(bd)
            self.store.add(block)
            count += 1

        # 写一条复活记录到全量
        self.archive.write({
            "type": "revive",
            "project": project,
            "block_count": count,
            "timestamp": time.time(),
        })

        return {"status": "revived", "project": project, "block_count": count}

    def list_archived(self) -> list:
        """列出所有已归档的项目"""
        projects = []
        for f in self.static_dir.glob("*.json"):
            try:
                with open(f, "r", encoding="utf-8") as fh:
                    data = json.load(fh)
                    projects.append({
                        "project": data.get("project"),
                        "summary": data.get("summary", "")[:50],
                        "block_count": len(data.get("blocks", [])),
                        "archived_at": data.get("time"),
                    })
            except:
                pass
        return sorted(projects, key=lambda x: -x.get("archived_at", 0))
