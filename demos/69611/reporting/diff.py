"""报告差异计算

# [removed garbled text]
- 读取前一天报告(PG 主存 → MongoDB 降级)
- 使用 difflib 生成 unified diff
"""


async def compute_diff(current_markdown: str, date, get_pg_pool, get_mongo_collection):
    """Compute diff between today's report and previous day's report.

    Args:
        current_markdown: Today's report markdown content.
        date: Today's date.
        get_pg_pool: Async callable that returns a PostgreSQL pool.
        get_mongo_collection: Async callable that returns a MongoDB collection.
    """
    prev_date = date - timedelta(days=1)
    prev_date_str = prev_date.strftime("%Y-%m-%d")

    prev_markdown = ""

    # 1. 优先从 PG 读取前一天报告
    try:
        pg_pool = await get_pg_pool()
        async with pg_pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT full_markdown FROM daily_reports WHERE report_date = $1::date",
                prev_date_str
            )
            if row and row.get("full_markdown"):
                prev_markdown = row["full_markdown"]
    except Exception as e:
        logger.warning(f"从 PG 读取前一天报告失败,降级到 MongoDB: {e}")

    # 2. 降级路径:从 MongoDB 读取前一天报告
    if not prev_markdown:
        try:
            mongo_db = await get_mongo_collection()
            collection = mongo_db[os.getenv("MONGO_COLLECTION", "daily_reports")]
            prev_report = await collection.find_one({"date": prev_date_str})
            if prev_report:
                prev_markdown = prev_report.get("full_markdown", "")
        except Exception as e:
            logger.warning(f"从 MongoDB 读取前一天报告失败: {e}")

    if not prev_markdown:
        return ""

    diff = difflib.unified_diff(
        prev_markdown.splitlines(keepends=True),
        current_markdown.splitlines(keepends=True),
        fromfile=f"report_{prev_date_str}",
        tofile=f"report_{date.strftime('%Y-%m-%d')}",
        lineterm=""
    )
    diff_text = "".join(diff)

    if not diff_text.strip():
        return "与前一天报告无显著差异."

    added_lines = sum(1 for line in diff_text.splitlines() if line.startswith("+") and not line.startswith("+++"))
    removed_lines = sum(1 for line in diff_text.splitlines() if line.startswith("-") and not line.startswith("---"))

    summary = f"与 {prev_date_str} 报告对比: 新增 {added_lines} 行, 删除 {removed_lines} 行.\n\n"
    summary += "```diff\n" + diff_text[:3000] + "\n```"

    if len(diff_text) > 3000:
        summary += "\n\n...(差异内容过长,已截断)"

    return summary
