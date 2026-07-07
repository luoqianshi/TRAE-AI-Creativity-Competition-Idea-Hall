"""Sensitive data masking — auto-detect and mask PII before storage.

Detects and masks:
- Chinese ID numbers (18 digits)
- Phone numbers (11 digits)
- Bank card numbers (16-19 digits)
- Email addresses
- Passport numbers (E + 8 digits)
- License plate numbers
- IPv4 addresses
"""

import hashlib
import logging
import os
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


@dataclass
class SensitivePattern:
    """A sensitive data detection pattern."""
    name: str
    regex: str
    keep_prefix: int = 3
    keep_suffix: int = 4
    mask_char: str = "*"


# Predefined patterns
PATTERNS = [
    SensitivePattern("phone", r"\b1[3-9]\d{9}\b", keep_prefix=3, keep_suffix=4),
    SensitivePattern("id_card", r"\b\d{17}[\dXx]\b", keep_prefix=4, keep_suffix=4),
    SensitivePattern("bank_card", r"\b\d{16,19}\b", keep_prefix=4, keep_suffix=4),
    SensitivePattern("email", r"\b[\w.-]+@[\w.-]+\.\w+\b", keep_prefix=1, keep_suffix=0),
    SensitivePattern("passport", r"\b[Ee]\d{8}\b", keep_prefix=1, keep_suffix=4),
    SensitivePattern("license_plate", r"\b[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏琼][A-Z][A-HJ-NP-Z0-9]{5}\b", keep_prefix=2, keep_suffix=3),
    SensitivePattern("ipv4", r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", keep_prefix=0, keep_suffix=0),
]


class DataMasker:
    """Sensitive data masker for PII detection and masking before storage."""

    def __init__(self, salt: str = ""):
        """Initialize with an optional salt for audit hashing.

        Args:
            salt: Salt for hash-based reversible masking.
        """
        self.salt = salt

    def mask_text(
        self, text: str, skip_internal_ip: bool = True
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """Mask sensitive information in text.

        Args:
            text: Original text.
            skip_internal_ip: Skip internal IPs (10.x, 172.16-31.x, 192.168.x).

        Returns:
            Tuple of (masked_text, list of masking records).

        修复: 原实现在迭代 finditer 的同时修改 result 字符串, 导致后续匹配的
        start/end 应用到已修改的字符串上, 当 masked 长度 != value 长度时位置错乱.
        新实现: 先收集所有匹配, 再按 start 倒序替换, 这样早期替换不会影响
        后续匹配的原始位置.
        """
        # Step 1: 在原始 text 上扫描所有模式的匹配 (位置基于原始 text, 不变)
        all_matches = []  # list of (start, end, value, pattern)
        for pattern in PATTERNS:
            for match in re.finditer(pattern.regex, text):
                value = match.group()
                # Skip internal IPs
                if pattern.name == "ipv4" and skip_internal_ip:
                    if self._is_internal_ip(value):
                        continue
                all_matches.append((match.start(), match.end(), value, pattern))

        # 去重: 同一位置的多次匹配只保留第一个 (避免 email 与 phone 重叠)
        seen_positions = set()
        unique_matches = []
        for m in all_matches:
            key = (m[0], m[1])
            if key in seen_positions:
                continue
            seen_positions.add(key)
            unique_matches.append(m)

        # Step 2: 按 start 倒序排序, 从后向前替换, 保证早期位置不变
        unique_matches.sort(key=lambda x: x[0], reverse=True)

        records = []
        result = text
        for start, end, value, pattern in unique_matches:
            masked = self._apply_mask(value, pattern)
            result = result[:start] + masked + result[end:]
            # position 仍基于原始 text (用户在原文中定位敏感数据)
            records.append({
                "type": pattern.name,
                "original_hash": self._hash(value),
                "masked": masked,
                "position": [start, end],
            })

        # records 按正序返回 (方便阅读)
        records.reverse()
        return result, records

    def mask_document(
        self,
        doc: Dict[str, Any],
        text_fields: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Mask sensitive data in a document's text fields.

        Args:
            doc: Document to mask.
            text_fields: Fields to check (default: common text fields).

        Returns:
            Masked document copy.
        """
        if text_fields is None:
            text_fields = ["clean_text", "raw_content", "title", "summary", "content"]

        all_records: List[Dict[str, Any]] = []
        masked_doc = dict(doc)

        for field in text_fields:
            if field in masked_doc and isinstance(masked_doc[field], str):
                masked_text, records = self.mask_text(masked_doc[field])
                masked_doc[field] = masked_text
                all_records.extend(records)

        if all_records:
            metadata = masked_doc.setdefault("metadata", {})
            if isinstance(metadata, dict):
                metadata["_masking_count"] = len(all_records)
                metadata["_masked"] = True

        return masked_doc

    def mask_batch(
        self, documents: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Mask a batch of documents."""
        return [self.mask_document(doc) for doc in documents]

    def _apply_mask(self, value: str, pattern: SensitivePattern) -> str:
        """Apply masking rules.

        For email: mask username portion, preserve domain.
        For IPv4: mask last two octets of each segment.
        For others: preserve prefix/suffix, mask middle.
        """
        if pattern.name == "email":
            return self._mask_email(value)
        if pattern.name == "ipv4":
            return self._mask_ipv4(value)

        length = len(value)
        if pattern.keep_prefix + pattern.keep_suffix >= length:
            return pattern.mask_char * length

        prefix = value[:pattern.keep_prefix]
        suffix = value[-pattern.keep_suffix:] if pattern.keep_suffix > 0 else ""
        middle_len = length - pattern.keep_prefix - pattern.keep_suffix
        return f"{prefix}{pattern.mask_char * middle_len}{suffix}"

    @staticmethod
    def _mask_email(email: str) -> str:
        """Mask email: keep first char of username, mask rest, preserve domain."""
        if "@" not in email:
            return email
        user, domain = email.split("@", 1)
        if len(user) <= 1:
            return f"*@{domain}"
        return f"{user[0]}{'*' * (len(user) - 1)}@{domain}"

    @staticmethod
    def _mask_ipv4(ip: str) -> str:
        """Mask IPv4: mask last two digits of each octet."""
        parts = ip.split(".")
        masked_parts = []
        for part in parts:
            if len(part) <= 2:
                masked_parts.append("*" * len(part))
            else:
                masked_parts.append(part[:-2] + "**")
        return ".".join(masked_parts)

    @staticmethod
    def _is_internal_ip(ip: str) -> bool:
        """Check if an IP address is internal/private."""
        try:
            parts = [int(p) for p in ip.split(".")]
            if len(parts) != 4:
                return False
            if parts[0] == 10:
                return True
            if parts[0] == 172 and 16 <= parts[1] <= 31:
                return True
            if parts[0] == 192 and parts[1] == 168:
                return True
            if parts[0] == 127:
                return True
            return False
        except (ValueError, IndexError):
            return False

    def _hash(self, value: str) -> str:
        """Hash original value for audit trail (one-way, not reversible)."""
        return hashlib.sha256(f"{self.salt}{value}".encode()).hexdigest()[:16]


# Global singleton
_masker: Optional[DataMasker] = None


def get_data_masker() -> DataMasker:
    """Get or create the global DataMasker singleton."""
    global _masker
    if _masker is None:
        salt = os.getenv("MASKING_SALT", "omnilog_default_salt")
        _masker = DataMasker(salt=salt)
    return _masker


def mask_text(text: str) -> Tuple[str, List[Dict[str, Any]]]:
    """Convenience function to mask sensitive data in text."""
    return get_data_masker().mask_text(text)
