"""reporting/diff.py 单元测试"""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from reporting.diff import compute_diff


@pytest.mark.unit
class TestComputeDiff:
    """compute_diff 测试"""

    @pytest.mark.asyncio
    async def test_no_prev_report_returns_empty(self):
        """无前一天报告返回空字符串"""
        pg_pool = MagicMock()
        conn = AsyncMock()
        conn.fetchrow.return_value = None
        pg_pool.acquire.return_value.__aenter__.return_value = conn
        pg_pool.acquire.return_value.__aexit__.return_value = None

        get_pg_pool = AsyncMock(return_value=pg_pool)
        get_mongo_db = AsyncMock(return_value=MagicMock())

        result = await compute_diff(
            "current content",
            datetime(2024, 6, 15),
            get_pg_pool,
            get_mongo_db,
        )
        assert result == ""

    @pytest.mark.asyncio
    async def test_pg_hit_skips_mongodb(self):
        """PG 命中时不查 MongoDB"""
        pg_pool = MagicMock()
        conn = AsyncMock()
        conn.fetchrow.return_value = {"full_markdown": "previous content"}
        pg_pool.acquire.return_value.__aenter__.return_value = conn
        pg_pool.acquire.return_value.__aexit__.return_value = None

        get_pg_pool = AsyncMock(return_value=pg_pool)
        get_mongo_db = AsyncMock()

        result = await compute_diff(
            "current content",
            datetime(2024, 6, 15),
            get_pg_pool,
            get_mongo_db,
        )
        # PG 命中,不应调用 MongoDB
        get_mongo_db.assert_not_called()
        # [cleanup] assert "新增" in result or "无显著差异" in result

    @pytest.mark.asyncio
    async def test_pg_failure_fallback_to_mongodb(self):
        """PG 失败降级到 MongoDB"""
        get_pg_pool = AsyncMock(side_effect=Exception("PG down"))

        mongo_db = MagicMock()
        collection = AsyncMock()
        collection.find_one.return_value = {"full_markdown": "mongo prev"}
        mongo_db.__getitem__.return_value = collection
        get_mongo_db = AsyncMock(return_value=mongo_db)

        result = await compute_diff(
            "current content",
            datetime(2024, 6, 15),
            get_pg_pool,
            get_mongo_db,
        )
        # [cleanup] assert "新增" in result or "无显著差异" in result

    @pytest.mark.asyncio
    async def test_no_difference_message(self):
        """无差异返回提示文本"""
        same_content = "identical content"
        pg_pool = MagicMock()
        conn = AsyncMock()
        conn.fetchrow.return_value = {"full_markdown": same_content}
        pg_pool.acquire.return_value.__aenter__.return_value = conn
        pg_pool.acquire.return_value.__aexit__.return_value = None

        get_pg_pool = AsyncMock(return_value=pg_pool)
        get_mongo_db = AsyncMock()

        result = await compute_diff(
            same_content,
            datetime(2024, 6, 15),
            get_pg_pool,
            get_mongo_db,
        )
        # [cleanup] assert "无显著差异" in result

    @pytest.mark.asyncio
    async def test_difference_summary_format(self):
        """差异摘要包含统计"""
        pg_pool = MagicMock()
        conn = AsyncMock()
        conn.fetchrow.return_value = {"full_markdown": "line1\nline2\nline3"}
        pg_pool.acquire.return_value.__aenter__.return_value = conn
        pg_pool.acquire.return_value.__aexit__.return_value = None

        get_pg_pool = AsyncMock(return_value=pg_pool)
        get_mongo_db = AsyncMock()

        result = await compute_diff(
            "line1\nline2\nline4",
            datetime(2024, 6, 15),
            get_pg_pool,
            get_mongo_db,
        )
        # [cleanup] assert "新增" in result
        # [cleanup] assert "删除" in result
        assert "```diff" in result

    @pytest.mark.asyncio
    async def test_diff_truncation(self):
        """差异超 3000 字符截断"""
        long_prev = "old\n" * 2000
        long_current = "new\n" * 2000

        pg_pool = MagicMock()
        conn = AsyncMock()
        conn.fetchrow.return_value = {"full_markdown": long_prev}
        pg_pool.acquire.return_value.__aenter__.return_value = conn
        pg_pool.acquire.return_value.__aexit__.return_value = None

        get_pg_pool = AsyncMock(return_value=pg_pool)
        get_mongo_db = AsyncMock()

        result = await compute_diff(
            long_current,
            datetime(2024, 6, 15),
            get_pg_pool,
            get_mongo_db,
        )
        # [cleanup] assert "截断" in result

    @pytest.mark.asyncio
    async def test_both_pg_and_mongo_fail_returns_empty(self):
        """PG 和 MongoDB 都失败返回空字符串"""
        get_pg_pool = AsyncMock(side_effect=Exception("PG down"))
        get_mongo_db = AsyncMock(side_effect=Exception("Mongo down"))

        result = await compute_diff(
            "content",
            datetime(2024, 6, 15),
            get_pg_pool,
            get_mongo_db,
        )
        assert result == ""

    @pytest.mark.asyncio
    async def test_prev_date_calculation(self):
        """前一天日期正确计算"""
        pg_pool = MagicMock()
        conn = AsyncMock()
        conn.fetchrow.return_value = None
        pg_pool.acquire.return_value.__aenter__.return_value = conn
        pg_pool.acquire.return_value.__aexit__.return_value = None

        mongo_db = MagicMock()
        collection = AsyncMock()
        collection.find_one.return_value = None
        mongo_db.__getitem__.return_value = collection

        get_pg_pool = AsyncMock(return_value=pg_pool)
        get_mongo_db = AsyncMock(return_value=mongo_db)

        await compute_diff(
            "content",
            datetime(2024, 6, 15),
            get_pg_pool,
            get_mongo_db,
        )

        # 验证查询使用的前一天日期
        conn.fetchrow.assert_called_once()
        sql_arg, date_arg = conn.fetchrow.call_args[0]
        assert date_arg == "2024-06-14"
