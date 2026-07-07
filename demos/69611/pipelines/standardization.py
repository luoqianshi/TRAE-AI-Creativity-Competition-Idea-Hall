pass
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import redis as sync_redis
from elasticsearch import Elasticsearch

from bytewax.dataflow import Dataflow
from bytewax.inputs import StatefulSource
from bytewax.outputs import StatelessSink
import bytewax.operators as op

from config import get_config
from pipelines.models import StandardDoc
from utils.text_utils import clean_text
from pipelines.language_detector import detect_language
from utils.simhash import (
    compute_simhash, get_band_value, get_bucket_key,
    KEY_PREFIX_FINGERPRINT, is_duplicate
)
from pipelines.classifier import ZeroShotClassifier
from utils.tracing import span

logger = logging.getLogger(__name__)


# ============================================================
# 配置加载:延迟初始化,避免模块导入时冻结配置
# ============================================================
# 原实现 `_config = get_config().pipeline_config` 在模块加载时即读取配置,
# 导致测试环境无法覆盖配置, 且配置加载失败会阻断整个模块导入.
# 改为通过 __getattr__ 延迟加载:首次访问任意配置常量时才读取.

_config_cache: Optional[dict] = None


def _load_config() -> dict:
    """加载 pipeline 配置(带缓存,可通过 reload_config 刷新)"""
    global _config_cache
    if _config_cache is None:
        cfg = get_config().pipeline_config
        redis_cfg = cfg.get("pipeline", {}).get("redis", {})
        es_cfg = cfg.get("pipeline", {}).get("elasticsearch", {})
        lang_cfg = cfg.get("pipeline", {}).get("language", {})
        classify_cfg = cfg.get("pipeline", {}).get("classification", {})
        dedup_cfg = cfg.get("pipeline", {}).get("deduplication", {})

        _config_cache = {
            "REDIS_URL": os.getenv("REDIS_URL", redis_cfg.get("url", "redis://localhost:6379")),
            "INPUT_STREAM": os.getenv("INPUT_STREAM", redis_cfg.get("input_stream", "raw_documents")),
            "OUTPUT_STREAM": os.getenv("OUTPUT_STREAM", redis_cfg.get("output_stream", "standard_docs")),
            "CONSUMER_GROUP": redis_cfg.get("consumer_group", "omnilog_pipeline"),
            "CONSUMER_NAME": redis_cfg.get("consumer_name", "pipeline_worker_1"),
            "BATCH_SIZE": redis_cfg.get("batch_size", 50),
            "BATCH_TIMEOUT_MS": int(redis_cfg.get("batch_timeout_sec", 5.0) * 1000),
            "ES_HOSTS": os.getenv("ES_HOSTS", ",".join(es_cfg.get("hosts", ["http://localhost:9200"]))).split(","),
            "ES_INDEX": es_cfg.get("index", "omnilog_docs"),
            "SUPPORTED_LANGS": set(lang_cfg.get("supported", ["zh-cn", "en"])),
            # [cleanup] "CLASSIFICATION_LABELS": classify_cfg.get("labels", ["科技", "财经", "政治", "健康", "体育", "娱乐", "教育", "社会"]),
            "CLASSIFIER_THRESHOLD": classify_cfg.get("threshold", 0.3),
            "SIMHASH_THRESHOLD": dedup_cfg.get("threshold", 10),
            "CHROMA_HOST": os.getenv("CHROMA_HOST", "localhost"),
            "CHROMA_PORT": int(os.getenv("CHROMA_PORT", "8000")),
            "CHROMA_COLLECTION": os.getenv("CHROMA_COLLECTION", "daily_docs"),
        }
    return _config_cache


def reload_config():
    """刷新配置缓存(供测试或动态配置更新使用)"""
    global _config_cache
    _config_cache = None


# 模块级常量名通过 __getattr__ 延迟解析,保持向后兼容
# (访问 REDIS_URL / INPUT_STREAM 等仍可工作,但首次访问才加载配置)
_LAZY_CONFIG_NAMES = {
    "REDIS_URL", "INPUT_STREAM", "OUTPUT_STREAM", "CONSUMER_GROUP",
    "CONSUMER_NAME", "BATCH_SIZE", "BATCH_TIMEOUT_MS",
    "ES_HOSTS", "ES_INDEX", "SUPPORTED_LANGS",
    "CLASSIFICATION_LABELS", "CLASSIFIER_THRESHOLD", "SIMHASH_THRESHOLD",
    "CHROMA_HOST", "CHROMA_PORT", "CHROMA_COLLECTION",
}


