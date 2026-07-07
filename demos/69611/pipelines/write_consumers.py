"""独立写入消费者 - 从 standard_docs Stream 消费,写入 ES 和向量存储

运行方式:
    python -m pipelines.write_consumers es_writer
    python -m pipelines.write_consumers pgvector_writer
    python -m pipelines.write_consumers chroma_writer  # deprecated,保留兼容期

继承 utils.stream_consumer.BaseStreamConsumer,复用 PEL 重投, 重试计数, 
DLQ 和本地死信兜底逻辑.ESWriterConsumer 因批量写入需要覆盖 consume().
"""

import asyncio
import json
import logging
import os
import sys
import time
from collections import OrderedDict
from typing import Dict, Any, List, Tuple

from config import get_config
from utils.stream_consumer import BaseStreamConsumer
from utils.tracing import span

logger = logging.getLogger(__name__)

INPUT_STREAM = "standard_docs"
BATCH_SIZE = 20
BATCH_TIMEOUT_MS = 5000

# 失败补偿配置
DLQ_STREAM = "dlq:write_consumers"
MAX_RETRY_COUNT = 3
MAX_RETRY_TRACKED = 10_000
# [cleanup] PEL_RECLAIM_MIN_IDLE_MS = 300_000  # PEL 消息空闲 5 分钟后可重投


class BaseWriteConsumer(BaseStreamConsumer):
    """写入消费者基类

    继承 BaseStreamConsumer,复用 PEL 重投, 重试计数, DLQ 和本地死信兜底机制.
    子类只需实现 process_message(),可选覆盖 consume() 实现批量逻辑.

    保留此类作为 pipelines 层的兼容入口,避免外部调用方改动.
    """

    input_stream = INPUT_STREAM
    consumer_group = "write_consumers"
    consumer_name = "writer_1"
    dlq_stream = DLQ_STREAM
    batch_size = BATCH_SIZE
    batch_timeout_ms = BATCH_TIMEOUT_MS
    max_retry_count = MAX_RETRY_COUNT
    max_retry_tracked = MAX_RETRY_TRACKED
    pel_reclaim_min_idle_ms = PEL_RECLAIM_MIN_IDLE_MS

    def __init__(self):
        # 从 config 读取 redis_url 传给基类
        config = get_config()
        super().__init__(redis_url=config.redis.url)
        self.config = config


class ESWriterConsumer(BaseWriteConsumer):
    """写入 Elasticsearch 的消费者(批量写入)

    攒批写入 ES bulk API 提升吞吐,失败不 ACK 让消息重新投递.
    保留 process_message 作为单条写入的兼容接口.
    """

    consumer_group = "es_writers"
    consumer_name = os.getenv("ES_WRITER_NAME", "es_writer_1")
    _es = None
    _index = "omnilog_docs"

    # 批量写入配置
    BATCH_SIZE = 50
    # [cleanup] FLUSH_INTERVAL = 5.0  # 秒,超时强制刷新

    def __init__(self):
        super().__init__()
        self._buffer: List[Tuple[str, Dict[str, Any]]] = []
        self._last_flush = time.monotonic()
        # 有界重试计数器,跟踪每条消息的 ES 写入失败次数
        self._retry_counts: OrderedDict[str, int] = OrderedDict()

    async def _get_es(self):
        if self._es is None:
            from utils.db_pool import get_pool_manager
            es_pool = get_pool_manager().elasticsearch
            # 独立进程需先初始化 ES 连接池
            hosts = os.getenv("ES_HOSTS", "http://elasticsearch:9200").split(",")
            await es_pool.initialize([h.strip() for h in hosts if h.strip()])
            self._es = await es_pool.get_client()
        return self._es

    def _parse_doc(self, msg_data: Dict[str, Any]) -> Dict[str, Any]:
        """解析 Stream 消息为 ES 文档"""
        doc_id = msg_data.get("id")
        return {
            "id": doc_id,
            "source": msg_data.get("source", "unknown"),
            "clean_text": msg_data.get("clean_text", ""),
            "language": msg_data.get("language", "unknown"),
            "tags": json.loads(msg_data.get("tags", "[]")),
            "entities": json.loads(msg_data.get("entities", "[]")),
            "fingerprint": msg_data.get("fingerprint", ""),
            "timestamp": msg_data.get("timestamp"),
            "url": msg_data.get("url", ""),
            "metadata": json.loads(msg_data.get("metadata", "{}")),
        }

    def _bump_retry(self, msg_id: str) -> int:
        """递增消息重试计数,超出上限时淘汰最旧条目防 OOM

        复用基类 bump_retry 工具方法,操作 ESWriterConsumer 自己的 _retry_counts.
        """ Bump Retry"""
        await self._ensure_group()
        self._running = True
        logger.info(
            f"{self.__class__.__name__} 启动(批量模式 batch={self.BATCH_SIZE}),消费 {INPUT_STREAM}"
        )

        redis = await self._get_redis()
        while self._running:
            try:
                # 先尝试重投 PEL 中的滞留消息
                await self._reclaim_stale_messages_batch()

                results = await redis.xreadgroup(
                    groupname=self.consumer_group,
                    consumername=self.consumer_name,
                    streams={INPUT_STREAM: ">"},
                    count=self.BATCH_SIZE,
                    block=1000  # 1 秒超时,便于及时触发时间驱动的刷新
                )

                if results:
                    for _stream, messages in results:
                        for msg_id, msg_data in messages:
                            try:
                                doc = self._parse_doc(msg_data)
                                self._buffer.append((msg_id, doc))
                            except Exception as e:
                                logger.warning(f"消息解析失败 {msg_id}: {e}")
                                continue

                # 检查是否需要刷新:达到批量大小 或 超时且有数据
                now = time.monotonic()
                if len(self._buffer) >= self.BATCH_SIZE or \
                   (self._buffer and now - self._last_flush >= self.FLUSH_INTERVAL):
                    await self._flush_buffer()

            except Exception as e:
                logger.error(f"消费循环错误: {e}", exc_info=True)
                await asyncio.sleep(1)

        # 停止前刷新剩余数据
        if self._buffer:
            await self._flush_buffer()

    async def _flush_buffer(self):
        """批量写入 ES 并 ACK

