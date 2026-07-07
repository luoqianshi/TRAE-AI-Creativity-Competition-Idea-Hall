"""Intelligence alert routing — rule-based alert dispatch with channel support.

Replaces the hardcoded severity-based routing with a configurable rules engine.
Rules are stored in PostgreSQL (alert_rules table) and support conditions on:
  - severity
  - entity_type
  - source
  - keyword (regex match on content)

Channels: Feishu, DingTalk, Email.
Inspired by WorldMonitor's multi-channel alert routing patterns.
"""

import asyncio
import hashlib
import logging
import os
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional

import aiohttp

logger = logging.getLogger(__name__)

# Dedup window in seconds
_DEDUP_WINDOW = 300
_dedup_cache: Dict[str, float] = {}


class ActionChannel(str, Enum):
    """Supported alert destination channels."""

    FEISHU = "feishu"
    DINGTALK = "dingtalk"
    EMAIL = "email"


@dataclass
class AlertRule:
    """A single alert routing rule."""

    rule_id: int
    name: str
    enabled: bool = True

    # Conditions (all must match; empty list means "any")
    severities: List[str] = field(default_factory=list)
    entity_types: List[str] = field(default_factory=list)
    sources: List[str] = field(default_factory=list)
    keywords: List[str] = field(default_factory=list)
    keyword_patterns: List[re.Pattern] = field(default_factory=list)

    # Action
    channels: List[ActionChannel] = field(
        default_factory=lambda: [ActionChannel.FEISHU]
    )
    template: str = "default"

    # Metadata
    created_at: Optional[str] = None

    def matches(self, message: Dict[str, Any]) -> bool:
        """Check if an alert message matches this rule's conditions."""
        # Severity check
        sev = message.get("severity", "info")
        if self.severities and sev not in self.severities:
            return False

        # Entity type check
        msg_entity_types = message.get("entity_types", [])
        if self.entity_types and msg_entity_types:
            if not any(et in self.entity_types for et in msg_entity_types):
                return False

        # Source check
        msg_sources = message.get("sources", [])
        if self.sources and msg_sources:
            if not any(s in self.sources for s in msg_sources):
                return False

        # Keyword / regex check
        content = f"{message.get('title', '')} {message.get('content', '')}"
        if self.keyword_patterns:
            if not any(p.search(content) for p in self.keyword_patterns):
                return False

        return True