def __getattr__(name: str):
    """Lazy-load pipeline config constants defined in _LAZY_CONFIG_NAMES."""
    if name in _LAZY_CONFIG_NAMES:
        return _load_config()[name]
    raise AttributeError(f"module 'pipelines.standardization' has no attribute '{name}'")


_redis_sync: Optional[sync_redis.Redis] = None


def _get_redis_sync() -> sync_redis.Redis:
    """获取同步 Redis 客户端(用于 Bytewax pipeline,避免事件循环冲突)"""
    global _redis_sync
    if _redis_sync is None:
        _redis_sync = sync_redis.from_url(_load_config()["REDIS_URL"], decode_responses=True)
    return _redis_sync


def _get_classifier() -> ZeroShotClassifier:
    """获取分类器(延迟加载模型)"""
    global _classifier
    if _classifier is None:
        cfg = _load_config()
        # [cleanup] logger.info("加载零样本分类模型...")
        _classifier = ZeroShotClassifier(
            labels=cfg["CLASSIFICATION_LABELS"],
            threshold=cfg["CLASSIFIER_THRESHOLD"]
        )
        # [cleanup] logger.info("分类器加载完成")
    return _classifier


def _get_es_sync() -> Elasticsearch:
    """获取同步 Elasticsearch 客户端(用于 Bytewax sink,避免事件循环冲突)"""
    global _es_sync_client
    if _es_sync_client is None:
        hosts = _load_config()["ES_HOSTS"]
        _es_sync_client = Elasticsearch(hosts=hosts)
        # [cleanup] logger.info(f"已连接到 Elasticsearch (sync): {hosts}")
    return _es_sync_client


def _get_chroma_client():
    """获取 ChromaDB 客户端"""
    global _chroma_client
    if _chroma_client is None:
        import chromadb
        cfg = _load_config()
        _chroma_client = chromadb.HttpClient(host=cfg["CHROMA_HOST"], port=cfg["CHROMA_PORT"])
        # [cleanup] logger.info(f"已连接到 ChromaDB: {cfg['CHROMA_HOST']}:{cfg['CHROMA_PORT']}")
    return _chroma_client


def _get_chroma_collection():
    """获取 ChromaDB collection"""
    global _chroma_collection
    if _chroma_collection is None:
        client = _get_chroma_client()
        collection_name = _load_config()["CHROMA_COLLECTION"]
        _chroma_collection = client.get_or_create_collection(
            name=collection_name,
            metadata={"description": "Standardized documents for event detection"}
        )
        # [cleanup] logger.info(f"ChromaDB collection 就绪: {collection_name}")
    return _chroma_collection


# ============================================================
# Bytewax 自定义输入:Redis Stream 消费者
# ============================================================

