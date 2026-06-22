-- ============================================
-- 社区便民生活服务系统 - 数据库初始化脚本（完整版）
-- ============================================

CREATE DATABASE IF NOT EXISTS community_db DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_general_ci;
USE community_db;

-- -------------------------------------------
-- 1. 用户表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
                                      `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
                                      `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像路径',
    `role` TINYINT NOT NULL DEFAULT 0 COMMENT '角色：0-超级管理员 1-居民 2-维修 3-物业 4-家政服务员',
    `community_id` BIGINT DEFAULT NULL COMMENT '所属社区ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `delete_time` DATETIME DEFAULT NULL COMMENT '软删除时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- -------------------------------------------
-- 2. 公告表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `notice` (
                                        `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
                                        `title` VARCHAR(100) NOT NULL COMMENT '公告标题',
    `content` TEXT COMMENT '公告内容',
    `images` VARCHAR(1000) DEFAULT NULL COMMENT '图片路径数组（JSON）',
    `publisher_id` BIGINT NOT NULL COMMENT '发布人ID',
    `is_top` TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶：0-否 1-是',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `delete_time` DATETIME DEFAULT NULL COMMENT '软删除时间',
    PRIMARY KEY (`id`),
    KEY `idx_publisher` (`publisher_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';

-- -------------------------------------------
-- 3. 公告阅读表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `notice_read` (
                                             `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
                                             `notice_id` BIGINT NOT NULL COMMENT '公告ID',
                                             `user_id` BIGINT NOT NULL COMMENT '用户ID',
                                             `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读：0-未读 1-已读',
                                             `read_time` DATETIME DEFAULT NULL COMMENT '阅读时间',
                                             PRIMARY KEY (`id`),
    UNIQUE KEY `uk_notice_user` (`notice_id`, `user_id`),
    KEY `idx_user` (`user_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告阅读表';

-- -------------------------------------------
-- 4. 报修工单表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `repair_order` (
                                              `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
                                              `user_id` BIGINT NOT NULL COMMENT '报修用户ID',
                                              `title` VARCHAR(100) NOT NULL COMMENT '报修标题',
    `description` TEXT COMMENT '报修描述',
    `images` VARCHAR(1000) DEFAULT NULL COMMENT '图片路径数组（JSON）',
    `address` VARCHAR(255) DEFAULT NULL COMMENT '报修地址',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待受理 1-处理中 2-待确认 3-已完成 4-已评价',
    `handler_id` BIGINT DEFAULT NULL COMMENT '维修人员ID',
    `result` TEXT COMMENT '维修结果',
    `rating` TINYINT DEFAULT NULL COMMENT '星级评分（1-5）',
    `comment` VARCHAR(500) DEFAULT NULL COMMENT '评价文字',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    `accept_time` DATETIME DEFAULT NULL COMMENT '受理时间',
    `finish_time` DATETIME DEFAULT NULL COMMENT '完工时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `delete_time` DATETIME DEFAULT NULL COMMENT '软删除时间',
    PRIMARY KEY (`id`),
    KEY `idx_user` (`user_id`),
    KEY `idx_handler` (`handler_id`),
    KEY `idx_status` (`status`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报修工单表';

-- -------------------------------------------
-- 5. 闲置物品表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `idle_item` (
                                           `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
                                           `user_id` BIGINT NOT NULL COMMENT '发布者ID',
                                           `title` VARCHAR(100) NOT NULL COMMENT '物品标题',
    `description` TEXT COMMENT '物品描述',
    `images` VARCHAR(1000) DEFAULT NULL COMMENT '图片路径数组（JSON）',
    `category` VARCHAR(50) DEFAULT NULL COMMENT '物品分类',
    `price` DECIMAL(10,2) DEFAULT NULL COMMENT '价格',
    `trade_type` VARCHAR(20) DEFAULT NULL COMMENT '交易方式',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待审核 1-已发布 2-已售出 3-已下架',
    `audit_reason` VARCHAR(255) DEFAULT NULL COMMENT '审核驳回原因',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `delete_time` DATETIME DEFAULT NULL COMMENT '软删除时间',
    PRIMARY KEY (`id`),
    KEY `idx_user` (`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_category` (`category`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='闲置物品表';

-- -------------------------------------------
-- 6. 活动表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `activity` (
                                          `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
                                          `title` VARCHAR(100) NOT NULL COMMENT '活动标题',
    `description` TEXT COMMENT '活动描述',
    `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片路径',
    `start_time` DATETIME DEFAULT NULL COMMENT '活动开始时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '活动结束时间',
    `location` VARCHAR(255) DEFAULT NULL COMMENT '活动地点',
    `max_people` INT DEFAULT NULL COMMENT '人数上限',
    `current_people` INT NOT NULL DEFAULT 0 COMMENT '当前报名人数',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-报名中 1-已满额 2-进行中 3-已结束 4-已取消',
    `publisher_id` BIGINT NOT NULL COMMENT '发布人ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `delete_time` DATETIME DEFAULT NULL COMMENT '软删除时间',
    PRIMARY KEY (`id`),
    KEY `idx_publisher` (`publisher_id`),
    KEY `idx_status` (`status`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动表';

-- -------------------------------------------
-- 7. 活动报名表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_signup` (
                                                 `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
                                                 `activity_id` BIGINT NOT NULL COMMENT '活动ID',
                                                 `user_id` BIGINT NOT NULL COMMENT '报名用户ID',
                                                 `signup_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
                                                 PRIMARY KEY (`id`),
    UNIQUE KEY `uk_activity_user` (`activity_id`, `user_id`),
    KEY `idx_user` (`user_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动报名表';

-- -------------------------------------------
-- 8. 家政服务表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `housekeeping` (
                                              `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
                                              `title` VARCHAR(100) NOT NULL COMMENT '服务标题',
    `category` VARCHAR(50) DEFAULT NULL COMMENT '服务分类',
    `price` DECIMAL(10,2) DEFAULT NULL COMMENT '服务价格',
    `intro` TEXT COMMENT '服务介绍',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-下架 1-上架',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `delete_time` DATETIME DEFAULT NULL COMMENT '软删除时间',
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category`),
    KEY `idx_status` (`status`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家政服务表';

-- -------------------------------------------
-- 9. 家政订单表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `housekeeping_order` (
                                                    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
                                                    `user_id` BIGINT NOT NULL COMMENT '预约用户ID',
                                                    `service_id` BIGINT NOT NULL COMMENT '家政服务ID',
                                                    `appoint_time` DATETIME DEFAULT NULL COMMENT '预约时间',
                                                    `demand` TEXT COMMENT '需求描述',
                                                    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-已下单 1-已接单 2-服务中 3-已完成 4-已评价',
                                                    `rating` TINYINT DEFAULT NULL COMMENT '星级评分（1-5）',
                                                    `comment` VARCHAR(500) DEFAULT NULL COMMENT '评价文字',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `delete_time` DATETIME DEFAULT NULL COMMENT '软删除时间',
    PRIMARY KEY (`id`),
    KEY `idx_user` (`user_id`),
    KEY `idx_service` (`service_id`),
    KEY `idx_status` (`status`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家政订单表';

-- -------------------------------------------
-- 10. 闲置收藏表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `idle_favorite` (
                                              `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
                                              `user_id` BIGINT NOT NULL COMMENT '用户ID',
                                              `item_id` BIGINT NOT NULL COMMENT '闲置物品ID',
                                              `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
                                              PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_item` (`user_id`, `item_id`),
    KEY `idx_user` (`user_id`),
    KEY `idx_item` (`item_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='闲置收藏表';

-- -------------------------------------------
-- 11. 消息表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `message` (
                                       `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
                                       `from_user_id` BIGINT NOT NULL COMMENT '发送用户ID',
                                       `to_user_id` BIGINT NOT NULL COMMENT '接收用户ID',
                                       `content` TEXT COMMENT '消息内容',
                                       `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-未读 1-已读',
                                       `type` TINYINT NOT NULL DEFAULT 0 COMMENT '类型：0-普通消息 1-联系请求 2-收藏通知',
                                       `related_id` BIGINT DEFAULT NULL COMMENT '关联ID（物品/订单）',
                                       `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                       `delete_time` DATETIME DEFAULT NULL COMMENT '软删除时间',
                                       PRIMARY KEY (`id`),
    KEY `idx_from_user` (`from_user_id`),
    KEY `idx_to_user` (`to_user_id`),
    KEY `idx_status` (`status`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';

-- -------------------------------------------
-- 12. 闲置订单表
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `idle_order` (
                                           `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
                                           `item_id` BIGINT NOT NULL COMMENT '闲置物品ID',
                                           `buyer_id` BIGINT NOT NULL COMMENT '买家ID',
                                           `seller_id` BIGINT NOT NULL COMMENT '卖家ID',
                                           `price` DECIMAL(10,2) DEFAULT NULL COMMENT '成交价格',
                                           `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待确认 1-已确认(完成) 2-已取消',
                                           `buyer_message` VARCHAR(255) DEFAULT NULL COMMENT '买家留言',
                                           `cancel_reason` VARCHAR(255) DEFAULT NULL COMMENT '取消原因',
                                           `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                           `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                           `delete_time` DATETIME DEFAULT NULL COMMENT '软删除时间',
                                           PRIMARY KEY (`id`),
                                           KEY `idx_item` (`item_id`),
                                           KEY `idx_buyer` (`buyer_id`),
                                           KEY `idx_seller` (`seller_id`),
                                           KEY `idx_status` (`status`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='闲置订单表';

-- ============================================
-- 初始数据与测试数据（所有密码均为 123456 的 BCrypt 散列值）
-- 散列值: $2a$10$EixZaYVK1fsbw1ZfbX3OXe.P0mBU7JvGfR5HT4qjSQxK8Sm5pB/2C
-- ============================================

-- ---------- user 表（6条，覆盖所有角色） ----------
-- 超级管理员（ID=1）
INSERT INTO `user` (`username`, `password`, `real_name`, `phone`, `role`) VALUES
    ('admin',      '$2a$10$EixZaYVK1fsbw1ZfbX3OXe.P0mBU7JvGfR5HT4qjSQxK8Sm5pB/2C', '超级管理员', '13800000000', 0);
-- 物业管理员（ID=2）
INSERT INTO `user` (`username`, `password`, `real_name`, `phone`, `role`, `community_id`) VALUES
    ('property01', '$2a$10$EixZaYVK1fsbw1ZfbX3OXe.P0mBU7JvGfR5HT4qjSQxK8Sm5pB/2C', '张物业', '13800000001', 3, 1);
-- 普通居民（ID=3）
INSERT INTO `user` (`username`, `password`, `real_name`, `phone`, `role`, `community_id`) VALUES
    ('resident01', '$2a$10$EixZaYVK1fsbw1ZfbX3OXe.P0mBU7JvGfR5HT4qjSQxK8Sm5pB/2C', '李居民', '13800000002', 1, 1);
-- 维修人员（ID=4）
INSERT INTO `user` (`username`, `password`, `real_name`, `phone`, `role`, `community_id`) VALUES
    ('repair01',   '$2a$10$EixZaYVK1fsbw1ZfbX3OXe.P0mBU7JvGfR5HT4qjSQxK8Sm5pB/2C', '王维修', '13800000003', 2, 1);
-- 补充普通居民（ID=5）
INSERT INTO `user` (`username`, `password`, `real_name`, `phone`, `role`, `community_id`) VALUES
    ('resident02', '$2a$10$EixZaYVK1fsbw1ZfbX3OXe.P0mBU7JvGfR5HT4qjSQxK8Sm5pB/2C', '刘居民', '13800000004', 1, 1);
-- 补充维修人员（ID=6）
INSERT INTO `user` (`username`, `password`, `real_name`, `phone`, `role`, `community_id`) VALUES
    ('repair02',   '$2a$10$EixZaYVK1fsbw1ZfbX3OXe.P0mBU7JvGfR5HT4qjSQxK8Sm5pB/2C', '赵维修', '13800000005', 2, 1);
-- 家政服务员（ID=7）
INSERT INTO `user` (`username`, `password`, `real_name`, `phone`, `role`, `community_id`) VALUES
    ('housekeeper01', '$2a$10$EixZaYVK1fsbw1ZfbX3OXe.P0mBU7JvGfR5HT4qjSQxK8Sm5pB/2C', '周家政', '13800000006', 4, 1);

-- ---------- notice 表（5条，物业管理员 ID=2 发布） ----------
INSERT INTO `notice` (`title`, `content`, `publisher_id`, `is_top`) VALUES
    ('关于小区消防通道整治的通知', '各位业主您好，为进一步加强小区消防安全管理，物业将于本周六（6月8日）上午9:00起对小区消防通道进行集中整治。请各位业主提前将停放在消防通道内的车辆移走，配合物业工作人员的现场指挥。届时将对违规占用消防通道的车辆进行贴单警告，感谢您的理解与支持！', 2, 1); -- ID=1
INSERT INTO `notice` (`title`, `content`, `publisher_id`, `is_top`) VALUES
                                                                        ('端午节社区活动通知', '各位业主，为庆祝传统佳节，社区将于6月10日举办包粽子比赛，欢迎踊跃报名！', 2, 1),
                                                                        ('关于小区停电的通知', '接供电局通知，6月8日8:00-18:00小区将临时停电，请各位业主提前做好准备。', 2, 0),
                                                                        ('文明养犬温馨提示', '近期收到多起宠物扰民投诉，请养犬业主自觉牵绳、清理粪便，共同维护小区环境。', 2, 0),
                                                                        ('夏季安全防范提醒', '夏季入室盗窃高发，请关好门窗，发现可疑人员立即联系物业。', 2, 0);

-- ---------- notice_read 表（5条，关联居民 ID=3 和 5） ----------
INSERT INTO `notice_read` (`notice_id`, `user_id`, `is_read`, `read_time`) VALUES
                                                                               (1, 3, 1, NOW()),
                                                                               (1, 5, 0, NULL),
                                                                               (2, 3, 1, NOW()),
                                                                               (2, 5, 0, NULL),
                                                                               (3, 3, 1, NOW());

-- ---------- repair_order 表（5条，覆盖全部状态） ----------
-- 待受理（ID=1）
INSERT INTO `repair_order` (`user_id`, `title`, `description`, `address`, `phone`, `status`) VALUES
    (3, '卫生间水管漏水', '主卧卫生间洗手台下方水管持续渗漏，地面有积水，已影响正常使用，请尽快派人处理。', '阳光花园小区 3栋 2单元 501室', '13800000002', 0);
-- 处理中（ID=2，指派给维修人员 ID=4）
INSERT INTO `repair_order` (`user_id`, `title`, `description`, `address`, `phone`, `status`, `handler_id`, `accept_time`) VALUES
    (3, '厨房水龙头漏水', '水龙头关闭后仍有滴水，请检查密封圈。', '3栋2单元501', '13800000002', 1, 4, NOW());
-- 待确认（ID=3，维修人员已完成）
INSERT INTO `repair_order` (`user_id`, `title`, `description`, `address`, `phone`, `status`, `handler_id`, `result`, `accept_time`, `finish_time`) VALUES
    (3, '客厅灯不亮', '客厅主灯完全不亮，可能线路问题。', '3栋2单元501', '13800000002', 2, 4, '已更换LED驱动器，恢复正常。', '2026-06-03 10:00:00', '2026-06-03 11:30:00');
-- 已完成未评价（ID=4，居民 ID=5）
INSERT INTO `repair_order` (`user_id`, `title`, `description`, `address`, `phone`, `status`, `handler_id`, `result`, `accept_time`, `finish_time`) VALUES
    (5, '空调不制冷', '卧室空调开机后出风不冷。', '5栋1单元302', '13800000004', 3, 4, '添加制冷剂，清洗滤网，已正常。', '2026-06-02 09:00:00', '2026-06-02 11:00:00');
-- 已评价（ID=5，居民 ID=3）
INSERT INTO `repair_order` (`user_id`, `title`, `description`, `address`, `phone`, `status`, `handler_id`, `result`, `rating`, `comment`, `accept_time`, `finish_time`) VALUES
    (3, '马桶堵塞', '马桶冲水不畅，水溢出。', '3栋2单元501', '13800000002', 4, 4, '疏通管道，清理杂物。', 5, '师傅上门很快，技术很好！', '2026-06-01 14:00:00', '2026-06-01 15:30:00');

-- ---------- idle_item 表（5条，多种状态） ----------
INSERT INTO `idle_item` (`user_id`, `title`, `description`, `category`, `price`, `trade_type`, `status`) VALUES
                                                                                                             (3, '二手儿童自行车', '品牌好孩子，16寸，适合4-7岁，八成新，刹车灵敏。', '童车玩具', 120.00, '低价转让', 1), -- 已发布
                                                                                                             (3, '闲置电风扇', '美的落地扇，三档调节，使用两年，功能完好。', '家用电器', 50.00, '低价转让', 1),
                                                                                                             (5, '免费赠送旧书', '成人小说、杂志约20本，自提免费送。', '图书音像', 0.00, '免费赠送', 1),
                                                                                                             (5, '九成新咖啡机', '德龙全自动咖啡机，原价2000，现800转。', '厨房用品', 800.00, '低价转让', 0), -- 待审核
                                                                                                             (3, '旧手机（iPhone X）', '64G，屏幕有划痕，功能正常，当备用机出售。', '数码产品', 600.00, '低价转让', 1);

-- ---------- activity 表（5条） ----------
INSERT INTO `activity` (`title`, `description`, `start_time`, `end_time`, `location`, `max_people`, `current_people`, `status`, `publisher_id`) VALUES
                                                                                                                                                    ('社区亲子运动会', '带上孩子一起参加趣味运动会，项目有跳绳、拔河、接力跑等。', '2026-06-15 09:00:00', '2026-06-15 12:00:00', '小区中心广场', 50, 12, 0, 2), -- 报名中
                                                                                                                                                    ('端午节包粽子大赛', '现场提供材料，评选最佳粽子，有精美礼品。', '2026-06-10 14:00:00', '2026-06-10 17:00:00', '社区活动室', 30, 30, 1, 2), -- 满额
                                                                                                                                                    ('老年健康讲座', '邀请人民医院心内科主任讲解夏季养生知识。', '2026-06-20 10:00:00', '2026-06-20 11:30:00', '物业会议室', 40, 25, 0, 2),
                                                                                                                                                    ('小区邻里市集', '居民闲置物品交换与低价售卖，促进邻里交流。', '2026-06-25 08:00:00', '2026-06-25 12:00:00', '小区步行街', 100, 5, 0, 2),
                                                                                                                                                    ('暑期电影放映', '露天电影《功夫熊猫4》，请自带小板凳。', '2026-07-05 19:30:00', '2026-07-05 21:30:00', '中心广场', 200, 18, 0, 2);

-- ---------- activity_signup 表（5条） ----------
INSERT INTO `activity_signup` (`activity_id`, `user_id`) VALUES
                                                             (1, 3), (1, 5), (1, 4),
                                                             (3, 3), (4, 5);

-- ---------- housekeeping 表（5条） ----------
INSERT INTO `housekeeping` (`title`, `category`, `price`, `intro`, `phone`, `status`) VALUES
                                                                                          ('日常保洁', '保洁清洗', 60.00, '室内基础打扫、擦窗、拖地，2小时起订。', '13900000001', 1),
                                                                                          ('开锁换锁', '维修安装', 150.00, '防盗门、室内门开锁及锁芯更换，24小时服务。', '13900000002', 1),
                                                                                          ('空调维修', '家电维修', 100.00, '空调不制冷、漏水、异响等故障检修，不含配件费。', '13900000003', 1),
                                                                                          ('管道疏通', '水电维修', 200.00, '厨房、卫生间下水管道疏通，大型机器疏通。', '13900000004', 1),
                                                                                          ('搬家服务', '家政其他', 300.00, '市内搬家，提供车辆及搬运工，超出楼层另算。', '13900000005', 1);

-- ---------- housekeeping_order 表（5条） ----------
INSERT INTO `housekeeping_order` (`user_id`, `service_id`, `appoint_time`, `demand`, `status`, `rating`, `comment`) VALUES
                                                                                                                        (3, 1, '2026-06-10 08:00:00', '两室一厅全面清洁，需擦阳台玻璃。', 3, 5, '阿姨打扫得很干净！'),        -- 已完成（待评价）
                                                                                                                        (3, 3, '2026-06-12 14:00:00', '卧室空调不制冷，请尽快维修。', 1, NULL, NULL),                  -- 已接单
                                                                                                                        (5, 2, '2026-06-08 10:00:00', '入户门锁芯损坏，需要更换。', 2, NULL, NULL),                    -- 服务中
                                                                                                                        (5, 4, '2026-06-15 09:00:00', '卫生间地漏堵塞，洗澡水排不下去。', 0, NULL, NULL),              -- 已下单
                                                                                                                        (3, 5, '2026-07-01 07:00:00', '从本小区搬到3公里外的翠苑小区，有电梯。', 0, NULL, NULL);        -- 已下单