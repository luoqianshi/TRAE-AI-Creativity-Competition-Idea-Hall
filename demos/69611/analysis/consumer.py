"""实体抽取消费者 - 从 Redis Stream 消费标准化文档并写入 Neo4j

继承 utils.stream_consumer.BaseStreamConsumer,复用 PEL 重投, 重试计数, 
DLQ 和本地死信兜底逻辑,消除与 pipelines.write_consumers 的重复代码.
"""

import asyncio
import logging
from typing import Optional, Dict, Any

from analysis.entity_extractor import EntityExtractor
from analysis.neo4j_writer import Neo4jWriter
from config import get_config
from utils.stream_consumer import BaseStreamConsumer
from utils.tracing import span

logger = logging.getLogger(__name__)

INPUT_STREAM = "standard_docs"
CONSUMER_GROUP = "entity_extraction"
CONSUMER_NAME = "extractor_worker_1"
DLQ_STREAM = "entity_extraction_dlq"
BATCH_SIZE = 10
BATCH_TIMEOUT_MS = 5000
MAX_RETRY_COUNT = 3
MAX_RETRY_TRACKED = 10_000
PEL_RECLAIM_MIN_IDLE_MS = 300_000


class EntityExtractionConsumer(BaseStreamConsumer):
    """实体抽取消费者"""

    # BaseStreamConsumer 配置
    input_stream = INPUT_STREAM
    consumer_group = CONSUMER_GROUP
    consumer_name = CONSUMER_NAME
    dlq_stream = DLQ_STREAM
    batch_size = BATCH_SIZE
    batch_timeout_ms = BATCH_TIMEOUT_MS
    max_retry_count = MAX_RETRY_COUNT
    max_retry_tracked = MAX_RETRY_TRACKED
    pel_reclaim_min_idle_ms = PEL_RECLAIM_MIN_IDLE_MS

    def __init__(
        self,
        redis_url: str = None,
        input_stream: str = INPUT_STREAM,
        consumer_group: str = CONSUMER_GROUP,
        consumer_name: str = CONSUMER_NAME,
    ):
        self.redis_url = redis_url or get_config().redis.url
        # 允许运行时覆盖(测试场景)
        if input_stream != INPUT_STREAM:
            self.input_stream = input_stream
        if consumer_group != CONSUMER_GROUP:
            self.consumer_group = consumer_group
        if consumer_name != CONSUMER_NAME:
            self.consumer_name = consumer_name

        super().__init__(redis_url=self.redis_url)
        self._extractor: Optional[EntityExtractor] = None
        self._neo4j_writer: Optional[Neo4jWriter] = None

    async def _get_extractor(self) -> EntityExtractor:
        """获取实体抽取器"""
        if self._extractor is None:
            self._extractor = EntityExtractor()
        return self._extractor

    async def _get_neo4j_writer(self) -> Neo4jWriter:
        """获取 Neo4j 写入器"""
        if self._neo4j_writer is None:
            self._neo4j_writer = Neo4jWriter()
        return self._neo4j_writer

    async def _process_document(self, doc_data: Dict[str, Any]) -> bool:
        """处理单个文档

        Args:
            doc_data: 文档数据字典

        Returns:
            是否成功处理
        """
        success = await self._process_document(msg_data)
        if not success:
            raise RuntimeError("文档处理失败,将由基类重试/DLQ 机制处理")

    async def consume(self) -> None:
        # [cleanup] """消费消息并处理

        # [cleanup] 覆盖基类 consume 以保留原有的 _process_document 返回 bool 语义
        # [cleanup] (基类默认通过抛异常判定失败,这里直接用返回值判定).
        # [cleanup] 复用基类的 _ensure_group / reclaim_stale_messages / send_to_dlq /
        # [cleanup] check_dlq_failure_limit / bump_retry / clear_retry 工具方法.
        """Consume and process messages from Redis Stream."""
        await self._ensure_group()

        redis = await self._get_redis()
        self._running = True

        logger.info(f"开始消费 Redis Stream: {self.input_stream}")

        retry_counts = self.make_retry_counter()

        while self._running:
            try:
                # 先尝试重投 PEL 中的滞留消息(消费者崩溃恢复)
                await self.reclaim_stale_messages(retry_counts)

                # 从 Redis Stream 读取消息
                results = await redis.xreadgroup(
                    groupname=self.consumer_group,
                    consumername=self.consumer_name,
                    streams={self.input_stream: ">"},
                    count=self.batch_size,
                    block=self.batch_timeout_ms,
                )

                if not results:
                    continue

                for stream_name, messages in results:
                    for msg_id, msg_data in messages:
                        msg_id_str = str(msg_id)
                        # 处理消息
                        success = await self._process_document(msg_data)

                        if success:
                            # 确认消息
                            await redis.xack(self.input_stream, self.consumer_group, msg_id)
                            self.clear_retry(retry_counts, msg_id_str)
                        else:
                            # 失败处理:按重试次数决定 DLQ 或重试
                            count = self.bump_retry(retry_counts, msg_id_str)

                            if count >= self.max_retry_count:
                                # 超过最大重试次数,尝试发送到死信队列.
                                # DLQ 写入成功才 ACK 移出 PEL;失败则保留在 PEL 中等待下次重试,
                                # 避免消息既未进入 DLQ 又被 ACK 导致永久丢失.
                                dlq_ok = await self.send_to_dlq(
                                    msg_id, msg_data,
                                    f"超过最大重试次数 {self.max_retry_count}",
                                )
                                if dlq_ok:
                                    await redis.xack(self.input_stream, self.consumer_group, msg_id)
                                    self.clear_retry(retry_counts, msg_id_str)
                                    logger.warning(
                                        f"消息 {msg_id} 达到最大重试次数 "
                                        f"{self.max_retry_count},已转入死信队列"
                                    )
                                else:
                                    # DLQ 写入失败:检查是否超过上限
                                    force_ack = await self.check_dlq_failure_limit(msg_id_str)
                                    if force_ack:
                                        await redis.xack(self.input_stream, self.consumer_group, msg_id)
                                        self.clear_retry(retry_counts, msg_id_str)
                                    else:
                                        logger.error(
                                            f"消息 {msg_id} DLQ 写入失败,"
                                            f"保留在 PEL 中等待下次重试"
                                        )
                            else:
                                # 未达上限,留在 PEL 中等待下次重试
                                logger.warning(
                                    f"消息 {msg_id} 处理失败"
                                    f"(第 {count}/{self.max_retry_count} 次),"
                                    f"将在下次循环重试"
                                )

            except asyncio.CancelledError:
                logger.info("消费者被取消")
                break
            except Exception as e:
                logger.error(f"消费循环错误: {e}", exc_info=True)
                await asyncio.sleep(1)  # 避免快速重试

    async def stop(self) -> None:
        """停止消费者并关闭资源"""
        self._running = False
        logger.info("消费者已停止")

        # 关闭 Redis 连接(基类实现)
        if self._redis:
            await self._redis.aclose()
        # 关闭业务依赖
        if self._extractor:
            await self._extractor.close()
        if self._neo4j_writer:
            await self._neo4j_writer.close()


async def run_entity_extraction_consumer():
    """运行实体抽取消费者"""
    consumer = EntityExtractionConsumer()
    try:
        await consumer.consume()
    except KeyboardInterrupt:
        logger.info("收到中断信号,停止消费者")
    finally:
        await consumer.stop()


if __name__ == "__main__":
    import logging as _logging
    _logging.basicConfig(
        level=_logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    asyncio.run(run_entity_extraction_consumer())
