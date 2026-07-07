"""pipelines/simhash.py 单元测试(纯函数部分)"""

import pytest

from utils.simhash import (
    DEFAULT_THRESHOLD,
    HASH_BITS,
    LSH_BANDS,
    LSH_BAND_BITS,
    LSH_BAND_MASK,
    compute_simhash,
    get_band_value,
    get_bucket_key,
    get_lsh_band_keys,
    hamming_distance,
    is_duplicate,
)


@pytest.mark.unit
class TestComputeSimhash:
    """compute_simhash 测试"""

    def test_empty_text_returns_zero(self):
        """空文本返回 0"""
        assert compute_simhash("") == 0

    def test_deterministic(self):
        """相同文本相同指纹"""
        h1 = compute_simhash("hello world")
        h2 = compute_simhash("hello world")
        assert h1 == h2

    def test_different_text_different_hash(self):
        """不同文本不同指纹"""
        h1 = compute_simhash("hello world")
        h2 = compute_simhash("goodbye world")
        assert h1 != h2

    def test_returns_64_bit(self):
        """返回值在 64-bit 范围内"""
        h = compute_simhash("test text")
        assert 0 <= h < (1 << HASH_BITS)

    def test_similar_text_low_hamming_distance(self):
        """相似文本汉明距离小"""
        h1 = compute_simhash("the quick brown fox jumps over the lazy dog")
        h2 = compute_simhash("the quick brown fox jumps over the lazy cat")
        # 仅末尾单词不同,汉明距离应较小
        assert hamming_distance(h1, h2) < 10


@pytest.mark.unit
class TestHammingDistance:
    """hamming_distance 测试"""

    def test_identical_hashes(self):
        """相同哈希距离为 0"""
        assert hamming_distance(0b1010, 0b1010) == 0

    def test_one_bit_difference(self):
        """1 bit 差异"""
        assert hamming_distance(0b1010, 0b1011) == 1

    def test_all_bits_different(self):
        """所有 bit 不同"""
        assert hamming_distance(0b1111, 0b0000) == 4

    def test_zero_hashes(self):
        """两个 0 距离为 0"""
        assert hamming_distance(0, 0) == 0


@pytest.mark.unit
class TestIsDuplicate:
    """is_duplicate 测试"""

    def test_identical_hashes_are_duplicate(self):
        """相同哈希判重"""
        assert is_duplicate(12345, 12345) is True

    def test_close_hashes_within_threshold(self):
        """阈值内判重"""
        h1 = 0b11111111
        h2 = 0b11111110  # 距离 1
        assert is_duplicate(h1, h2, threshold=DEFAULT_THRESHOLD) is True

    def test_far_hashes_not_duplicate(self):
        """阈值外不判重"""
        h1 = 0b00000000
        h2 = 0b11111111  # 距离 8
        assert is_duplicate(h1, h2, threshold=3) is False

    def test_custom_threshold(self):
        """自定义阈值"""
        h1 = 0b0000
        h2 = 0b1111  # 距离 4
        assert is_duplicate(h1, h2, threshold=5) is True
        assert is_duplicate(h1, h2, threshold=3) is False


@pytest.mark.unit
class TestLSHBanding:
    """LSH 分桶函数测试"""

    def test_get_band_value_in_range(self):
        """band value 在掩码范围内"""
        fingerprint = (1 << HASH_BITS) - 1  # 全 1
        for band in range(LSH_BANDS):
            val = get_band_value(fingerprint, band)
            assert 0 <= val <= LSH_BAND_MASK

    def test_get_band_value_zero_fingerprint(self):
        """全 0 指纹的 band value 全为 0"""
        for band in range(LSH_BANDS):
            assert get_band_value(0, band) == 0

    def test_get_band_value_disjoint_bands(self):
        """不同 band 提取不同位"""
        # 设置每个 band 为不同的值
        fingerprint = 0
        for band in range(LSH_BANDS):
            fingerprint |= (band + 1) << (band * LSH_BAND_BITS)

        for band in range(LSH_BANDS):
            assert get_band_value(fingerprint, band) == band + 1

    def test_get_bucket_key_format(self):
        """桶键格式正确"""
        key = get_bucket_key(0, 255)
        assert "omnilog:simhash:bucket:" in key
        assert "0:ff" in key

    def test_get_bucket_key_band_prefix(self):
        """桶键包含 band 编号"""
        key = get_bucket_key(3, 10)
        assert "bucket:3:" in key

    def test_get_lsh_band_keys_count(self):
        """LSH 桶键数量等于 band 数"""
        keys = get_lsh_band_keys("doc-123")
        assert len(keys) == LSH_BANDS

    def test_get_lsh_band_keys_contains_doc_id(self):
        """LSH 桶键包含文档 ID"""
        keys = get_lsh_band_keys("doc-123")
        for key in keys:
            assert "doc-123" in key

    def test_get_lsh_band_keys_different_bands(self):
        """不同 band 的桶键不同"""
        keys = get_lsh_band_keys("doc-123")
        assert len(set(keys)) == LSH_BANDS