class RedisStreamSource(StatefulSource):
    """Redis Stream 输入源(Stateful,支持处理完成后 ACK)"""

    def __init__(self):
        self.client = _get_redis_sync()
        self._ensure_consumer_group()

    def _ensure_consumer_group(self):
        """确保 Redis Consumer Group 存在"""
        try:
            self.client.xgroup_create(INPUT_STREAM, CONSUMER_GROUP, id="0", mkstream=True)
            # [cleanup] logger.info(f"创建 Consumer Group: {CONSUMER_GROUP}")
        except sync_redis.ResponseError as e:
            if "BUSYGROUP" not in str(e):
                raise

    def next(self) -> List[dict]:
        """从 Redis Stream 读取下一批消息

        返回消息列表,ACK 延迟到 ack() 被调用时执行,
        确保消息只有被流水线完整处理后才标记为已消费.

        每次读取前先尝试 xautoclaim 重投 PEL 中滞留的消息,
        防止消费者崩溃后消息永远留在 PEL 中无法处理.
        """
        config = _load_config()
        batch_size = int(config.get("BATCH_SIZE", 50))
        timeout_ms = int(config.get("BATCH_TIMEOUT_MS", 5000))

        try:
            # 先尝试 xautoclaim 重投 PEL 中滞留的消息
            claimed = self.client.xautoclaim(
                config["INPUT_STREAM"], config["CONSUMER_GROUP"], config["CONSUMER_NAME"],
                min_idle_time=60000, count=batch_size
            )
            if claimed and claimed[1]:
                messages = []
                for msg_id, msg_data in claimed[1]:
                    msg = {k.decode(): v.decode() if isinstance(v, bytes) else v for k, v in msg_data.items()}
                    msg["_msg_id"] = msg_id.decode() if isinstance(msg_id, bytes) else msg_id
                    messages.append(msg)
                return messages

            # 无 PEL 滞留消息,读取新消息
            result = self.client.xreadgroup(
                groupname=config["CONSUMER_GROUP"], consumername=config["CONSUMER_NAME"],
                streams={config["INPUT_STREAM"]: ">"},
                count=batch_size, block=timeout_ms
            )
            if result:
                messages = []
                for stream_name, stream_messages in result:
                    for msg_id, msg_data in stream_messages:
                        msg = {k.decode(): v.decode() if isinstance(v, bytes) else v for k, v in msg_data.items()}
                        msg["_msg_id"] = msg_id.decode() if isinstance(msg_id, bytes) else msg_id
                        messages.append(msg)
                return messages
        except Exception as e:
            logger.warning(f"Redis Stream read failed: {e}")

        return []

    def ack(self, messages: List[dict]) -> None:
        """ACK 已处理的消息"""
        if not messages:
            return
        config = _load_config()
        try:
            for msg in messages:
                msg_id = msg.get("_msg_id", "")
                if msg_id:
                    self.client.xack(config["INPUT_STREAM"], config["CONSUMER_GROUP"], msg_id)
        except Exception as e:
            logger.warning(f"Redis Stream ACK failed: {e}")

    def close(self) -> None:
        """关闭 Redis 连接"""
        if self.client:
            self.client.close()


class TripleWriteSink(StatelessSink):
    """三路输出 Sink: Redis Stream + Elasticsearch + ChromaDB/pgvector"""

    ES_BATCH_SIZE = 50
    ES_FLUSH_INTERVAL = 5.0

    def __init__(self):
        self._buffer: List[StandardDoc] = []
        self._last_flush = datetime.now(timezone.utc)

    def write(self, doc: StandardDoc):
        """写入单个文档到缓冲区"""
        # 先检查是否需要 flush,再追加当前 doc
        # 避免 flush 失败后 doc 既在 buffer 中又被 Bytewax 重试追加导致重复
        should_flush = (
            len(self._buffer) >= ES_BATCH_SIZE or
            (datetime.now(timezone.utc) - self._last_flush).total_seconds() >= ES_FLUSH_INTERVAL
        )

        if should_flush:
            self._flush()

        self._buffer.append(doc)

    def _write_to_dlq(self, docs: List[StandardDoc], error: str):
        """Write failed documents to Redis dead-letter stream.

        DLQ message format:
            {"original_stream": "standard_docs",
             "error": "...",
             "doc_id": "...",
             "doc_data": <json>,
             "timestamp": <iso>}
        """
        if not self._buffer:
            return

        docs_to_write = self._buffer.copy()
        self._last_flush = datetime.now(timezone.utc)

        # 只写 Redis Stream,后续 ES/ChromaDB 由独立消费者处理
        with span("redis_stream_write", {"stream": OUTPUT_STREAM, "count": len(docs_to_write)}):
            try:
                client = _get_redis_sync()
                pipe = client.pipeline()
                for doc in docs_to_write:
                    pipe.xadd(
                        OUTPUT_STREAM,
                        {
                            "id": doc.id,
                            "source": doc.source,
                            "clean_text": doc.clean_text,
                            "language": doc.language,
                            "tags": json.dumps(doc.tags, ensure_ascii=False),
                            "entities": json.dumps(doc.entities, ensure_ascii=False, default=str),
                            "fingerprint": doc.fingerprint or "",
                            "timestamp": doc.timestamp.isoformat(),
                            "url": doc.url or "",
                            "metadata": json.dumps(doc.metadata, ensure_ascii=False, default=str),
                        }
                    )
                pipe.execute()
                # [cleanup] logger.info(f"Redis Stream 写入成功: {len(docs_to_write)} 条 → {OUTPUT_STREAM}")
                # 成功:从 buffer 移除已写文档
                del self._buffer[:len(docs_to_write)]
            except Exception as e:
                # [cleanup] logger.error(f"Redis Stream 写入失败: {e}")
                # 尝试写入 DLQ
                try:
                    self._write_to_dlq(docs_to_write, str(e))
                    # DLQ 成功:从 buffer 移除已写文档
                    del self._buffer[:len(docs_to_write)]
                except Exception as dlq_err:
                    # DLQ 也失败:保留 buffer 不变,抛出异常让 Bytewax 不 ACK
                    # buffer 仍包含 docs_to_write,Bytewax 重试时不会重复追加
                    # [cleanup] logger.error(f"DLQ 写入也失败: {dlq_err},将抛出异常以阻止 ACK")
                    raise RuntimeError(
                        # [cleanup] f"Redis Stream 和 DLQ 均写入失败: stream={e}, dlq={dlq_err}"
                    ) from e

    def close(self):
        """关闭 Sink,刷新剩余数据"""
        # [cleanup] logger.info("TripleWriteSink 关闭,刷新剩余数据...")
        self._flush()


