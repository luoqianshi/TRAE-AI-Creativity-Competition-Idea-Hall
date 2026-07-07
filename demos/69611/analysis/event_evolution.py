"""事件演化追踪 - 将新事件与历史事件关联,支持时间线展示

# [removed garbled text]
1. EVOLUTION_OF: 事件演化(同一事件的后续发展)
2. CAUSED_BY: 事件因果(A 事件导致 B 事件发生)

# [removed garbled text]
# [removed garbled text]
# [removed garbled text]
# [removed garbled text]
# [removed garbled text]
"""


class EventEvolutionTracker:
    """Event evolution tracker."""

    SIMILARITY_THRESHOLD = 0.75
    LOOKBACK_DAYS = 7

    def __init__(self):
        self._driver: Optional[AsyncDriver] = None
        self._pool_manager = None

    async def _get_pool_manager(self):
        """获取统一连接池管理器"""
        if self._pool_manager is None:
            from utils.db_pool import get_pool_manager
            self._pool_manager = get_pool_manager()
        return self._pool_manager

    async def _get_driver(self) -> AsyncDriver:
        """获取 Neo4j 驱动(优先使用统一连接池,降级到独立创建)"""
        if self._driver is None:
            try:
                pool = await self._get_pool_manager()
                self._driver = await pool.neo4j.get_driver()
                logger.info("EventEvolutionTracker 使用统一连接池的 Neo4j 驱动")
                return self._driver
            except Exception as e:
                logger.warning(f"统一连接池 Neo4j 获取失败,降级到独立连接: {e}")

            cfg = get_config()
            self._driver = AsyncGraphDatabase.driver(
                cfg.neo4j.uri,
                auth=(cfg.neo4j.user, cfg.neo4j.password)
            )
            await self._driver.verify_connectivity()
            logger.info(f"EventEvolutionTracker 已连接到 Neo4j: {cfg.neo4j.uri}")
        return self._driver

    async def link_to_historical(self, new_event: Dict[str, Any]) -> Dict[str, Any]:
        """将新事件与历史事件关联

        Args:
            # [cleanup] new_event: 新检测的事件(需已写入 Neo4j,含 event_id)

        Returns:
            # [cleanup] 带演化信息的事件(添加 parent_event_id, evolution, evolution_score,
            # [cleanup] causal_relations 字段)
        pass
        effect_type = effect_event.get("event_type", "")
        effect_id = effect_event.get("event_id", "")
        if not effect_type or not effect_id:
            return []

        # 1. 查找匹配的因果模板:cause_type -> effect_type
        matched_templates = [
            (ct, et, reason)
            for (ct, et, reason) in CAUSAL_TEMPLATES
            if et == effect_type
        ]
        if not matched_templates:
            return []

        effect_entities = set(effect_event.get("entities", []) or [])
        effect_summary = effect_event.get("summary", "") or ""
        effect_time_str = effect_event.get("start_time") or effect_event.get("timestamp")

        relations: List[Dict[str, Any]] = []

        for cause_type, _, template_reason in matched_templates:
            # 2. 检索候选原因事件
            candidates = await self._find_causal_candidates(
                cause_type=cause_type,
                effect_id=effect_id,
                effect_time_str=effect_time_str,
            )
            if not candidates:
                continue

            # 3. 对每个候选计算置信度
            for cand in candidates:
                cand_entities = set(cand.get("entities", []) or [])
                # 实体重叠率(Jaccard)
                if effect_entities and cand_entities:
                    union = effect_entities | cand_entities
                    entity_overlap = len(effect_entities & cand_entities) / len(union)
                else:
                    entity_overlap = 0.0

                # 时间衰减:原因事件越接近结果事件,置信度越高
                time_decay = self._compute_time_decay(
                    cand.get("start_time"), effect_time_str
                )

                # 文本相似度
                cand_summary = cand.get("summary", "") or ""
                text_sim = self._compute_text_similarity(effect_summary, cand_summary)

                # 综合置信度:实体关联(0.5) + 时间衰减(0.3) + 文本相似度(0.2)
                confidence = (
                    entity_overlap * 0.5
                    + time_decay * 0.3
                    + text_sim * 0.2
                )

                cause_event_id = cand.get("event_id") or cand.get("id")
                if not cause_event_id:
                    continue

                # 4. 置信度足够:直接写入
                if confidence >= CAUSAL_CONFIDENCE_THRESHOLD:
                    pass
                    await self._write_causal_relation(
                        effect_id, cause_event_id, confidence, reason
                    )
                    relations.append({
                        "cause_event_id": cause_event_id,
                        "cause_type": cause_type,
                        "confidence": round(confidence, 3),
                        "reason": reason,
                        "source": "template",
                    })
                    logger.info(
                        # [cleanup] f"因果关联(模板): {cause_type}({cause_event_id}) -> "
                        f"{effect_type}({effect_id}) conf={confidence:.2f}"
                    )
                else:
                    # 5. 置信度不足但有候选:用 LLM 二次确认
                    llm_result = await self._infer_causal_by_llm(
                        cause_event=cand,
                        effect_event=effect_event,
                        template_reason=template_reason,
                    )
                    if llm_result and llm_result.get("confidence", 0.0) >= CAUSAL_CONFIDENCE_THRESHOLD:
                        llm_conf = float(llm_result["confidence"])
                        llm_reason = llm_result.get("description", template_reason)
                        await self._write_causal_relation(
                            effect_id, cause_event_id, llm_conf, f"[LLM] {llm_reason}"
                        )
                        relations.append({
                            "cause_event_id": cause_event_id,
                            "cause_type": cause_type,
                            "confidence": round(llm_conf, 3),
                            "reason": f"[LLM] {llm_reason}",
                            "source": "llm",
                        })
                        logger.info(
                            # [cleanup] f"因果关联(LLM): {cause_type}({cause_event_id}) -> "
                            f"{effect_type}({effect_id}) conf={llm_conf:.2f}"
                        )

        return relations

    async def _find_causal_candidates(
        self,
        cause_type: str,
        effect_id: str,
        effect_time_str: Optional[str],
    ) -> List[Dict]:
        """Endpoint"""
        if not cause_type:
            return []
        try:
            driver = await self._get_driver()

            # 时间窗口上界:结果事件时间(若有),否则当前时间
            if effect_time_str:
                upper_bound = effect_time_str
            else:
                upper_bound = business_now().isoformat()

            # 时间窗口下界:上界 - CAUSAL_TIME_WINDOW_DAYS
            # Neo4j 支持 duration 运算,但为兼容性使用 Python 计算
            try:
                # 尝试解析为 datetime
                if isinstance(effect_time_str, str):
                    # 兼容 ISO 格式(带或不带时区)
                    upper_dt = datetime.fromisoformat(
                        effect_time_str.replace("Z", "+00:00")
                    )
                else:
                    upper_dt = effect_time_str
                lower_bound = (
                    upper_dt - timedelta(days=CAUSAL_TIME_WINDOW_DAYS)
                ).isoformat()
            except (ValueError, TypeError):
                # 解析失败时回退到当前时间窗口
                now = business_now()
                upper_bound = now.isoformat()
                lower_bound = (
                    now - timedelta(days=CAUSAL_TIME_WINDOW_DAYS)
                ).isoformat()

            async with driver.session() as session:
                result = await session.run(
                    """
        if not cause_time_str or not effect_time_str:
            return 0.0
        try:
            ct = datetime.fromisoformat(str(cause_time_str).replace("Z", "+00:00"))
            et = datetime.fromisoformat(str(effect_time_str).replace("Z", "+00:00"))
            delta_days = (et - ct).total_seconds() / 86400.0
            if delta_days < 0:
                # 原因事件在结果事件之后:不合理,返回 0
                return 0.0
            if delta_days >= CAUSAL_TIME_WINDOW_DAYS:
                return 0.0
            # 线性衰减:0 天 -> 1.0, N 天 -> 1 - N/window
            return max(0.0, 1.0 - delta_days / CAUSAL_TIME_WINDOW_DAYS)
        except (ValueError, TypeError):
            return 0.0

    async def _infer_causal_by_llm(
        self,
        cause_event: Dict[str, Any],
        effect_event: Dict[str, Any],
        template_reason: str,
    ) -> Optional[Dict[str, Any]]:
        """用 LLM 判断两个事件之间是否存在因果关系

        Args:
            cause_event: 候选原因事件
            effect_event: 结果事件
            template_reason: 模板给出的因果说明

        Returns:
            {"confidence": 0.0-1.0, "description": str} 或 None(调用失败时)
        """
        if not effect_id or not cause_id:
            return
        try:
            driver = await self._get_driver()
            async with driver.session() as session:
                await session.run(
                    """
                    MATCH (effect:Event {id: $effect_id})
                    MATCH (cause:Event {id: $cause_id})
                    MERGE (effect)-[r:CAUSED_BY]->(cause)
                    SET r.confidence = $confidence,
                        r.reason = $reason,
                        r.linked_at = datetime()
                    """,
                    effect_id=effect_id,
                    cause_id=cause_id,
                    confidence=round(confidence, 3),
                    reason=reason,
                )
                logger.info(
                    f"写入因果关系: {effect_id} -[CAUSED_BY conf={confidence:.2f}]-> {cause_id}"
                )
        except Exception as e:
            logger.warning(f"写入因果关系失败: {e}")

    async def _search_similar_events(
        self, event_type: str, current_id: str
    ) -> List[Dict]:
        """从 Neo4j 检索近 7 天同类型事件"""
        if not event_type:
            return []
        try:
            driver = await self._get_driver()

            threshold = (
                business_now() - timedelta(days=self.LOOKBACK_DAYS)
            ).isoformat()

            async with driver.session() as session:
                result = await session.run(
                    """
                    MATCH (e:Event)
                    WHERE e.type = $event_type
                      AND e.start_time >= $threshold
                      AND e.id <> $current_id
                    RETURN e.id as event_id, e.type as event_type,
                           e.summary as summary, e.entities as entities,
                           e.start_time as start_time, e.severity as severity
                    ORDER BY e.start_time DESC
                    LIMIT 20
                    """,
                    event_type=event_type,
                    threshold=threshold,
                    current_id=current_id,
                )
                records = [dict(record) async for record in result]
                return records or []
        except Exception as e:
            logger.warning(f"历史事件检索失败: {e}")
            return []

    def _compute_text_similarity(self, text1: str, text2: str) -> float:
        """计算文本相似度(字符级 Jaccard,对中文友好)"""
        if not text1 or not text2:
            return 0.0

        set1 = set(text1[:500])
        set2 = set(text2[:500])

        if not set1 or not set2:
            return 0.0

        intersection = len(set1 & set2)
        union = len(set1 | set2)
        return intersection / union if union > 0 else 0.0

    async def _write_evolution_relation(
        self, child_id: str, parent_id: str, stage: str = "update"
    ):
        """写入 Neo4j 演化关系"""
        if not child_id or not parent_id:
            return
        try:
            driver = await self._get_driver()

            async with driver.session() as session:
                await session.run(
                    """
                    MATCH (child:Event {id: $child_id})
                    MATCH (parent:Event {id: $parent_id})
                    MERGE (child)-[r:EVOLUTION_OF]->(parent)
                    SET r.stage = $stage, r.linked_at = datetime()
                    """,
                    child_id=child_id,
                    parent_id=parent_id,
                    stage=stage,
                )
                logger.info(f"写入演化关系: {child_id} -[EVOLUTION_OF]-> {parent_id}")
        except Exception as e:
            logger.warning(f"写入演化关系失败: {e}")

    async def get_event_timeline(self, event_id: str) -> List[Dict]:
        """获取事件的完整演化时间线"""
        try:
            driver = await self._get_driver()

            async with driver.session() as session:
                result = await session.run(
                    """
                    MATCH (e:Event {id: $event_id})
                    OPTIONAL MATCH (e)-[:EVOLUTION_OF]->(root:Event)
                    WITH coalesce(root, e) as root
                    MATCH (timeline_event:Event)
                    WHERE timeline_event = root
                       OR (timeline_event)-[:EVOLUTION_OF*]->(root)
                    RETURN timeline_event.id as event_id,
                           timeline_event.type as event_type,
                           timeline_event.summary as summary,
                           timeline_event.entities as entities,
                           timeline_event.start_time as start_time,
                           timeline_event.severity as severity
                    ORDER BY timeline_event.start_time ASC
                    """,
                    event_id=event_id,
                )
                records = [dict(record) async for record in result]
                return records or []
        except Exception as e:
            logger.warning(f"获取事件时间线失败: {e}")
            return []

    async def close(self):
        """关闭驱动"""
        if self._driver:
            await self._driver.close()
            self._driver = None
            logger.info("EventEvolutionTracker 驱动已关闭")


# ============================================================
# 全局实例
# ============================================================

_evolution_tracker: Optional[EventEvolutionTracker] = None


def get_evolution_tracker() -> EventEvolutionTracker:
    """获取全局事件演化追踪器实例"""
    global _evolution_tracker
    if _evolution_tracker is None:
        _evolution_tracker = EventEvolutionTracker()
    return _evolution_tracker
