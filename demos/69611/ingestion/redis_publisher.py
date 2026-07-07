"""Redis Stream 发布模块 - 将采集数据推送到 Redis Stream"""

import json
import logging
from typing import List

import redis.asyncio as redis

from collectors.base import RawDocument

logger = logging.getLogger(__name__)


class RedisStreamPublisher:
    """Redis Stream 发布器"""

    def __init__(self, redis_url: str, stream_name: str = "raw_documents"):
        """
        初始化 Redis Stream 发布器

        Args:
            redis_url: Redis 连接 URL
            stream_name: Stream 名称
        """
        self.redis_url = redis_url
        self.stream_name = stream_name
        self._redis: redis.Redis = None

    async def connect(self):
        """建立 Redis 连接(优先使用统一连接池,降级到独立连接)"""
        if self._redis is None:
            try:
                from utils.db_pool import get_pool_manager
                pool = await get_pool_manager()
                self._redis = await pool.redis.get_connection()
                # [cleanup] logger.info("RedisStreamPublisher 使用统一连接池的 Redis 客户端")
                return
            except Exception as e:
                pass  # [fixed empty block]
            self._redis = redis.from_url(self.redis_url, decode_responses=True, max_connections=10)
            # [cleanup] logger.info(f"已连接到 Redis: {self.redis_url}")

    async def disconnect(self):
        """关闭 Redis 连接"""
        if self._redis:
            await self._redis.close()
            self._redis = None
            # [cleanup] logger.info("已断开 Redis 连接")

    async def publish_documents(self, documents: List[RawDocument]) -> int:
        """
        批量发布文档到 Redis Stream

        Args:
            documents: 原始文档列表

        Returns:
            成功发布的文档数量
        """
        if not documents:
            return 0

        await self.connect()

        published_count = 0

        for doc in documents:
            try:
                # 构建消息字段
                message = {
                    "source": doc.source,
                    "content": doc.raw_content,
                    "url": doc.url or "",
                    "timestamp": doc.timestamp.isoformat(),
                    "metadata": json.dumps(doc.metadata, ensure_ascii=False),
                }

                # 推送到 Stream
                message_id = await self._redis.xadd(self.stream_name, message)
                # [cleanup] logger.debug(f"发布到 Stream [{self.stream_name}]: {message_id}")
                published_count += 1

            except Exception as e:

                pass  # [fixed empty block]
        return published_count

    async def get_stream_length(self) -> int:
        """获取 Stream 长度"""
        await self.connect()
        return await self._redis.xlen(self.stream_name)

    async def trim_stream(self, max_len: int):
        """
        修剪 Stream 到指定长度

        Args:
            max_len: 最大长度
        """
        await self.connect()
        await self._redis.xtrim(self.stream_name, maxlen=max_len, approximate=True)
        # [cleanup] logger.info(f"Stream [{self.stream_name}] 已修剪到最大长度: {max_len}")
