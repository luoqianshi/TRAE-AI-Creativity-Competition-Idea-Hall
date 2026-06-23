/*
 Navicat Premium Data Transfer

 Source Server         : docker8.4
 Source Server Type    : MySQL
 Source Server Version : 80405
 Source Host           : 127.0.0.1:13306
 Source Schema         : caiwu

 Target Server Type    : MySQL
 Target Server Version : 80405
 File Encoding         : 65001

 Date: 04/03/2026 23:26:54
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admin_roles
-- ----------------------------
DROP TABLE IF EXISTS `admin_roles`;
CREATE TABLE `admin_roles`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL COMMENT '管理员ID',
  `role_id` int NOT NULL COMMENT '角色ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_admin_role`(`admin_id` ASC, `role_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '管理员角色关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of admin_roles
-- ----------------------------
INSERT INTO `admin_roles` VALUES (1, 1, 1, '2026-03-03 06:26:37');
INSERT INTO `admin_roles` VALUES (2, 2, 2, '2026-03-03 06:26:37');

-- ----------------------------
-- Table structure for admins
-- ----------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '姓名',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '手机号',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '密码（bcrypt加密）',
  `is_active` tinyint(1) NULL DEFAULT 1 COMMENT '是否启用',
  `last_login_at` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `phone`(`phone` ASC) USING BTREE,
  INDEX `idx_phone`(`phone` ASC) USING BTREE,
  INDEX `idx_is_active`(`is_active` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '管理员表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of admins
-- ----------------------------
INSERT INTO `admins` VALUES (1, '超管', '13800138000', '$2b$10$YmVOPrN26XdVmJG5TuAJJOoyz9QCpHlfZpbOi3Q9SLKBjtbcL29uO', 1, '2026-03-04 15:21:04', '2026-03-03 06:26:37', '2026-03-04 15:21:04');
INSERT INTO `admins` VALUES (2, '王老师', '13900139000', '$2b$10$YmVOPrN26XdVmJG5TuAJJOoyz9QCpHlfZpbOi3Q9SLKBjtbcL29uO', 1, NULL, '2026-03-03 06:26:37', '2026-03-03 06:43:13');

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '类目名称',
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '#3B82F6' COMMENT '颜色标识（前端展示）',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序序号',
  `is_active` tinyint(1) NULL DEFAULT 1 COMMENT '是否启用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE,
  INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '类目表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES (1, '教材费用', '#10B981', 1, 1, '2026-03-03 06:26:37', '2026-03-03 06:26:37');
INSERT INTO `categories` VALUES (2, '玩具采购', '#F59E0B', 2, 1, '2026-03-03 06:26:37', '2026-03-03 06:26:37');
INSERT INTO `categories` VALUES (3, '伙食费', '#EF4444', 3, 1, '2026-03-03 06:26:37', '2026-03-03 06:26:37');
INSERT INTO `categories` VALUES (4, '水电费', '#3B82F6', 4, 1, '2026-03-03 06:26:37', '2026-03-03 06:26:37');
INSERT INTO `categories` VALUES (5, '活动经费', '#8B5CF6', 5, 1, '2026-03-03 06:26:37', '2026-03-03 06:26:37');
INSERT INTO `categories` VALUES (6, '其他', '#6B7280', 99, 1, '2026-03-03 06:26:37', '2026-03-03 06:26:37');

-- ----------------------------
-- Table structure for classes
-- ----------------------------
DROP TABLE IF EXISTS `classes`;
CREATE TABLE `classes`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `org_id` int NOT NULL COMMENT '所属机构ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '班级名称',
  `is_active` tinyint(1) NULL DEFAULT 1 COMMENT '是否启用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_org_name`(`org_id` ASC, `name` ASC) USING BTREE COMMENT '同一机构下班级名称唯一',
  INDEX `idx_org_id`(`org_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '班级表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of classes
-- ----------------------------
INSERT INTO `classes` VALUES (1, 1, '大班一班', 1, '2026-03-03 06:26:37', '2026-03-03 06:26:37');
INSERT INTO `classes` VALUES (2, 1, '大班二班', 1, '2026-03-03 06:26:37', '2026-03-03 06:26:37');
INSERT INTO `classes` VALUES (3, 1, '中班一班', 1, '2026-03-03 06:26:37', '2026-03-03 06:26:37');
INSERT INTO `classes` VALUES (4, 1, '中班二班', 1, '2026-03-03 06:26:37', '2026-03-03 06:26:37');
INSERT INTO `classes` VALUES (5, 1, '小班一班', 1, '2026-03-03 06:26:37', '2026-03-03 06:26:37');
INSERT INTO `classes` VALUES (6, 1, '小班二班', 1, '2026-03-03 06:26:37', '2026-03-03 06:26:37');

-- ----------------------------
-- Table structure for expenses
-- ----------------------------
DROP TABLE IF EXISTS `expenses`;
CREATE TABLE `expenses`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL COMMENT '日期',
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '类目',
  `amount` decimal(10, 2) NOT NULL COMMENT '金额',
  `handler` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '经手人',
  `status` enum('待审核','进行中','已完成') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '待审核' COMMENT '状态',
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '备注',
  `class_id` int NULL DEFAULT NULL COMMENT '班级ID',
  `org_id` int NULL DEFAULT NULL COMMENT '机构ID',
  `created_by` int NULL DEFAULT NULL COMMENT '创建人（管理员ID）',
  `approved_by` int NULL DEFAULT NULL COMMENT '审批人（管理员ID）',
  `approved_at` timestamp NULL DEFAULT NULL COMMENT '审批时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_date`(`date` ASC) USING BTREE,
  INDEX `idx_category`(`category` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_org_class`(`org_id` ASC, `class_id` ASC) USING BTREE,
  INDEX `idx_created_by`(`created_by` ASC) USING BTREE,
  INDEX `idx_approved_by`(`approved_by` ASC) USING BTREE,
  CONSTRAINT `expenses_chk_1` CHECK (`amount` > 0)
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '费用记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of expenses
-- ----------------------------
INSERT INTO `expenses` VALUES (1, '2024-03-01', '教材费用', 2500.00, '李老师', '已完成', NULL, 1, 1, 1, NULL, NULL, '2026-03-03 06:26:38', '2026-03-03 06:26:38');
INSERT INTO `expenses` VALUES (2, '2024-03-02', '玩具采购', 800.00, '王老师', '已完成', NULL, 2, 1, 2, NULL, NULL, '2026-03-03 06:26:38', '2026-03-03 06:26:38');
INSERT INTO `expenses` VALUES (3, '2024-03-03', '伙食费', 3200.00, '张老师', '进行中', NULL, 3, 1, 2, NULL, NULL, '2026-03-03 06:26:38', '2026-03-03 06:26:38');
INSERT INTO `expenses` VALUES (4, '2024-03-04', '水电费', 650.00, '李老师', '待审核', NULL, NULL, 1, 1, NULL, NULL, '2026-03-03 06:26:38', '2026-03-03 06:26:38');
INSERT INTO `expenses` VALUES (5, '2024-03-05', '活动经费', 1500.00, '王老师', '已完成', NULL, 4, 1, 2, NULL, NULL, '2026-03-03 06:26:38', '2026-03-03 06:26:38');

-- ----------------------------
-- Table structure for operation_logs
-- ----------------------------
DROP TABLE IF EXISTS `operation_logs`;
CREATE TABLE `operation_logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `operation` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '操作内容',
  `operator` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '操作人',
  `admin_id` int NULL DEFAULT NULL COMMENT '操作的管理员ID',
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'IP地址',
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '用户代理',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_admin_id`(`admin_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '操作日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of operation_logs
-- ----------------------------
INSERT INTO `operation_logs` VALUES (1, '系统初始化完成', '系统', NULL, NULL, NULL, '2026-03-03 06:26:38');
INSERT INTO `operation_logs` VALUES (2, '初始化数据导入成功', '系统', NULL, NULL, NULL, '2026-03-03 06:26:38');
INSERT INTO `operation_logs` VALUES (3, '用户登录系统', '李老师', 1, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.26100.6584', '2026-03-03 06:43:48');
INSERT INTO `operation_logs` VALUES (4, '用户登录系统', '李老师', 1, '::1', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)', '2026-03-03 06:47:45');
INSERT INTO `operation_logs` VALUES (5, '用户登录系统', '超管', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-03-04 11:51:27');
INSERT INTO `operation_logs` VALUES (6, '用户登录系统', '超管', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-03-04 11:51:42');
INSERT INTO `operation_logs` VALUES (7, '用户登录系统', '超管', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) CodeBuddy/1.100.0 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2026-03-04 11:58:00');
INSERT INTO `operation_logs` VALUES (8, '用户登录系统', '超管', 1, '::1', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)', '2026-03-04 12:18:55');
INSERT INTO `operation_logs` VALUES (9, '用户登录系统', '超管', 1, '::1', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)', '2026-03-04 13:07:11');
INSERT INTO `operation_logs` VALUES (10, '用户登录系统', '超管', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/2.6.11 Chrome/142.0.7444.265 Electron/39.6.0 Safari/537.36', '2026-03-04 13:34:30');
INSERT INTO `operation_logs` VALUES (11, '用户登录系统', '超管', 1, '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-03-04 13:34:57');
INSERT INTO `operation_logs` VALUES (12, '用户登录系统', '超管', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/2.6.11 Chrome/142.0.7444.265 Electron/39.6.0 Safari/537.36', '2026-03-04 13:35:49');
INSERT INTO `operation_logs` VALUES (13, '用户登录系统', '超管', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-03-04 14:20:04');
INSERT INTO `operation_logs` VALUES (14, '用户登录系统', '超管', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) CodeBuddy/1.100.0 Chrome/132.0.6834.210 Electron/34.5.1 Safari/537.36', '2026-03-04 14:41:20');
INSERT INTO `operation_logs` VALUES (15, '用户登录系统', '超管', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-03-04 15:19:24');
INSERT INTO `operation_logs` VALUES (16, '用户登录系统', '超管', 1, '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-03-04 15:21:04');

-- ----------------------------
-- Table structure for organizations
-- ----------------------------
DROP TABLE IF EXISTS `organizations`;
CREATE TABLE `organizations`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '机构名称',
  `is_active` tinyint(1) NULL DEFAULT 1 COMMENT '是否启用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '机构表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of organizations
-- ----------------------------
INSERT INTO `organizations` VALUES (1, '阳光幼儿园', 1, '2026-03-03 06:26:37', '2026-03-03 06:26:37');

-- ----------------------------
-- Table structure for permissions
-- ----------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '权限名称',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '权限代码（用于程序判断）',
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '权限描述',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '权限表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of permissions
-- ----------------------------
INSERT INTO `permissions` VALUES (1, '创建费用', 'expense:create', '创建新的费用记录', '2026-03-03 06:26:36');
INSERT INTO `permissions` VALUES (2, '查看费用', 'expense:read', '查看费用列表和详情', '2026-03-03 06:26:36');
INSERT INTO `permissions` VALUES (3, '编辑费用', 'expense:update', '编辑费用记录', '2026-03-03 06:26:36');
INSERT INTO `permissions` VALUES (4, '删除费用', 'expense:delete', '删除费用记录', '2026-03-03 06:26:36');
INSERT INTO `permissions` VALUES (5, '管理类目', 'category:manage', '添加、编辑、删除费用类目', '2026-03-03 06:26:36');
INSERT INTO `permissions` VALUES (6, '管理机构', 'org:manage', '管理机构和班级', '2026-03-03 06:26:36');
INSERT INTO `permissions` VALUES (7, '管理管理员', 'admin:manage', '管理管理员账户', '2026-03-03 06:26:36');
INSERT INTO `permissions` VALUES (8, '查看报表', 'report:view', '查看统计报表和数据可视化', '2026-03-03 06:26:36');
INSERT INTO `permissions` VALUES (9, '查看日志', 'log:view', '查看系统操作日志', '2026-03-03 06:26:36');

-- ----------------------------
-- Table structure for role_permissions
-- ----------------------------
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL COMMENT '角色ID',
  `permission_id` int NOT NULL COMMENT '权限ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_role_perm`(`role_id` ASC, `permission_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 24 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '角色权限关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of role_permissions
-- ----------------------------
INSERT INTO `role_permissions` VALUES (1, 1, 7, '2026-03-03 06:26:36');
INSERT INTO `role_permissions` VALUES (2, 1, 5, '2026-03-03 06:26:36');
INSERT INTO `role_permissions` VALUES (3, 1, 1, '2026-03-03 06:26:36');
INSERT INTO `role_permissions` VALUES (4, 1, 4, '2026-03-03 06:26:36');
INSERT INTO `role_permissions` VALUES (5, 1, 2, '2026-03-03 06:26:36');
INSERT INTO `role_permissions` VALUES (6, 1, 3, '2026-03-03 06:26:36');
INSERT INTO `role_permissions` VALUES (7, 1, 9, '2026-03-03 06:26:36');
INSERT INTO `role_permissions` VALUES (8, 1, 6, '2026-03-03 06:26:36');
INSERT INTO `role_permissions` VALUES (9, 1, 8, '2026-03-03 06:26:36');
INSERT INTO `role_permissions` VALUES (16, 2, 5, '2026-03-03 06:26:36');
INSERT INTO `role_permissions` VALUES (17, 2, 1, '2026-03-03 06:26:36');
INSERT INTO `role_permissions` VALUES (18, 2, 2, '2026-03-03 06:26:36');
INSERT INTO `role_permissions` VALUES (19, 2, 3, '2026-03-03 06:26:36');
INSERT INTO `role_permissions` VALUES (20, 2, 6, '2026-03-03 06:26:36');
INSERT INTO `role_permissions` VALUES (21, 2, 8, '2026-03-03 06:26:36');
INSERT INTO `role_permissions` VALUES (23, 3, 2, '2026-03-03 06:26:37');
INSERT INTO `role_permissions` VALUES (24, 3, 8, '2026-03-03 06:26:37');
INSERT INTO `role_permissions` VALUES (25, 2, 7, '2026-03-05 01:20:13');

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '角色名称',
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '角色描述',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '角色表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'SuperAdmin', '超级管理员，拥有所有权限', '2026-03-03 06:26:36', '2026-03-03 06:26:36');
INSERT INTO `roles` VALUES (2, 'Admin', '财务管理员，负责费用管理和报表查看', '2026-03-03 06:26:36', '2026-03-03 06:26:36');
INSERT INTO `roles` VALUES (3, 'Viewer', '查看者，仅能查看费用和报表', '2026-03-03 06:26:36', '2026-03-03 06:26:36');

SET FOREIGN_KEY_CHECKS = 1;
