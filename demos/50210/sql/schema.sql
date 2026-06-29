-- ============================================
-- 电子电路开源社区系统 - 数据库Schema
-- 版本: 1.0.0
-- 编码: UTF8MB4
-- ============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------
-- 1. 用户表 (users)
-- -------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱地址',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希值',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `bio` TEXT COMMENT '个人简介',
  `role` ENUM('user', 'admin', 'moderator') NOT NULL DEFAULT 'user' COMMENT '用户角色',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '账户状态',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- -------------------------------------------
-- 2. 项目表 (projects)
-- -------------------------------------------
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '项目ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `title` VARCHAR(200) NOT NULL COMMENT '项目标题',
  `description` TEXT COMMENT '项目描述',
  `category` ENUM('kicad', 'easyeda', 'altium', 'other') NOT NULL DEFAULT 'other' COMMENT '项目分类',
  `file_format` VARCHAR(50) DEFAULT NULL COMMENT '文件格式',
  `version` VARCHAR(20) DEFAULT '1.0.0' COMMENT '版本号',
  `license` VARCHAR(50) DEFAULT 'MIT' COMMENT '开源许可证',
  `stars` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '收藏数',
  `forks` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Fork数',
  `views` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览数',
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' COMMENT '项目状态',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_stars` (`stars` DESC),
  KEY `idx_created_at` (`created_at` DESC),
  CONSTRAINT `fk_projects_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目表';

-- -------------------------------------------
-- 3. 元器件表 (components)
-- -------------------------------------------
DROP TABLE IF EXISTS `components`;
CREATE TABLE `components` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '元器件ID',
  `name` VARCHAR(200) NOT NULL COMMENT '元器件名称',
  `category` ENUM('resistor', 'capacitor', 'inductor', 'ic', 'connector', 'other') NOT NULL DEFAULT 'other' COMMENT '分类',
  `package` VARCHAR(50) DEFAULT NULL COMMENT '封装类型',
  `manufacturer` VARCHAR(100) DEFAULT NULL COMMENT '制造商',
  `model` VARCHAR(100) DEFAULT NULL COMMENT '型号',
  `datasheet_url` VARCHAR(500) DEFAULT NULL COMMENT '数据手册链接',
  `price` DECIMAL(10, 2) DEFAULT NULL COMMENT '单价(元)',
  `stock` INT UNSIGNED DEFAULT 0 COMMENT '库存数量',
  `specifications` JSON DEFAULT NULL COMMENT '规格参数(JSON)',
  `created_by` INT UNSIGNED NOT NULL COMMENT '创建者ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_manufacturer` (`manufacturer`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_name` (`name`),
  CONSTRAINT `fk_components_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='元器件表';

-- -------------------------------------------
-- 4. 讨论帖表 (posts)
-- -------------------------------------------
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '帖子ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `title` VARCHAR(200) NOT NULL COMMENT '帖子标题',
  `content` TEXT NOT NULL COMMENT '帖子内容',
  `category` ENUM('qa', 'discussion', 'showcase', 'tutorial') NOT NULL DEFAULT 'discussion' COMMENT '帖子分类',
  `tags` VARCHAR(500) DEFAULT NULL COMMENT '标签(逗号分隔)',
  `views` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览数',
  `likes` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
  `is_pinned` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否置顶',
  `status` ENUM('published', 'closed', 'deleted') NOT NULL DEFAULT 'published' COMMENT '帖子状态',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_is_pinned` (`is_pinned`),
  KEY `idx_created_at` (`created_at` DESC),
  KEY `idx_likes` (`likes` DESC),
  CONSTRAINT `fk_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='讨论帖表';

-- -------------------------------------------
-- 5. 评论表 (comments)
-- -------------------------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `post_id` INT UNSIGNED NOT NULL COMMENT '帖子ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `parent_id` INT UNSIGNED DEFAULT NULL COMMENT '父评论ID(支持嵌套回复)',
  `likes` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- -------------------------------------------
-- 6. 文件表 (files)
-- -------------------------------------------
DROP TABLE IF EXISTS `files`;
CREATE TABLE `files` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文件ID',
  `project_id` INT UNSIGNED NOT NULL COMMENT '项目ID',
  `filename` VARCHAR(255) NOT NULL COMMENT '存储文件名',
  `original_name` VARCHAR(255) NOT NULL COMMENT '原始文件名',
  `file_type` VARCHAR(50) NOT NULL COMMENT '文件类型',
  `file_size` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '文件大小(字节)',
  `file_path` VARCHAR(500) NOT NULL COMMENT '文件存储路径',
  `uploaded_by` INT UNSIGNED NOT NULL COMMENT '上传者ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  CONSTRAINT `fk_files_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_files_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件表';

-- -------------------------------------------
-- 7. 项目收藏表 (project_stars)
-- -------------------------------------------
DROP TABLE IF EXISTS `project_stars`;
CREATE TABLE `project_stars` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `project_id` INT UNSIGNED NOT NULL COMMENT '项目ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_project_user` (`project_id`, `user_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_stars_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_stars_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目收藏表';

-- -------------------------------------------
-- 8. 用户技能表 (user_skills)
-- -------------------------------------------
DROP TABLE IF EXISTS `user_skills`;
CREATE TABLE `user_skills` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '技能ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `skill_name` VARCHAR(100) NOT NULL COMMENT '技能名称',
  `level` ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL DEFAULT 'beginner' COMMENT '技能等级',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_skill` (`user_id`, `skill_name`),
  KEY `idx_skill_name` (`skill_name`),
  CONSTRAINT `fk_skills_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户技能表';

-- -------------------------------------------
-- 9. 学习资源表 (learning_resources)
-- -------------------------------------------
DROP TABLE IF EXISTS `learning_resources`;
CREATE TABLE `learning_resources` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '资源ID',
  `title` VARCHAR(200) NOT NULL COMMENT '资源标题',
  `content` TEXT NOT NULL COMMENT '资源内容',
  `category` ENUM('tutorial', 'course', 'case_study', 'tool_guide') NOT NULL DEFAULT 'tutorial' COMMENT '资源分类',
  `difficulty` ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner' COMMENT '难度等级',
  `author_id` INT UNSIGNED NOT NULL COMMENT '作者ID',
  `views` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览数',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_difficulty` (`difficulty`),
  KEY `idx_author_id` (`author_id`),
  KEY `idx_created_at` (`created_at` DESC),
  CONSTRAINT `fk_resources_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习资源表';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 初始化数据
-- ============================================

-- 管理员账户 (密码: Admin@123456)
INSERT INTO `users` (`username`, `email`, `password_hash`, `bio`, `role`, `status`) VALUES
('admin', 'admin@circuit-community.com', '$2b$10$YourHashedPasswordHere', '系统管理员，负责社区运营和维护', 'admin', 'active');

-- 测试用户账户
INSERT INTO `users` (`username`, `email`, `password_hash`, `bio`, `role`, `status`) VALUES
('zhangsan', 'zhangsan@example.com', '$2b$10$YourHashedPasswordHere', '电子工程师，5年PCB设计经验', 'user', 'active'),
('lisi', 'lisi@example.com', '$2b$10$YourHashedPasswordHere', '嵌入式开发爱好者，STM32玩家', 'user', 'active'),
('wangwu', 'wangwu@example.com', '$2b$10$YourHashedPasswordHere', '硬件设计师，擅长电源管理电路', 'moderator', 'active');

-- 示例项目
INSERT INTO `projects` (`user_id`, `title`, `description`, `category`, `file_format`, `version`, `license`, `stars`, `forks`, `views`, `status`) VALUES
(2, 'STM32最小系统板', '基于STM32F103C8T6的最小系统板设计，包含电源、晶振、复位电路', 'kicad', 'kicad_pcb', '1.0.0', 'MIT', 45, 12, 320, 'published'),
(3, 'ESP32开发板', 'ESP32-WROOM-32开发板，集成USB转串口、电池充电管理', 'easyeda', 'json', '2.1.0', 'Apache-2.0', 78, 25, 560, 'published'),
(4, 'DC-DC降压模块', '基于LM2596的可调降压模块，输入7-40V，输出1.25-37V', 'kicad', 'kicad_pcb', '1.2.0', 'MIT', 120, 45, 890, 'published'),
(2, '音频功放电路', '基于TPA3116D2的D类功放，2x50W输出', 'altium', 'prjpcb', '0.9.0', 'MIT', 32, 8, 180, 'draft');

-- 示例元器件
INSERT INTO `components` (`name`, `category`, `package`, `manufacturer`, `model`, `price`, `stock`, `specifications`, `created_by`) VALUES
('10K电阻', 'resistor', '0603', 'YAGEO', 'RC0603FR-0710KL', 0.01, 10000, '{"resistance": "10KΩ", "tolerance": "±1%", "power": "0.1W"}', 1),
('100uF电解电容', 'capacitor', '6.3x5.4mm', 'Nichicon', 'UWT1E101MNL1GS', 0.15, 5000, '{"capacitance": "100μF", "voltage": "25V", "temperature": "85°C"}', 1),
('STM32F103C8T6', 'ic', 'LQFP-48', 'STMicroelectronics', 'STM32F103C8T6', 8.50, 500, '{"flash": "64KB", "ram": "20KB", "frequency": "72MHz"}', 2),
('USB Type-C母座', 'connector', 'SMD', 'Molex', '105450-0101', 2.80, 200, '{"pins": 16, "current": "5A", "protocol": "USB 3.1"}', 3);

-- 示例讨论帖
INSERT INTO `posts` (`user_id`, `title`, `content`, `category`, `tags`, `views`, `likes`, `is_pinned`, `status`) VALUES
(1, '欢迎来到电子电路开源社区！', '大家好！欢迎加入我们的电子电路开源社区。在这里，你可以分享你的电路设计，学习电子知识，与其他爱好者交流。\n\n请先阅读社区规范，然后开始你的探索之旅！', 'discussion', '公告,欢迎', 1500, 89, 1, 'published'),
(2, 'STM32新手入门指南', '作为一名刚入门的新手，我整理了一份STM32入门学习路线，希望能帮助到同样在学习的朋友。\n\n## 学习路线\n1. 基础知识：C语言、数字电路\n2. 开发环境：Keil/IAR/STM32CubeIDE\n3. GPIO操作\n4. 定时器\n5. 中断\n6. 通信协议（UART、SPI、I2C）', 'tutorial', 'STM32,入门,教程', 856, 67, 0, 'published'),
(3, 'ESP32 WiFi断连问题求助', '我的ESP32项目在运行一段时间后会自动断开WiFi连接，已经尝试了以下方法：\n1. 增加看门狗\n2. 调整WiFi功率\n3. 修改TCP keepalive参数\n\n但问题依然存在，请问有遇到过类似问题的朋友吗？', 'qa', 'ESP32,WiFi,问题', 234, 15, 0, 'published'),
(4, '分享：DC-DC降压模块设计经验', '最近完成了一个DC-DC降压模块的设计，基于LM2596芯片。分享一些设计心得：\n\n## 关键参数\n- 输入电压：7-40V\n- 输出电压：1.25-37V可调\n- 输出电流：最大3A\n- 效率：约85%\n\n## 注意事项\n1. 电感选择很关键\n2. 输入输出电容要足够大\n3. 布局要注意散热', 'showcase', 'DC-DC,电源,LM2596', 445, 32, 0, 'published');

-- 示例评论
INSERT INTO `comments` (`post_id`, `user_id`, `content`, `parent_id`, `likes`) VALUES
(1, 2, '感谢管理员！期待社区发展壮大！', NULL, 5),
(1, 3, '终于有个专业的电路社区了，支持！', NULL, 3),
(2, 4, '写得很详细，对新手很友好！', NULL, 8),
(2, 2, '谢谢！后续我会继续更新其他章节', 3, 2),
(3, 4, '试试调整WiFi漫游参数，设置低RSSI阈值', NULL, 6),
(4, 2, '这个模块很实用，请问PCB文件可以分享吗？', NULL, 4);

-- 用户技能
INSERT INTO `user_skills` (`user_id`, `skill_name`, `level`) VALUES
(2, 'STM32', 'intermediate'),
(2, 'C语言', 'advanced'),
(2, 'PCB设计', 'beginner'),
(3, 'ESP32', 'advanced'),
(3, 'Python', 'advanced'),
(3, 'WiFi协议', 'intermediate'),
(4, '电源设计', 'expert'),
(4, 'Altium Designer', 'advanced'),
(4, '模拟电路', 'advanced');

-- 学习资源
INSERT INTO `learning_resources` (`title`, `content`, `category`, `difficulty`, `author_id`, `views`) VALUES
('KiCad入门教程', '## KiCad入门\n\nKiCad是一款开源的EDA软件，本教程将带你从零开始学习PCB设计。\n\n### 第一章：安装与界面介绍\n...\n\n### 第二章：原理图设计\n...\n\n### 第三章：PCB布局\n...', 'tutorial', 'beginner', 1, 1200),
('STM32 HAL库开发实战', '## STM32 HAL库开发\n\n本课程详细讲解STM32 HAL库的使用方法。\n\n### 课程目录\n1. HAL库概述\n2. GPIO操作\n3. 定时器\n4. UART通信\n5. SPI通信\n6. I2C通信\n7. ADC/DAC', 'course', 'intermediate', 2, 890),
('开关电源设计案例分析', '## 开关电源设计\n\n本案例分析一个实际的开关电源设计项目。\n\n### 项目背景\n设计一个5V/3A的USB充电器\n\n### 设计过程\n1. 需求分析\n2. 拓扑选择\n3. 元器件选型\n4. 原理图设计\n5. PCB布局\n6. 测试验证', 'case_study', 'advanced', 4, 650),
('Altium Designer常用快捷键', '## Altium Designer快捷键大全\n\n### 常用快捷键\n- `P + W`：放置导线\n- `P + P`：放置元件\n- `P + T`：放置文字\n- `Space`：旋转元件\n- `X/Y`：水平/垂直翻转', 'tool_guide', 'beginner', 4, 450);
