#!/bin/bash
# Neo4j 图谱数据备份脚本
# 建议通过 cron 每日执行: 0 2 * * * /path/to/backup_neo4j.sh

set -e

BACKUP_DIR="${NEO4J_BACKUP_DIR:-./backups/neo4j}"
DATE=$(date +%Y%m%d)
BACKUP_FILE="$BACKUP_DIR/omnilog_$DATE.dump"

mkdir -p "$BACKUP_DIR"

echo "开始 Neo4j 备份: $BACKUP_FILE"

# 在 Neo4j 容器中执行备份
docker exec omnilog-neo4j neo4j-admin database dump omnilog --to-path=/backups

# 复制到宿主机
docker cp omnilog-neo4j:/backups/omnilog.dump "$BACKUP_FILE"

# 清理容器内临时文件
docker exec omnilog-neo4j rm -f /backups/omnilog.dump

# 保留最近 30 天的备份
find "$BACKUP_DIR" -name "omnilog_*.dump" -mtime +30 -delete

echo "备份完成: $BACKUP_FILE"
echo "备份大小: $(du -h "$BACKUP_FILE" | cut -f1)"

# 可选: 推送到远程存储
# rsync "$BACKUP_FILE" remote:/backups/neo4j/
