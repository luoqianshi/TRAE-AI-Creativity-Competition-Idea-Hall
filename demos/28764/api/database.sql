-- FlowerSea Blog 留言板数据库表结构
-- 在 InfinityFree 的 phpMyAdmin 中执行此 SQL

-- 创建留言表
CREATE TABLE IF NOT EXISTS `comments` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `article_id` VARCHAR(50) NOT NULL DEFAULT '',
    `nickname` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) DEFAULT NULL,
    `content` TEXT NOT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '0=隐藏, 1=显示',
    PRIMARY KEY (`id`),
    KEY `idx_article_id` (`article_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='留言板评论表';

-- 创建留言统计表（可选，用于加速查询）
CREATE TABLE IF NOT EXISTS `comment_stats` (
    `article_id` VARCHAR(50) NOT NULL,
    `comment_count` INT(11) UNSIGNED NOT NULL DEFAULT 0,
    `last_comment_at` DATETIME DEFAULT NULL,
    PRIMARY KEY (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
