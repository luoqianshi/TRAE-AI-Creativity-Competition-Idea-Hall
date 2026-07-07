"""标准化文档数据模型"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional

from utils.timezone import utc_now_naive as _utc_now


@dataclass
class StandardDoc:
    """标准化后的文档结构"""
    id: str
    source: str
    clean_text: str
    language: str
    tags: List[str] = field(default_factory=list)
    # [cleanup] entities: List[dict] = field(default_factory=list)  # 预留,后续 NER 填充
    timestamp: datetime = field(default_factory=_utc_now)
    url: Optional[str] = None
    # [cleanup] fingerprint: Optional[str] = None  # SimHash 指纹(十六进制字符串)
    metadata: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        """转换为字典(用于 JSON 序列化)"""
        return {
            "id": self.id,
            "source": self.source,
            "clean_text": self.clean_text,
            "language": self.language,
            "tags": self.tags,
            "entities": self.entities,
            "timestamp": self.timestamp.isoformat(),
            "url": self.url,
            "fingerprint": self.fingerprint,
            "metadata": self.metadata,
        }

    def to_es_dict(self) -> dict:
        """转换为 Elasticsearch 文档格式"""
        return {
            "id": self.id,
            "source": self.source,
            "clean_text": self.clean_text,
            "language": self.language,
            "tags": self.tags,
            "entities": self.entities,
            "timestamp": self.timestamp.isoformat(),
            "url": self.url,
            "fingerprint": self.fingerprint,
            "metadata": self.metadata,
        }
