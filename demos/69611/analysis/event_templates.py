"""事件模板检测 - 基于预定义模板识别结构化事件"""

import logging
import re
from dataclasses import dataclass
from typing import List, Dict, Tuple, Any

logger = logging.getLogger(__name__)


@dataclass
class EventTemplate:
    """事件模板定义"""
    # [cleanup] event_type: str           # 事件类型: funding, product_launch, security_vuln, ...
    # [cleanup] display_name: str         # 显示名称: "融资事件"
    # [cleanup] keywords_zh: List[str]    # 中文关键词
    # [cleanup] keywords_en: List[str]    # 英文关键词
    # [cleanup] required_entities: List[str]  # 必须包含的实体类型
    # [cleanup] optional_entities: List[str]  # 可选实体类型
    severity: str = "info"    # info / warning / critical
    description: str = ""


# 预定义事件模板库
EVENT_TEMPLATES: List[EventTemplate] = [
    EventTemplate(
        event_type="funding",
        # [cleanup] display_name="融资事件",
        # [cleanup] keywords_zh=["融资", "轮融资", "估值", "投资", "领投", "跟投", "天使轮", "A轮", "B轮", "C轮", "IPO", "上市"],
        keywords_en=["funding", "raised", "series A", "series B", "valuation", "investment", "IPO", "lead investor"],
        required_entities=["ORG"],
        optional_entities=["MONEY", "DATE"],
        severity="info",
        # [cleanup] description="公司获得融资"
    ),
    EventTemplate(
        event_type="product_launch",
        # [cleanup] display_name="产品发布",
        # [cleanup] keywords_zh=["发布", "推出", "上线", "开测", "公测", "正式版", "新版", "发布"],
        keywords_en=["launch", "released", "announces", "unveils", "ships", "GA"],
        required_entities=["ORG"],
        optional_entities=["PRODUCT", "TECHNOLOGY"],
        severity="info",
        # [cleanup] description="公司发布新产品或版本"
    ),
    EventTemplate(
        event_type="security_vuln",
        # [cleanup] display_name="安全漏洞",
        # [cleanup] keywords_zh=["漏洞", "CVE", "安全", "0day", "零日", "补丁", "修复", "攻击", "泄露"],
        keywords_en=["vulnerability", "CVE", "security", "0day", "zero-day", "patch", "exploit", "breach"],
        required_entities=[],
        optional_entities=["PRODUCT", "TECHNOLOGY"],
        severity="critical",
        # [cleanup] description="安全漏洞或攻击事件"
    ),
    EventTemplate(
        event_type="personnel_change",
        # [cleanup] display_name="人事变动",
        # [cleanup] keywords_zh=["离职", "加盟", "任命", "辞任", "卸任", "出任", "加入", "跳槽", "CTO", "CEO", "总裁"],
        keywords_en=["joins", "leaves", "appointed", "resigns", "hires", "steps down", "named CEO", "named CTO"],
        required_entities=["PERSON"],
        optional_entities=["ORG"],
        severity="info",
        # [cleanup] description="关键人事变动"
    ),
    EventTemplate(
        event_type="merger_acquisition",
        # [cleanup] display_name="并购事件",
        # [cleanup] keywords_zh=["收购", "并购", "合并", "重组", "入股", "控股", "私有化"],
        keywords_en=["acquires", "acquisition", "merger", "merge", "buyout", "takeover", "stake"],
        required_entities=["ORG"],
        optional_entities=["MONEY"],
        severity="info",
        # [cleanup] description="公司并购或收购"
    ),
    EventTemplate(
        event_type="regulation",
        # [cleanup] display_name="监管动态",
        # [cleanup] keywords_zh=["监管", "处罚", "罚款", "立案", "调查", "反垄断", "合规", "政策", "法规"],
        keywords_en=["regulator", "fine", "penalty", "investigation", "antitrust", "compliance", "ban"],
        required_entities=["ORG"],
        optional_entities=[],
        severity="warning",
        # [cleanup] description="监管或政策动态"
    ),
    EventTemplate(
        event_type="partnership",
        # [cleanup] display_name="合作动态",
        # [cleanup] keywords_zh=["合作", "战略合作", "达成合作", "签署", "联手", "携手", "联合"],
        keywords_en=["partnership", "collaborates", "teams up", "joins forces", "signs agreement"],
        required_entities=["ORG"],
        optional_entities=["ORG"],
        severity="info",
        # [cleanup] description="公司间合作"
    ),
    EventTemplate(
        event_type="breakthrough",
        # [cleanup] display_name="技术突破",
        # [cleanup] keywords_zh=["突破", "首创", "首个", "领先", "SOTA", "state-of-the-art", "创新", "刷新"],
        keywords_en=["breakthrough", "first", "state-of-the-art", "SOTA", "novel", "innovation"],
        required_entities=["TECHNOLOGY"],
        optional_entities=["ORG"],
        severity="info",
        # [cleanup] description="技术突破或创新"
    ),
    # ============================================================
    # 政企场景专用模板(ToB/ToG 情报中心刚需)
    # ============================================================
    EventTemplate(
        event_type="procurement_bid",
        # [cleanup] display_name="招投标动态",
        keywords_zh=[
            # [cleanup] "招标", "投标", "中标", "采购", "竞标", "询价", "单一来源",
            # [cleanup] "公开招标", "邀请招标", "评标", "开标", "废标", "流标",
            "政府采购", "项目招标", "招标公告", "中标公告"
        ],
        keywords_en=[
            "tender", "bid", "procurement", "RFP", "RFQ",
            "awarded", "contract award", "public tender"
        ],
        required_entities=["ORG"],
        optional_entities=["MONEY", "DATE"],
        severity="info",
        # [cleanup] description="招投标或采购动态(政企关注商机和竞争对手)"
    ),
    EventTemplate(
        event_type="policy_regulation",
        # [cleanup] display_name="政策解读",
        keywords_zh=[
            # [cleanup] "政策", "法规", "条例", "办法", "规定", "意见", "通知",
            # [cleanup] "印发", "实施", "施行", "废止", "修订",
            # [cleanup] "国务院", "部委", "监管局", "工信部", "网信办",
            "行业准入", "资质", "许可", "备案"
        ],
        keywords_en=[
            "policy", "regulation", "directive", "decree",
            "enacted", "repealed", "amended", "ministry"
        ],
        required_entities=[],
        optional_entities=["ORG", "DATE"],
        severity="warning",
        # [cleanup] description="政策法规发布或修订(影响业务合规)"
    ),
    EventTemplate(
        event_type="public_opinion_crisis",
        # [cleanup] display_name="舆情负面",
        keywords_zh=[
            # [cleanup] "曝光", "丑闻", "质疑", "投诉", "维权", "举报",
            # [cleanup] "翻车", "塌房", "抵制", "下架", "召回",
            # [cleanup] "群体事件", "维权事件", "负面舆情",
            "舆论", "热搜", "争议", "批评", "谴责"
        ],
        keywords_en=[
            "scandal", "controversy", "backlash", "boycott",
            "recall", "lawsuit", "complaint", "investigation"
        ],
        required_entities=["ORG"],
        optional_entities=["PERSON"],
        severity="critical",
        # [cleanup] description="负面舆情或公关危机(需即时告警)"
    ),
    EventTemplate(
        event_type="supply_chain_disruption",
        # [cleanup] display_name="供应链中断",
        keywords_zh=[
            # [cleanup] "断供", "停产", "停工", "短缺", "缺货", "断货",
            # [cleanup] "供应链", "产业链", "上游", "下游",
            # [cleanup] "卡脖子", "封锁", "禁运", "制裁",
            "原材料", "涨价", "缺芯", "缺料"
        ],
        keywords_en=[
            "supply chain", "shortage", "disruption", "outage",
            "embargo", "sanctions", "halt", "suspend"
        ],
        required_entities=["ORG"],
        optional_entities=["PRODUCT", "TECHNOLOGY"],
        severity="critical",
        # [cleanup] description="供应链中断或风险(影响业务连续性)"
    ),
    EventTemplate(
        event_type="compliance_penalty",
        # [cleanup] display_name="合规处罚",
        keywords_zh=[
            # [cleanup] "处罚", "罚款", "罚没", "立案", "调查", "约谈",
            # [cleanup] "整改", "警告", "通报", "吊销", "撤销",
            # [cleanup] "违规", "违法", "失信", "黑名单",
            "反垄断", "不正当竞争", "数据安全", "个人信息保护"
        ],
        keywords_en=[
            "penalty", "fine", "sanctioned", "investigated",
            "violated", "non-compliance", "blacklisted"
        ],
        required_entities=["ORG"],
        optional_entities=["MONEY"],
        severity="critical",
        # [cleanup] description="合规处罚或监管行动(直接影响业务)"
    ),
    EventTemplate(
        event_type="executive_change",
        # [cleanup] display_name="高管变动",
        keywords_zh=[
            # [cleanup] "辞任", "卸任", "出任", "加盟", "离职", "跳槽",
            # [cleanup] "任命", "免职", "调任", "接任", "继任",
            "董事会", "换届", "选举"
        ],
        keywords_en=[
            "resigns", "steps down", "appointed", "named",
            "joins", "leaves", "departs", "succeeds"
        ],
        required_entities=["PERSON"],
        optional_entities=["ORG"],
        severity="warning",
        # [cleanup] description="核心高管变动(影响公司战略稳定性)"
    ),
    EventTemplate(
        event_type="geopolitical_risk",
        # [cleanup] display_name="地缘政治风险",
        keywords_zh=[
            # [cleanup] "制裁", "禁运", "贸易战", "关税", "脱钩",
            # [cleanup] "出口管制", "实体清单", "黑名单",
            # [cleanup] "地缘政治", "双边关系", "外交", "领事",
            "军事", "冲突", "紧张", "对峙"
        ],
        keywords_en=[
            "sanctions", "embargo", "trade war", "tariff",
            "export control", "entity list", "geopolitical"
        ],
        required_entities=[],
        optional_entities=["ORG", "GPE"],
        severity="critical",
        # [cleanup] description="地缘政治风险(影响跨国业务)"
    ),
]


