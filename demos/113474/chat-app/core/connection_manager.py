"""WebSocket 连接管理器（支持多设备同时在线）"""
from __future__ import annotations

import asyncio
from typing import Any

from fastapi import WebSocket
from app.logging import get_logger

logger = get_logger(__name__)


class ConnectionManager:
    """在线连接注册表：user_id -> set[WebSocket]

    支持同一用户多设备同时在线（手机 + 电脑）。
    """

    def __init__(self):
        self._connections: dict[str, set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, user_id: str, ws: WebSocket) -> None:
        """接受连接并注册"""
        await ws.accept()
        async with self._lock:
            if user_id not in self._connections:
                self._connections[user_id] = set()
            self._connections[user_id].add(ws)
        logger.info(f"用户 {user_id} WebSocket 已连接（在线设备: {len(self._connections[user_id])}）")

        # 通知该用户的其他设备：已上线（用于多端同步）
        await self._broadcast_presence(user_id, "online")

    async def disconnect(self, user_id: str, ws: WebSocket) -> None:
        """移除连接"""
        async with self._lock:
            conns = self._connections.get(user_id)
            if conns is None:
                return
            conns.discard(ws)
            if not conns:
                del self._connections[user_id]
                # 该用户全部下线
                logger.info(f"用户 {user_id} 已下线")
            else:
                logger.info(
                    f"用户 {user_id} 一个设备断开（剩余设备: {len(conns)}）"
                )

        if not self.is_online(user_id):
            await self._broadcast_presence(user_id, "offline")

    async def send_to_user(self, user_id: str, payload: dict[str, Any]) -> bool:
        """向用户所有在线设备推送消息，返回是否至少送达一个设备"""
        async with self._lock:
            conns = self._connections.get(user_id)
            if not conns:
                return False
            # 复制一份避免迭代中修改
            targets = list(conns)

        delivered = False
        dead = []
        for ws in targets:
            try:
                await ws.send_json(payload)
                delivered = True
            except Exception as e:
                logger.warning(f"推送失败（用户 {user_id}）：{e}")
                dead.append(ws)

        # 清理失效连接
        if dead:
            async with self._lock:
                conns = self._connections.get(user_id)
                if conns:
                    for ws in dead:
                        conns.discard(ws)
                    if not conns:
                        del self._connections[user_id]

        return delivered

    def is_online(self, user_id: str) -> bool:
        conns = self._connections.get(user_id)
        return bool(conns)

    def online_user_ids(self) -> list[str]:
        return list(self._connections.keys())

    async def _broadcast_presence(self, user_id: str, status: str) -> None:
        """广播上下线状态给可能相关的人（简化：广播给所有在线用户）"""
        payload = {"type": "presence", "data": {"user_id": user_id, "status": status}}
        async with self._lock:
            all_targets = [
                (uid, list(conns)) for uid, conns in self._connections.items()
                if uid != user_id
            ]
        for uid, conns in all_targets:
            for ws in conns:
                try:
                    await ws.send_json(payload)
                except Exception:
                    pass


# 全局单例
_manager: ConnectionManager | None = None


def get_connection_manager() -> ConnectionManager:
    global _manager
    if _manager is None:
        _manager = ConnectionManager()
    return _manager
