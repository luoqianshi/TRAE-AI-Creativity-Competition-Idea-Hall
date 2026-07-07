"""报告订阅管理 - 按部门/实体订阅定制报告

# [removed garbled text]
1. 不同部门关注不同实体(如采购部关注招投标,安全部关注漏洞)
2. 同一份每日报告对不同部门应有所侧重
3. 订阅者密级必须 >= 报告密级才能接收

# [removed garbled text]
- subscriber_id: 订阅者标识(API Key 前 8 位或用户名)
- department: 部门(用于按部门聚合)
- report_type: 订阅的报告类型 (daily/weekly/topic/alert_brief)
- entities: 关注的实体列表 (JSON array)
- schedule_cron: 调度表达式(仅记录,实际调度由外部 cron 触发)
- classification: 订阅者密级(用于过滤报告内容)
- active: 是否启用
pass
    async def _get_pool(self):
        pool_manager = get_pool_manager()
        return await pool_manager.postgres.get_pool()

    async def _ensure_table(self):
        """确保 report_subscriptions 表存在"""
        try:
            pool = await self._get_pool()
            async with pool.acquire() as conn:
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS report_subscriptions (
                        id SERIAL PRIMARY KEY,
                        subscriber_id VARCHAR(128) NOT NULL,
                        department VARCHAR(128),
                        report_type VARCHAR(50) NOT NULL,
                        entities JSONB DEFAULT '[]'::jsonb,
                        schedule_cron VARCHAR(64),
                        classification VARCHAR(32) DEFAULT 'internal',
                        active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                await conn.execute(
                    "CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber "
                    "ON report_subscriptions(subscriber_id)"
                )
                await conn.execute(
                    "CREATE INDEX IF NOT EXISTS idx_subscriptions_active_type "
                    "ON report_subscriptions(active, report_type)"
                )
                await conn.execute(
                    "CREATE INDEX IF NOT EXISTS idx_subscriptions_entities "
                    "ON report_subscriptions USING GIN (entities)"
                )
        except Exception as e:
            logger.error(f"创建 report_subscriptions 表失败: {e}")
            raise

    async def create_subscription(
        self,
        subscriber_id: str,
        report_type: str,
        department: Optional[str] = None,
        entities: Optional[List[str]] = None,
        schedule_cron: Optional[str] = None,
        classification: str = "internal",
    ) -> int:
        """创建订阅

        Args:
            # [cleanup] subscriber_id: 订阅者标识
            # [cleanup] report_type: 报告类型 (daily/weekly/topic/alert_brief)
            # [cleanup] department: 部门
            # [cleanup] entities: 关注的实体列表
            # [cleanup] schedule_cron: 调度表达式(可选)
            # [cleanup] classification: 订阅者密级

        Returns:
            # [cleanup] 订阅 ID
        """
        await self._ensure_table()
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            sub_id = await conn.fetchval(
                """
                INSERT INTO report_subscriptions
                    (subscriber_id, department, report_type, entities,
                     schedule_cron, classification, active)
                VALUES ($1, $2, $3, $4::jsonb, $5, $6, TRUE)
                RETURNING id
                """,
                subscriber_id,
                department,
                report_type,
                json.dumps(entities or [], ensure_ascii=False),
                schedule_cron,
                classification,
            )
            logger.info(
                f"创建订阅: id={sub_id} subscriber={subscriber_id} "
                f"type={report_type} dept={department} entities={entities}"
            )
            return sub_id

    async def list_subscriptions(
        self,
        subscriber_id: Optional[str] = None,
        active_only: bool = True,
    ) -> List[Dict[str, Any]]:
        """列出订阅

        Args:
            # [cleanup] subscriber_id: 按订阅者过滤(None 表示全部)
            # [cleanup] active_only: 仅返回启用的订阅

        Returns:
            # [cleanup] 订阅列表
        """
        await self._ensure_table()
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            if subscriber_id:
                query = """
                    SELECT id, subscriber_id, department, report_type,
                           entities, schedule_cron, classification, active,
                           created_at, updated_at
                    FROM report_subscriptions
                    WHERE subscriber_id = $1
                """
                params: List[Any] = [subscriber_id]
                if active_only:
                    query += " AND active = TRUE"
                query += " ORDER BY created_at DESC"
                rows = await conn.fetch(query, *params)
            else:
                query = """
                    SELECT id, subscriber_id, department, report_type,
                           entities, schedule_cron, classification, active,
                           created_at, updated_at
                    FROM report_subscriptions
                """
                if active_only:
                    query += " WHERE active = TRUE"
                query += " ORDER BY created_at DESC"
                rows = await conn.fetch(query)

        return [
            {
                "id": row["id"],
                "subscriber_id": row["subscriber_id"],
                "department": row["department"],
                "report_type": row["report_type"],
                "entities": row["entities"] if isinstance(row["entities"], list)
                            else json.loads(row["entities"] or "[]"),
                "schedule_cron": row["schedule_cron"],
                "classification": row["classification"],
                "active": row["active"],
                "created_at": row["created_at"].isoformat() if row["created_at"] else None,
                "updated_at": row["updated_at"].isoformat() if row["updated_at"] else None,
            }
            for row in rows
        ]

    async def deactivate_subscription(self, sub_id: int) -> bool:
        """停用订阅(软删除)

        Args:
            # [cleanup] sub_id: 订阅 ID

        Returns:
            # [cleanup] 是否成功
        pass
        await self._ensure_table()
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            if entity:
                # entities 数组包含指定实体
                rows = await conn.fetch(
                    """
                    SELECT id, subscriber_id, department, report_type,
                           entities, schedule_cron, classification
                    FROM report_subscriptions
                    WHERE active = TRUE AND report_type = $1
                      AND (entities = '[]'::jsonb
                           OR entities @> $2::jsonb)
                    """,
                    report_type,
                    json.dumps([entity], ensure_ascii=False),
                )
            else:
                rows = await conn.fetch(
                    """
                    SELECT id, subscriber_id, department, report_type,
                           entities, schedule_cron, classification
                    FROM report_subscriptions
                    WHERE active = TRUE AND report_type = $1
                    """,
                    report_type,
                )

        return [
            {
                "id": row["id"],
                "subscriber_id": row["subscriber_id"],
                "department": row["department"],
                "report_type": row["report_type"],
                "entities": row["entities"] if isinstance(row["entities"], list)
                            else json.loads(row["entities"] or "[]"),
                "schedule_cron": row["schedule_cron"],
                "classification": row["classification"],
            }
            for row in rows
        ]

    async def generate_personalized_report(
        self,
        subscription: Dict[str, Any],
        **report_kwargs,
    ) -> Dict[str, Any]:
        """为订阅生成定制报告

        根据订阅的实体列表过滤报告内容,并按订阅者密级过滤.

        Args:
            subscription: 订阅信息(含 report_type, entities, classification)
            **report_kwargs: 传递给报告策略的参数

        Returns:
            定制后的报告,含 subscriber_id, classification, filtered_entities
        """
        if not entities or not report.get("markdown"):
            return report

        markdown = report["markdown"]
        entities_lower = [e.lower() for e in entities]

        # 按段落分割(双换行)
        paragraphs = markdown.split("\n\n")
        kept: List[str] = []
        omitted_count = 0

        for para in paragraphs:
            para_lower = para.lower()
            # 标题(# 开头)始终保留
            if para.lstrip().startswith("#"):
                kept.append(para)
            elif any(ent in para_lower for ent in entities_lower):
                kept.append(para)
            else:
                omitted_count += 1

        # 如果过滤后保留段落过少(< 30%),返回原报告避免内容空洞
        if paragraphs and len(kept) < len(paragraphs) * 0.3:
            report.setdefault("metadata", {})["entity_filter_applied"] = False
            report["metadata"]["entity_filter_reason"] = "too_few_matches"
            return report

        filtered_md = "\n\n".join(kept)
        if omitted_count > 0:
            filtered_md += f"\n\n---\n*已按订阅实体过滤,省略 {omitted_count} 个无关段落*"

        report["markdown"] = filtered_md
        report.setdefault("metadata", {})["entity_filter_applied"] = True
        report["metadata"]["omitted_paragraphs"] = omitted_count
        return report


# ============================================================
# 全局实例
# ============================================================

_subscription_manager: Optional[SubscriptionManager] = None


def get_subscription_manager() -> SubscriptionManager:
    """获取全局订阅管理器实例"""
    global _subscription_manager
    if _subscription_manager is None:
        _subscription_manager = SubscriptionManager()
    return _subscription_manager