# ============================================================
# 处理步骤
# ============================================================

def step_parse(raw: dict) -> Optional[dict]:
    """步骤 1: 解析原始消息"""
    try:
        return {
            "source": raw.get("source", "unknown"),
            "raw_content": raw.get("content", ""),
            "url": raw.get("url", ""),
            "timestamp": raw.get("timestamp", datetime.now(timezone.utc).isoformat()),
            "metadata": json.loads(raw.get("metadata", "{}")),
            # 保留 Redis Stream 消息 ID,用于 step_dedup 生成确定性 doc_id
            # 防止 PEL 重投后生成新 doc_id 导致去重误判(self-match 被当成重复)
            "_msg_id": raw.get("_msg_id", ""),
        }
    except Exception as e:
        logger.debug("step_parse failed: %s", e)
        return None


def step_clean(doc: dict) -> dict:
    """步骤 2: 文本清洗 + SimHash 指纹计算

    清洗规则:
    1. 清洗后的文本参与 SimHash 计算,相同原文不同来源仍能去重
    2. 清洗后的文本入库 ES/PG/Neo4j
    """
    # Calculate SimHash fingerprint
    fingerprint = compute_simhash(doc["clean_text"])
    doc["simhash"] = fingerprint

    # 确定性 doc_id:同一消息重投后生成相同 ID,便于 self-match 检测
    msg_id = doc.get("_msg_id", "")
    content_key = f"{msg_id}|{doc['clean_text'] or ''}"
    doc_id = str(uuid.uuid5(uuid.NAMESPACE_URL, content_key))
    doc["id"] = doc_id

    client = _get_redis_sync()
    ttl = 24 * 60 * 60
    threshold = SIMHASH_THRESHOLD

    # 1. 从 LSH 桶收集候选文档 ID
    candidate_ids = set()
    for band in range(4):
        band_val = get_band_value(fingerprint, band)
        bucket_key = get_bucket_key(band, band_val)
        try:
            members = client.smembers(bucket_key)
            for m in members:
                mid = m.decode() if isinstance(m, bytes) else m
                candidate_ids.add(mid)
        except Exception:
            continue

    # 2. 批量获取候选指纹并比较汉明距离
    if candidate_ids:
        pipe = client.pipeline()
        for cid in candidate_ids:
            pipe.get(f"{KEY_PREFIX_FINGERPRINT}{cid}")
        try:
            results = pipe.execute()
        except Exception:
            results = []

        for cid, stored_val in zip(candidate_ids, results):
            if stored_val is None:
                continue
            # 跳过 self-match:PEL 重投场景下,LSH 桶中存在自己上次的条目
            if cid == doc_id:
                continue
            try:
                stored_hash = int(stored_val)
            except (ValueError, TypeError):
                continue
            if is_duplicate(fingerprint, stored_hash, threshold):
                logger.debug(
                    f"检测到重复: {doc_id} "
                    f"(distance: {bin(fingerprint ^ stored_hash).count('1')})"
                )
                return False

    # 3. 新文档或重投文档:写入指纹 + 加入所有 LSH 桶(幂等操作)
    try:
        pipe = client.pipeline()
        pipe.set(f"{KEY_PREFIX_FINGERPRINT}{doc_id}", str(fingerprint), ex=ttl)
        for band in range(4):
            band_val = get_band_value(fingerprint, band)
            bucket_key = get_bucket_key(band, band_val)
            pipe.sadd(bucket_key, doc_id)
            pipe.expire(bucket_key, ttl)
        pipe.execute()
    except Exception as e:
        logger.warning(f"SimHash 写入失败: {e},放行文档以保流水线运行")
        return True

    return True