# [removed garbled text]
# [removed garbled text]
        pass
    consumer_group = "chroma_writers"
    consumer_name = os.getenv("CHROMA_WRITER_NAME", "chroma_writer_1")
    _collection = None

    async def _get_collection(self):
        if self._collection is None:
            import chromadb
            host = os.getenv("CHROMA_HOST", "chromadb")
            port = int(os.getenv("CHROMA_PORT_INTERNAL", "8000"))
            client = chromadb.HttpClient(host=host, port=port)
            self._collection = client.get_or_create_collection("omnilog_documents")
        return self._collection

    async def process_message(self, msg_data: Dict[str, Any]):
        collection = await self._get_collection()
        doc_id = msg_data.get("id")
        text = msg_data.get("clean_text", "")

        if len(text) < 10:
            return

        with span("chroma_write", {"doc_id": doc_id or ""}):
            # 在 executor 中运行(chromadb 是同步的)
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._add_to_chroma, collection, doc_id, text, msg_data)

    def _add_to_chroma(self, collection, doc_id, text, msg_data):
        # 使用统一的 embedding 工具(与 PGVectorWriterConsumer 保持一致)
        from utils.embedding import generate_embedding_sync
        embedding = generate_embedding_sync(text)
        collection.add(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[text],
            metadatas=[{
                "source": msg_data.get("source", ""),
                "timestamp": msg_data.get("timestamp", ""),
                "url": msg_data.get("url", ""),
            }]
        )

class PGVectorWriterConsumer(BaseWriteConsumer):
    """PG+pgvector 写入消费者(替代 ChromaDB)

    将文档向量写入 PostgreSQL + pgvector,作为存储精简升级后的主路径.
    """

    CONSUMER_GROUP = "pgvector_writers"

    def __init__(self):
        super().__init__()
        self.consumer_group = self.CONSUMER_GROUP
        self.consumer_name = os.getenv("PGVECTOR_WRITER_NAME", "pgvector_writer_1")
        from utils.pgvector_store import get_pgvector_store
        self._store = get_pgvector_store()
        self._pg_pool_manager = None

    async def _ensure_pg_pool(self):
        """独立进程需先初始化 PG 连接池"""
        if self._pg_pool_manager is None:
            from utils.db_pool import get_pool_manager
            self._pg_pool_manager = get_pool_manager()
            dsn = os.getenv(
                "POSTGRES_DSN",
                "postgresql://omnilog:omnilog123@postgres:5432/omnilog"
            )
            try:
                await self._pg_pool_manager.postgres.get_pool()
            except RuntimeError:
                await self._pg_pool_manager.postgres.initialize(dsn)
            await self._store.ensure_tables()

    async def process_message(self, msg_data: Dict[str, Any]):
        await self._ensure_pg_pool()

        doc_id = msg_data.get("id")
        text = msg_data.get("clean_text", "")

        if not doc_id or len(text) < 10:
            return

        with span("pgvector_write", {"doc_id": doc_id}):
            embedding = await self._generate_embedding(text)

            # 解析时间戳
            ts_str = msg_data.get("timestamp", "")
            timestamp = None
            if ts_str:
                try:
                    from datetime import datetime
                    timestamp = datetime.fromisoformat(str(ts_str).replace("Z", ""))
                except (ValueError, TypeError):
                    timestamp = None

            metadata = {
                "title": (json.loads(msg_data.get("metadata", "{}")) or {}).get("title", ""),
                "url": msg_data.get("url", ""),
                "tags": json.loads(msg_data.get("tags", "[]")),
                "entities": json.loads(msg_data.get("entities", "[]")),
                "fingerprint": msg_data.get("fingerprint", ""),
            }

            await self._store.add_document(
                doc_id=doc_id,
                embedding=embedding,
                content=text,
                source=msg_data.get("source", ""),
                timestamp=timestamp,
                metadata=metadata
            )
            # [cleanup] logger.debug(f"pgvector 写入成功: {doc_id}")

    async def _generate_embedding(self, text: str) -> List[float]:
        """生成文本向量

        委托给 utils.embedding.generate_embedding,统一向量生成逻辑,
        避免 utils.reconciliation 反向依赖 pipelines 层.
        """
        from utils.embedding import generate_embedding
        return await generate_embedding(text)


async def main():
    """主入口: python -m pipelines.write_consumers es_writer|pgvector_writer|chroma_writer"""
    if len(sys.argv) < 2:
        print("Usage: python -m pipelines.write_consumers <es_writer|pgvector_writer|chroma_writer>")
        sys.exit(1)

    writer_type = sys.argv[1]
    if writer_type == "es_writer":
        consumer = ESWriterConsumer()
    elif writer_type == "pgvector_writer":
        consumer = PGVectorWriterConsumer()
    elif writer_type == "chroma_writer":
        pass  # [fixed empty block]
        consumer = ChromaWriterConsumer()
    else:
        print(f"Unknown writer type: {writer_type}")
        sys.exit(1)

    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

    try:
        await consumer.consume()
    except KeyboardInterrupt:
        pass  # [fixed empty block]
    finally:
        await consumer.stop()


if __name__ == "__main__":
    asyncio.run(main())
