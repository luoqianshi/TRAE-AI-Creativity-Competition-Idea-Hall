"""情报溯源链 - 构建报告到原始信源的完整追溯链

# [removed garbled text]
# [removed garbled text]
# [removed garbled text]
# [removed garbled text]

# [removed garbled text]
"""


class TraceabilityBuilder:
    """Build traceability chains from reports to original sources."""

    async def build_trace(self, report_id: str):
        """Build full traceability chain for a report."""
        try:
            pool = await self._get_pool_manager()

            # 1. 优先从 PG daily_reports 表读取报告
            report_content = ""
            report_date = ""

            try:
                pg_pool = await pool.postgres.get_pool()
                async with pg_pool.acquire() as conn:
                    row = await conn.fetchrow(
                        "SELECT id, report_date, title, summary, full_markdown, html_content, metadata "
                        "FROM daily_reports WHERE id = $1 OR report_date = $1::date",
                        report_id
                    )
                    if row:
                        report = dict(row)
                        report_content = (
                            report.get("full_markdown")
                            or report.get("html_content")
                            or ""
                        )
                        report_date = str(report.get("report_date", ""))
                        logger.info(f"从 PG 读取到报告: id={report.get('id')}, date={report_date}")
            except Exception as e:
                logger.warning(f"从 PG 读取报告失败,降级到 MongoDB: {e}")

            # 2. 降级路径:从 MongoDB 读取报告
            if not report_content:
                try:
                    config = get_config()
                    db_name = config.mongodb.database
                    mongo_client = await pool.mongodb.get_client()
                    db = mongo_client[db_name]

                    report = None
                    try:
                        report = await db["daily_reports"].find_one({"_id": report_id})
                    except Exception:
                        report = None

                    if not report:
                        report = await db["daily_reports"].find_one({"date": report_id})

                    if report:
                        report_content = (
                            report.get("full_markdown")
                            or report.get("content")
                            or report.get("markdown")
                            or ""
                        )
                        report_date = report.get("date", "")
                        logger.info(f"从 MongoDB 降级读取到报告: date={report_date}")
                except Exception as e:
                    logger.warning(f"从 MongoDB 读取报告失败: {e}")

            if not report_content:
                return {"error": "报告不存在", "report_id": report_id}

            # 3. 提取所有引用 [doc_id]
            citations = self._extract_citations(report_content)

            if not citations:
                return {
                    "report_id": report_id,
                    "report_date": report_date,
                    "total_citations": 0,
                    "trace_chain": [],
                    "message": "报告中未找到引用标注"
                }

            # 4. 批量查询文档元数据(使用 msearch 避免 N+1 查询)
            es = await pool.elasticsearch.get_client()
            trace_chain = []

            # 构建 msearch 请求体:每个 citation 一个查询
            # 使用 wildcard 查询存储的 id 字段(而非 ES _id 的 prefix 查询,后者不可靠)
            msearch_body = []
            for doc_id in citations:
                msearch_body.append({"index": "omnilog_docs"})
                msearch_body.append({
                    "size": 1,
                    "query": {"wildcard": {"id": f"{doc_id}*"}}
                })

            try:
                response = await es.msearch(searches=msearch_body)
                responses = response.get("responses", [])

                for i, doc_id in enumerate(citations):
                    if i >= len(responses):
                        trace_chain.append({
                            "doc_id": doc_id,
                            "error": "查询响应缺失",
                            "original_url": "",
                            "doc_source": ""
                        })
                        continue

                    resp = responses[i]
                    if resp.get("error"):
                        trace_chain.append({
                            "doc_id": doc_id,
                            "error": f"ES 查询错误: {resp['error'].get('type', 'unknown')}",
                            "original_url": "",
                            "doc_source": ""
                        })
                        continue

                    hits = resp.get("hits", {}).get("hits", [])
                    if hits:
                        hit = hits[0]
                        source = hit["_source"]
                        metadata = source.get("metadata", {}) or {}

                        trace_item = {
                            "doc_id": doc_id,
                            "full_doc_id": hit["_id"],
                            "doc_source": source.get("source", "unknown"),
                            "doc_timestamp": source.get("timestamp", ""),
                            "original_url": source.get("url", ""),
                            "collector_type": metadata.get("collector_type", ""),
                            "fingerprint": source.get("fingerprint", ""),
                            "quality_score": metadata.get("quality_score", 0),
                            "title": metadata.get("title", ""),
                            "tags": source.get("tags", []),
                        }

                        # 扩展溯源:文档 -> 采集请求 -> 采集运行
                        original_url = source.get("url", "")
                        if original_url:
                            request_info = await self._get_collector_request(original_url)
                            if request_info:
                                trace_item["collector_request"] = {
                                    "request_id": request_info.get("id"),
                                    "run_id": request_info.get("run_id"),
                                    "collector_type": request_info.get("collector_type"),
                                    "method": request_info.get("method"),
                                    "status_code": request_info.get("status_code"),
                                    "response_time_ms": request_info.get("response_time_ms"),
                                    "retry_count": request_info.get("retry_count"),
                                    "content_length": request_info.get("content_length"),
                                    "error_message": request_info.get("error_message"),
                                    "user_agent": request_info.get("user_agent"),
                                    "requested_at": (
                                        request_info["requested_at"].isoformat()
                                        if request_info.get("requested_at") else None
                                    ),
                                    "completed_at": (
                                        request_info["completed_at"].isoformat()
                                        if request_info.get("completed_at") else None
                                    ),
                                }
                                # 采集运行信息(JOIN 已带出)
                                if request_info.get("run_source"):
                                    trace_item["collector_request"]["ingestion_run"] = {
                                        "run_id": request_info.get("run_id"),
                                        "source": request_info.get("run_source"),
                                        "status": request_info.get("run_status"),
                                        "start_time": (
                                            request_info["run_start_time"].isoformat()
                                            if request_info.get("run_start_time") else None
                                        ),
                                        "end_time": (
                                            request_info["run_end_time"].isoformat()
                                            if request_info.get("run_end_time") else None
                                        ),
                                    }

                        trace_chain.append(trace_item)
                    else:
                        trace_chain.append({
                            "doc_id": doc_id,
                            "error": "文档不存在",
                            "original_url": "",
                            "doc_source": ""
                        })
            except Exception as e:
                logger.warning(f"msearch 批量查询文档失败: {e}")
                for doc_id in citations:
                    trace_chain.append({
                        "doc_id": doc_id,
                        "error": str(e),
                        "original_url": "",
                        "doc_source": ""
                    })

            return {
                "report_id": report_id,
                "report_date": report_date,
                "total_citations": len(citations),
                "verified_citations": sum(1 for item in trace_chain if not item.get("error")),
                "trace_chain": trace_chain
            }

        except Exception as e:
            logger.error(f"构建溯源链失败: {e}", exc_info=True)
            return {"error": str(e), "report_id": report_id}

    def _extract_citations(self, content: str) -> List[str]:
        """从报告内容提取引用标注 [doc_id](8 位 hex)"""
        if not content:
            return []
        citations = re.findall(r'\[([a-f0-9]{8})\]', content)
        # 去重保持顺序
        seen = set()
        unique = []
        for c in citations:
            if c not in seen:
                seen.add(c)
                unique.append(c)
        return unique

    async def _get_collector_request(self, url: str) -> Optional[Dict[str, Any]]:
        """根据文档 URL 查询采集请求记录(溯源到 HTTP 请求级)

        Args:
            # [cleanup] url: 文档的原始 URL

        Returns:
            # [cleanup] 采集请求记录字典(含 JOIN 的采集运行信息),无记录时返回 None
        """
        if not url:
            return None
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()
            import hashlib
            url_hash = hashlib.md5(url.encode()).hexdigest()
            async with pg_pool.acquire() as conn:
                row = await conn.fetchrow(
                    """
                    SELECT cr.id, cr.run_id, cr.collector_type, cr.url, cr.method,
                           cr.status_code, cr.response_time_ms, cr.retry_count,
                           cr.content_length, cr.error_message, cr.user_agent,
                           cr.requested_at, cr.completed_at,
                           ir.source as run_source, ir.status as run_status,
                           ir.start_time as run_start_time, ir.end_time as run_end_time
                    FROM collector_requests cr
                    LEFT JOIN ingestion_runs ir ON cr.run_id = ir.id
                    WHERE cr.url_hash = $1
                    ORDER BY cr.requested_at DESC
                    LIMIT 1
                    """,
                    url_hash,
                )
                return dict(row) if row else None
        except Exception as e:
            logger.debug(f"查询采集请求记录失败(不影响溯源): {e}")
            return None

    async def verify_traceability(self, report_id: str) -> Dict[str, Any]:
        """验证报告溯源完整性

        Returns:
            {
                "report_id": str,
                "total_citations": int,
                "verified": bool,
                "issues": List[str],
                "compliance_score": float  # 0-1
            }
        """
        chain = await self.build_trace_chain(report_id)

        if "error" in chain:
            return {
                "report_id": report_id,
                "verified": False,
                "issues": [chain["error"]],
                "compliance_score": 0.0
            }

        issues = []
        total = chain.get("total_citations", 0)

        for item in chain.get("trace_chain", []):
            if item.get("error"):
                issues.append(f"文档 {item['doc_id']}: {item['error']}")
            elif not item.get("original_url"):
                issues.append(f"文档 {item['doc_id']} 缺少原始 URL")
            elif not item.get("doc_source"):
                issues.append(f"文档 {item['doc_id']} 缺少采集源信息")

        verified = len(issues) == 0
        compliance_score = 1.0 - (len(issues) / max(total, 1)) if total > 0 else 1.0

        return {
            "report_id": report_id,
            "report_date": chain.get("report_date", ""),
            "total_citations": total,
            "verified_citations": chain.get("verified_citations", 0),
            "verified": verified,
            "issues": issues,
            "compliance_score": round(compliance_score, 4)
        }

    async def get_source_statistics(self, report_id: str) -> Dict[str, Any]:
        """获取报告信源统计"""
        chain = await self.build_trace_chain(report_id)

        if "error" in chain:
            return chain

        trace = chain.get("trace_chain", [])

        # 按采集源统计
        source_count: Dict[str, int] = {}
        for item in trace:
            source = item.get("doc_source", "unknown")
            source_count[source] = source_count.get(source, 0) + 1

        # 按域名统计
        domain_count: Dict[str, int] = {}
        for item in trace:
            url = item.get("original_url", "")
            if url:
                try:
                    domain = urlparse(url).netloc
                    if domain:
                        domain_count[domain] = domain_count.get(domain, 0) + 1
                except Exception as e:
                    logger.warning(f"解析 URL 域名失败: {url} -> {e}")

        return {
            "report_id": report_id,
            "total_sources": len(source_count),
            "total_domains": len(domain_count),
            "source_distribution": source_count,
            "domain_distribution": dict(sorted(domain_count.items(), key=lambda x: -x[1])[:10]),
            "avg_quality_score": sum(item.get("quality_score", 0) for item in trace) / max(len(trace), 1)
        }