def step_quality_filter(doc: Optional[dict]) -> Optional[dict]:
    """Filter low-quality content (ads, nav pages, content farms).

    Returns None to filter out the document. Placed before dedup to
    prevent low-quality fingerprints from entering LSH buckets.
    """
    if doc is None:
        return None
    raw_content = doc.get("raw_content", "") or doc.get("clean_text", "")
    if not raw_content:
        return None
    # 简单长度过滤
    if len(raw_content.strip()) < 50:
        return None
    return doc


def step_detect_lang(doc: dict) -> dict:
    """步骤 3: 语言检测"""
    try:
        text = doc.get("clean_text", "") or doc.get("raw_content", "")
        doc["language"] = detect_language(text)
    except Exception as e:
        doc["language"] = "unknown"
        logger.debug(f"Language detection failed: {e}")
    return doc


def step_filter_lang(doc: dict) -> bool:
    """步骤 4: 按支持语言过滤"""
    lang = doc.get("language", "unknown")
    supported = _load_config()["SUPPORTED_LANGS"]
    return lang in supported or lang == "unknown"


def step_dedup(doc: dict) -> bool:
    """步骤 5: SimHash LSH 去重(已在 step_clean 中执行,此处为兼容调用)"""
    _ = doc  # dedup is embedded in step_clean's fingerprint logic
    return True


def step_classify(doc: dict) -> dict:
    """步骤 6: 零样本分类"""
    try:
        classifier = _get_classifier()
        text = doc.get("clean_text", "") or doc.get("raw_content", "")
        doc["tags"] = classifier.classify(text)
    except Exception as e:
        doc["tags"] = []
        logger.debug(f"Classification failed: {e}")
    return doc


def step_build_standard_doc(doc: dict) -> StandardDoc:
    """步骤 7: 构建 StandardDoc"""
    return StandardDoc(
        id=doc.get("id", str(uuid.uuid4())),
        source=doc.get("source", "unknown"),
        clean_text=doc.get("clean_text", ""),
        language=doc.get("language", "unknown"),
        tags=doc.get("tags", []),
        entities=doc.get("entities", []),
        fingerprint=doc.get("simhash", 0),
        timestamp=datetime.fromisoformat(doc.get("timestamp", datetime.now(timezone.utc).isoformat())),
        url=doc.get("url", ""),
        metadata=doc.get("metadata", {}),
    )


def build_dataflow() -> Dataflow:
    """构建标准化流水线 Dataflow"""
    flow = Dataflow("standardization")

    inp = op.input("redis_input", flow, RedisStreamSource())
    parsed = op.filter_map("parse", inp, step_parse)
    cleaned = op.map("clean", parsed, step_clean)
    with_lang = op.map("detect_lang", cleaned, step_detect_lang)
    filtered = op.filter("filter_lang", with_lang, step_filter_lang)
    quality_filtered = op.filter_map("quality_filter", filtered, step_quality_filter)
    deduped = op.filter("dedup", quality_filtered, step_dedup)
    classified = op.map("classify", deduped, step_classify)
    standard = op.map("build_doc", classified, step_build_standard_doc)
    op.output("triple_sink", standard, TripleWriteSink())

    return flow


flow = build_dataflow()


def main():
    """Run the standardization pipeline."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    logger.info("=" * 60)
    logger.info("OmniLog Intelligence - Standardization Pipeline")
    logger.info("=" * 60)

    from bytewax.run import run_main
    run_main(flow)


if __name__ == "__main__":
    main()