class TemplateMatcher:
    """事件模板匹配引擎"""

    def __init__(self, templates: List[EventTemplate] = None):
        self.templates = templates or EVENT_TEMPLATES
        # 预编译正则
        self._compiled: Dict[str, List[re.Pattern]] = {}
        for tpl in self.templates:
            patterns = []
            for kw in tpl.keywords_zh + tpl.keywords_en:
                patterns.append(re.compile(re.escape(kw), re.IGNORECASE))
            self._compiled[tpl.event_type] = patterns

    def match(
        self,
        text: str,
        entities: List[Dict[str, Any]] = None
    ) -> List[Tuple[EventTemplate, float, List[str]]]:
        """匹配文档,返回 (模板, 置信度, 命中关键词) 列表

        Args:
            text: 文档文本
            entities: 实体列表 [{"text": "...", "label": "ORG", "confidence": 0.9}]

        Returns:
            [(template, score, matched_keywords), ...] 按置信度降序
        """
        entities = entities or []
        entity_labels = {e.get("label", "").upper() for e in entities}

        results = []
        for tpl in self.templates:
            # 1. 关键词匹配
            matched_keywords = []
            for pattern in self._compiled[tpl.event_type]:
                if pattern.search(text):
                    matched_keywords.append(pattern.pattern)

            if not matched_keywords:
                continue

            # 2. 实体类型检查
            required_met = all(req in entity_labels for req in tpl.required_entities)
            if tpl.required_entities and not required_met:
                continue  # Required entities missing, skip

            # 3. 计算置信度
            # [cleanup] keyword_score = min(len(matched_keywords) / 3.0, 1.0)  # 3 个关键词满分
            entity_bonus = 0.2 if required_met else 0.0
            optional_bonus = 0.1 * sum(1 for opt in tpl.optional_entities if opt in entity_labels)
            confidence = min(keyword_score + entity_bonus + optional_bonus, 1.0)

            results.append((tpl, confidence, matched_keywords))

        results.sort(key=lambda x: x[1], reverse=True)
        return results

    def detect_events_from_documents(
        self,
        documents: List[Dict[str, Any]],
        min_confidence: float = 0.4
    ) -> List[Dict[str, Any]]:
        """从文档列表检测结构化事件

        Args:
            documents: [{"id":..., "clean_text":..., "entities":[...], "source":..., "timestamp":...}]
            min_confidence: 最小置信度阈值

        Returns:
            事件列表 [{"event_type", "display_name", "confidence", "matched_keywords",
                      "entities", "documents": [doc_ids], "timestamp", "severity"}]
        """
        # 按事件类型聚合
        events_by_type: Dict[str, Dict[str, Any]] = {}

        for doc in documents:
            text = doc.get("clean_text", "")
            entities = doc.get("entities", [])
            if isinstance(entities, str):
                import json
                try:
                    entities = json.loads(entities)
                except Exception:
                    entities = []

            matches = self.match(text, entities)

            for tpl, confidence, matched_kw in matches:
                if confidence < min_confidence:
                    continue

                key = tpl.event_type
                if key not in events_by_type:
                    events_by_type[key] = {
                        "event_type": tpl.event_type,
                        "display_name": tpl.display_name,
                        "severity": tpl.severity,
                        "description": tpl.description,
                        "confidence": confidence,
                        "matched_keywords": set(matched_kw),
                        "entities": set(),
                        "documents": [],
                        "sources": set(),
                        "timestamp": doc.get("timestamp", ""),
                    }

                event = events_by_type[key]
                event["documents"].append(doc.get("id", ""))
                event["sources"].add(doc.get("source", ""))
                event["confidence"] = max(event["confidence"], confidence)
                event["matched_keywords"].update(matched_kw)
                for e in entities:
                    event["entities"].add(f"{e.get('label','')}:{e.get('text','')}")

        # 转换为列表
        result = []
        for event in events_by_type.values():
            event["matched_keywords"] = list(event["matched_keywords"])
            event["entities"] = list(event["entities"])
            event["sources"] = list(event["sources"])
            event["doc_count"] = len(event["documents"])
            result.append(event)

        result.sort(key=lambda x: x["confidence"], reverse=True)
        # [cleanup] logger.info(f"模板检测到 {len(result)} 个结构化事件")
        return result
