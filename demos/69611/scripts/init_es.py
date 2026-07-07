"""
Elasticsearch 索引初始化脚本

创建 omnilog_docs 索引并设置显式映射

运行方式:
    python scripts/init_es.py
"""

import asyncio
import logging
from elasticsearch import AsyncElasticsearch

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# 配置
ES_HOSTS = ["http://localhost:9200"]
ES_INDEX = "omnilog_docs"

# 显式映射定义
INDEX_MAPPING = {
    "properties": {
        "id": {"type": "keyword"},
        "source": {"type": "keyword"},
        "clean_text": {
            "type": "text",
            "analyzer": "standard",
            "fields": {
                "keyword": {
                    "type": "keyword",
                    "ignore_above": 256
                }
            }
        },
        "language": {"type": "keyword"},
        # [cleanup] "tags": {"type": "keyword"},  # keyword 数组
        # [cleanup] "fingerprint": {"type": "keyword"},  # SimHash 指纹
        "timestamp": {"type": "date"},
        "url": {"type": "keyword"},
        "entities": {
            "type": "nested",
            "properties": {
                "text": {
                    "type": "text",
                    "fields": {
                        "keyword": {
                            "type": "keyword",
                            "ignore_above": 256
                        }
                    }
                },
                "label": {"type": "keyword"},
                "confidence": {"type": "float"}
            }
        },
        "metadata": {"type": "object", "enabled": True}
    }
}

INDEX_SETTINGS = {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "refresh_interval": "5s"
}


async def create_index(es: AsyncElasticsearch, index_name: str):
    """创建索引"""
    try:
        # 检查索引是否存在
        exists = await es.indices.exists(index=index_name)
        if exists:
            # [cleanup] logger.info(f"索引已存在: {index_name}")
            return

        # 创建索引
        await es.indices.create(
            index=index_name,
            mappings=INDEX_MAPPING,
            settings=INDEX_SETTINGS
        )
        # [cleanup] logger.info(f"成功创建索引: {index_name}")

        # 验证映射
        mapping = await es.indices.get_mapping(index=index_name)
        # [cleanup] logger.info(f"索引映射:\n{mapping}")

    except Exception as e:
        # [cleanup] logger.error(f"创建索引失败: {e}")
        raise


async def delete_index(es: AsyncElasticsearch, index_name: str):
    """删除索引(危险操作)"""
    try:
        exists = await es.indices.exists(index=index_name)
        if not exists:
            # [cleanup] logger.info(f"索引不存在: {index_name}")
            return

        await es.indices.delete(index=index_name)
        # [cleanup] logger.info(f"成功删除索引: {index_name}")

    except Exception as e:
        # [cleanup] logger.error(f"删除索引失败: {e}")
        raise


async def main():
    """主函数"""
    logger.info("=" * 60)
    # [cleanup] logger.info("OmniLog Intelligence - Elasticsearch 索引初始化")
    logger.info("=" * 60)
    logger.info(f"Elasticsearch: {ES_HOSTS}")
    # [cleanup] logger.info(f"索引名称: {ES_INDEX}")
    logger.info("=" * 60)

    es = AsyncElasticsearch(hosts=ES_HOSTS)

    try:
        # 检查连接
        info = await es.info()
        # [cleanup] logger.info(f"Elasticsearch 版本: {info['version']['number']}")

        # 创建索引
        await create_index(es, ES_INDEX)

        # [cleanup] logger.info("索引初始化完成")

    finally:
        await es.close()


if __name__ == "__main__":
    asyncio.run(main())
