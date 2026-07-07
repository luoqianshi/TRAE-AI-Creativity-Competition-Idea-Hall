"""utils/embedding.py 单元测试

使用 reset_embedding_model() 强制走 hash 降级路径,
避免触发 sentence-transformers 模型加载.
"""

import asyncio

import pytest

from utils.embedding import (
    DEFAULT_EMBEDDING_DIM,
    DEFAULT_EMBEDDING_MODEL,
    _hash_embedding,
    generate_embedding,
    generate_embedding_sync,
    generate_embeddings_batch,
    reset_embedding_model,
)


@pytest.fixture(autouse=True)
def reset_model():
    """每个测试前重置模型缓存,强制走 hash 降级"""
    reset_embedding_model()
    yield
    reset_embedding_model()


@pytest.mark.unit
class TestHashEmbedding:
    """hash 降级向量测试"""

    def test_deterministic_same_text_same_vector(self):
        """相同文本生成相同向量"""
        v1 = _hash_embedding("hello world")
        v2 = _hash_embedding("hello world")
        assert v1 == v2

    def test_different_text_different_vector(self):
        """不同文本生成不同向量"""
        v1 = _hash_embedding("hello")
        v2 = _hash_embedding("world")
        assert v1 != v2

    def test_default_dimension(self):
        """默认维度为 384"""
        v = _hash_embedding("test")
        assert len(v) == DEFAULT_EMBEDDING_DIM

    def test_custom_dimension(self):
        """自定义维度"""
        v = _hash_embedding("test", dim=128)
        assert len(v) == 128

    def test_values_in_range(self):
        """向量值在 [-1, 1] 范围内"""
        v = _hash_embedding("test text")
        assert all(-1.0 <= x <= 1.0 for x in v)

    def test_empty_text(self):
        """空文本也能生成向量"""
        v = _hash_embedding("")
        assert len(v) == DEFAULT_EMBEDDING_DIM


@pytest.mark.unit
class TestGenerateEmbedding:
    """异步 generate_embedding 测试"""

    @pytest.mark.asyncio
    async def test_returns_list_of_floats(self):
        """返回浮点数列表"""
        v = await generate_embedding("test text")
        assert isinstance(v, list)
        assert len(v) == DEFAULT_EMBEDDING_DIM
        assert all(isinstance(x, float) for x in v)

    @pytest.mark.asyncio
    async def test_deterministic_in_hash_mode(self):
        """hash 模式下相同文本相同向量"""
        v1 = await generate_embedding("hello")
        v2 = await generate_embedding("hello")
        assert v1 == v2

    @pytest.mark.asyncio
    async def test_default_model_name(self):
        """默认模型名常量正确"""
        assert DEFAULT_EMBEDDING_MODEL == "sentence-transformers/all-MiniLM-L6-v2"


@pytest.mark.unit
class TestGenerateEmbeddingsBatch:
    """异步批量生成测试"""

    @pytest.mark.asyncio
    async def test_empty_list_returns_empty(self):
        """空列表返回空列表"""
        result = await generate_embeddings_batch([])
        assert result == []

    @pytest.mark.asyncio
    async def test_single_text(self):
        """单文本批量调用"""
        result = await generate_embeddings_batch(["hello"])
        assert len(result) == 1
        assert len(result[0]) == DEFAULT_EMBEDDING_DIM

    @pytest.mark.asyncio
    async def test_multiple_texts(self):
        """多文本批量调用"""
        texts = ["hello", "world", "foo"]
        result = await generate_embeddings_batch(texts)
        assert len(result) == 3
        for v in result:
            assert len(v) == DEFAULT_EMBEDDING_DIM

    @pytest.mark.asyncio
    async def test_consistency_with_single(self):
        """批量与单条结果一致(hash 模式)"""
        texts = ["hello", "world"]
        batch_result = await generate_embeddings_batch(texts)
        single1 = await generate_embedding("hello")
        single2 = await generate_embedding("world")
        assert batch_result[0] == single1
        assert batch_result[1] == single2


@pytest.mark.unit
class TestGenerateEmbeddingSync:
    """同步 generate_embedding_sync 测试"""

    def test_returns_list_of_floats(self):
        """返回浮点数列表"""
        v = generate_embedding_sync("test text")
        assert isinstance(v, list)
        assert len(v) == DEFAULT_EMBEDDING_DIM

    def test_deterministic_in_hash_mode(self):
        """hash 模式下相同文本相同向量"""
        v1 = generate_embedding_sync("hello")
        v2 = generate_embedding_sync("hello")
        assert v1 == v2

    def test_consistency_with_async(self):
        """同步与异步结果一致(hash 模式)"""
        sync_v = generate_embedding_sync("test")
        async_v = asyncio.new_event_loop().run_until_complete(generate_embedding("test"))
        assert sync_v == async_v
