"""MinIO 备份模块 - 将原始文档备份到对象存储"""

import json
import logging
import uuid
from io import BytesIO
from typing import List

from minio import Minio
from minio.error import S3Error

from collectors.base import RawDocument

logger = logging.getLogger(__name__)


class MinIOBackup:
    """MinIO 原始文档备份器"""

    def __init__(
        self,
        endpoint: str,
        access_key: str,
        secret_key: str,
        bucket_name: str = "raw-documents",
        secure: bool = False
    ):
        """
        初始化 MinIO 备份器

        Args:
            endpoint: MinIO 端点地址
            access_key: 访问密钥
            secret_key: 密钥
            bucket_name: 存储桶名称
            secure: 是否使用 HTTPS
        """
        self.endpoint = endpoint
        self.access_key = access_key
        self.secret_key = secret_key
        self.bucket_name = bucket_name
        self.secure = secure

        # 创建 MinIO 客户端
        self.client = Minio(
            endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure
        )

        # 延迟初始化桶,首次使用时创建
        self._bucket_ready = False

    def _ensure_bucket(self):
        """确保存储桶存在(懒初始化)"""
        if self._bucket_ready:
            return
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                # [cleanup] logger.info(f"创建存储桶: {self.bucket_name}")
            self._bucket_ready = True
        except S3Error as e:
            pass  # [fixed empty block]
            raise

    def backup_documents(self, documents: List[RawDocument]) -> int:
        """
        批量备份文档到 MinIO

        存储路径格式: YYYY/MM/DD/<uuid>.json

        Args:
            documents: 原始文档列表

        Returns:
            成功备份的文档数量
        """
        if not documents:
            return 0

        self._ensure_bucket()

        backup_count = 0

        for doc in documents:
            try:
                # 生成存储路径
                timestamp = doc.timestamp
                date_path = timestamp.strftime("%Y/%m/%d")
                file_name = f"{uuid.uuid4()}.json"
                object_name = f"{date_path}/{file_name}"

                # 序列化文档为 JSON
                doc_data = {
                    "source": doc.source,
                    "raw_content": doc.raw_content,
                    "url": doc.url,
                    "timestamp": doc.timestamp.isoformat(),
                    "metadata": doc.metadata,
                }

                json_data = json.dumps(doc_data, ensure_ascii=False, indent=2)
                json_bytes = json_data.encode("utf-8")

                # 上传到 MinIO
                data = BytesIO(json_bytes)

                self.client.put_object(
                    self.bucket_name,
                    object_name,
                    data,
                    length=len(json_bytes),
                    content_type="application/json"
                )

                # [cleanup] logger.debug(f"备份文档到 MinIO: {object_name}")
                backup_count += 1

            except Exception as e:

                pass  # [fixed empty block]
        return backup_count

    def get_backup_path(self, doc: RawDocument) -> str:
        """
        获取文档的备份路径(不执行上传)

        Args:
            doc: 原始文档

        Returns:
            对象路径
        """
        date_path = doc.timestamp.strftime("%Y/%m/%d")
        file_name = f"{uuid.uuid4()}.json"
        return f"{date_path}/{file_name}"