class AlertRouter:
    """Configurable alert router with rule-based dispatch.

    Loads rules from PostgreSQL (alert_rules table) at startup and supports
    hot-reload. Falls back to a default severity-based rule if no custom rules
    are configured.
    """

    # Default rule mirrors the original hardcoded behavior
    _DEFAULT_RULES = [
        AlertRule(
            rule_id=0,
            name="Default: critical → all channels",
            enabled=True,
            severities=["critical"],
            channels=[
                ActionChannel.FEISHU,
                ActionChannel.DINGTALK,
                ActionChannel.EMAIL,
            ],
        ),
        AlertRule(
            rule_id=-1,
            name="Default: warning → feishu + dingtalk",
            enabled=True,
            severities=["warning"],
            channels=[ActionChannel.FEISHU, ActionChannel.DINGTALK],
        ),
        AlertRule(
            rule_id=-2,
            name="Default: info → feishu only",
            enabled=True,
            severities=["info"],
            channels=[ActionChannel.FEISHU],
        ),
    ]

    def __init__(self):
        self._session: Optional[aiohttp.ClientSession] = None
        self._rules: List[AlertRule] = list(self._DEFAULT_RULES)
        self._pg_pool = None

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None:
            self._session = aiohttp.ClientSession()
        return self._session

    async def load_rules_from_db(self) -> int:
        """Load alert rules from PostgreSQL alert_rules table.

        Returns the count of rules loaded. Falls back to defaults on failure.
        """
        try:
            from utils.db_pool import get_pool_manager

            pool = await get_pool_manager()
            pg = await pool.postgres.get_pool()
            async with pg.acquire() as conn:
                rows = await conn.fetch(
                    "SELECT id, name, enabled, severities, entity_types, "
                    "sources, keywords, channels, template "
                    "FROM alert_rules WHERE enabled = TRUE "
                    "ORDER BY id ASC"
                )
            rules: List[AlertRule] = []
            for row in rows:
                kw = row.get("keywords") or []
                rules.append(
                    AlertRule(
                        rule_id=row["id"],
                        name=row.get("name", f"rule_{row['id']}"),
                        enabled=row.get("enabled", True),
                        severities=row.get("severities") or [],
                        entity_types=row.get("entity_types") or [],
                        sources=row.get("sources") or [],
                        keywords=kw,
                        keyword_patterns=[re.compile(k, re.I) for k in kw],
                        channels=[
                            ActionChannel(c) for c in (row.get("channels") or ["feishu"])
                        ],
                        template=row.get("template", "default"),
                    )
                )

            if rules:
                self._rules = rules
                logger.info("Loaded %d alert rules from database", len(rules))
            else:
                logger.info("No alert rules in database — using defaults")
            return len(rules)
        except Exception as e:
            logger.warning("Failed to load alert rules from DB: %s", e)
            return 0

    def reload_rules(self) -> int:
        """Hot-reload rules (calls load_rules_from_db synchronously wrapper)."""
        try:
            loop = asyncio.get_running_loop()
            return loop.run_until_complete(self.load_rules_from_db())
        except RuntimeError:
            logger.warning("No event loop — skipping rule reload")
            return 0

    def add_rule(self, rule: AlertRule) -> None:
        """Add a rule at runtime (non-persistent unless saved to DB)."""
        self._rules.append(rule)

    def _dedup_key(self, message: Dict) -> str:
        content = message.get("title", "") + message.get("content", "")
        return hashlib.md5(content.encode()).hexdigest()

    def _is_duplicate(self, key: str) -> bool:
        now = datetime.now(timezone.utc).timestamp()
        if key in _dedup_cache:
            if now - _dedup_cache[key] < _DEDUP_WINDOW:
                return True
        _dedup_cache[key] = now
        expired = [k for k, v in _dedup_cache.items() if now - v >= _DEDUP_WINDOW]
        for k in expired:
            del _dedup_cache[k]
        return False

    def _build_alert_message(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "title": raw.get("title", raw.get("summary", "Alert")),
            "content": raw.get("summary", raw.get("description", "")),
            "severity": raw.get("severity", "info"),
            "entity_types": raw.get("entity_types", []),
            "entities": raw.get("entities", []),
            "sources": raw.get("sources", []),
            "confidence": raw.get("confidence", 0.5),
            "doc_count": raw.get("doc_count", 0),
            "timestamp": raw.get("timestamp", datetime.now(timezone.utc).isoformat()),
        }

    # --- main routing --------------------------------------------------------

    async def route_alert(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """Route an alert through matching rules and dispatch to channels.

        Args:
            raw: Raw event data dict.

        Returns:
            Dict with routing result: matched_rule_ids, channels_sent, deduped.
        """
        message = self._build_alert_message(raw)

        # Dedup
        dk = self._dedup_key(message)
        if self._is_duplicate(dk):
            logger.debug("Deduped alert: %s", message.get("title"))
            return {"matched_rule_ids": [], "channels_sent": [], "deduped": True}

        # Find matching rules
        matched: List[AlertRule] = [r for r in self._rules if r.matches(message)]
        if not matched:
            logger.debug("No matching rule for alert: %s", message.get("title"))
            return {"matched_rule_ids": [], "channels_sent": [], "deduped": False}

        # Collect unique channels across matched rules
        channels_to_send: set = set()
        for rule in matched:
            channels_to_send.update(rule.channels)

        # Dispatch
        sent: List[str] = []
        session = await self._get_session()

        if ActionChannel.FEISHU in channels_to_send:
            if await self._send_feishu(session, message):
                sent.append("feishu")

        if ActionChannel.DINGTALK in channels_to_send:
            if await self._send_dingtalk(session, message):
                sent.append("dingtalk")

        if ActionChannel.EMAIL in channels_to_send:
            if await self._send_email(session, message):
                sent.append("email")

        logger.info(
            "Alert '%s' matched %d rules → sent to %s",
            message.get("title"),
            len(matched),
            ", ".join(sent) or "none",
        )
        return {
            "matched_rule_ids": [r.rule_id for r in matched],
            "channels_sent": sent,
            "deduped": False,
        }

    async def route_alerts_batch(
        self, alerts: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Route multiple alerts concurrently."""
        tasks = [self.route_alert(a) for a in alerts]
        return await asyncio.gather(*tasks)

    # --- channel senders -----------------------------------------------------

    async def _send_feishu(
        self, session: aiohttp.ClientSession, message: Dict[str, Any]
    ) -> bool:
        webhook = os.getenv("FEISHU_WEBHOOK_URL", "")
        if not webhook:
            return False
        try:
            payload = {
                "msg_type": "interactive",
                "card": {
                    "header": {
                        "title": {"tag": "plain_text", "content": message["title"]},
                        "template": self._feishu_color(message["severity"]),
                    },
                    "elements": [
                        {"tag": "markdown", "content": message["content"]},
                        {
                            "tag": "note",
                            "elements": [
                                {
                                    "tag": "plain_text",
                                    "content": (
                                        f"Severity: {message['severity']}  |  "
                                        f"Confidence: {message['confidence']:.2f}  |  "
                                        f"Sources: {message.get('doc_count', 0)}"
                                    ),
                                }
                            ],
                        },
                    ],
                },
            }
            async with session.post(webhook, json=payload, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                return resp.status == 200
        except Exception as e:
            logger.error("Feishu alert failed: %s", e)
            return False

    async def _send_dingtalk(
        self, session: aiohttp.ClientSession, message: Dict[str, Any]
    ) -> bool:
        webhook = os.getenv("DINGTALK_WEBHOOK_URL", "")
        if not webhook:
            return False
        try:
            payload = {
                "msgtype": "markdown",
                "markdown": {
                    "title": message["title"],
                    "text": (
                        f"## {message['title']}\\n\\n"
                        f"{message['content']}\\n\\n"
                        f"*Severity: {message['severity']}*"
                    ),
                },
            }
            async with session.post(webhook, json=payload, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                return resp.status == 200
        except Exception as e:
            logger.error("DingTalk alert failed: %s", e)
            return False

    async def _send_email(
        self, session: aiohttp.ClientSession, message: Dict[str, Any]
    ) -> bool:
        smtp_host = os.getenv("SMTP_HOST", "")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER", "")
        smtp_pass = os.getenv("SMTP_PASS", "")
        recipients = os.getenv("ALERT_EMAIL_RECIPIENTS", "")

        if not all([smtp_host, smtp_user, smtp_pass, recipients]):
            return False
        try:
            import smtplib
            from email.mime.text import MIMEText

            body = (
                f"Subject: [INTEL] {message['title']}\\n\\n"
                f"{message['content']}\\n\\n"
                f"Severity: {message['severity']}\\n"
                f"Confidence: {message['confidence']:.2f}\\n"
                f"Sources: {message.get('doc_count', 0)}\\n"
                f"Entities: {', '.join(message.get('entities', []))}"
            )
            msg = MIMEText(body, "plain", "utf-8")
            msg["Subject"] = f"[INTEL-{message['severity'].upper()}] {message['title']}"
            msg["From"] = smtp_user
            msg["To"] = recipients

            loop = asyncio.get_event_loop()

            def _send():
                with smtplib.SMTP(smtp_host, smtp_port) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.send_message(msg)

            await loop.run_in_executor(None, _send)
            return True
        except Exception as e:
            logger.error("Email alert failed: %s", e)
            return False

    @staticmethod
    def _feishu_color(severity: str) -> str:
        return {"critical": "red", "warning": "yellow", "info": "blue"}.get(
            severity, "blue"
        )

    async def close(self):
        if self._session:
            await self._session.close()
            self._session = None


# Global singleton
_router: Optional[AlertRouter] = None


def get_alert_router() -> AlertRouter:
    """Get or create the global AlertRouter singleton."""
    global _router
    if _router is None:
        _router = AlertRouter()
    return _router
