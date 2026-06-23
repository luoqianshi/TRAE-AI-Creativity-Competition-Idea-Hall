-- 权限修复脚本
-- 用于检查和分配SuperAdmin和Admin的权限

-- 1. 查看现有角色
SELECT '现有角色:' as '--- 角色列表 ---';
SELECT * FROM roles;

-- 2. 查看现有权限
SELECT '现有权限:' as '--- 权限列表 ---';
SELECT * FROM permissions ORDER BY code;

-- 3. 查看角色-权限关联
SELECT '角色-权限关联:' as '--- 角色权限关联 ---';
SELECT r.name as role_name, p.code as permission_code
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.id, p.code;

-- 4. 查看管理员及其角色
SELECT '管理员角色:' as '--- 管理员角色分配 ---';
SELECT a.id, a.name, a.phone, r.name as role_name
FROM admins a
LEFT JOIN admin_roles ar ON a.id = ar.admin_id
LEFT JOIN roles r ON ar.role_id = r.id
ORDER BY a.id;

-- ============================================
-- 如果需要添加权限，执行以下语句
-- ============================================

-- 5. 确保存在必要的权限码（如果缺失则添加）
INSERT IGNORE INTO permissions (code, description) VALUES
('category:manage', '类目管理权限'),
('org:manage', '机构管理权限');

-- 6. 为Admin角色添加类目管理权限
-- 假设角色ID: 1=SuperAdmin, 2=Admin（请根据实际情况调整）
-- 先获取Admin角色的ID
SET @admin_role_id = (SELECT id FROM roles WHERE name = 'Admin');

-- 为Admin角色添加类目管理权限（category:manage）
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT @admin_role_id, id FROM permissions WHERE code = 'category:manage';

-- 7. 确保SuperAdmin拥有所有权限
-- 获取SuperAdmin角色ID
SET @superadmin_role_id = (SELECT id FROM roles WHERE name = 'SuperAdmin');

-- 为SuperAdmin添加缺失的权限（如果有的话）
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT @superadmin_role_id, p.id
FROM permissions p
WHERE p.code IN ('category:manage', 'org:manage')
AND p.id NOT IN (
  SELECT permission_id FROM role_permissions WHERE role_id = @superadmin_role_id
);

-- 8. 最终验证：显示每个角色的权限
SELECT '最终权限分配:' as '--- 角色权限验证 ---';
SELECT r.name as role_name,
       GROUP_CONCAT(p.code ORDER BY p.code SEPARATOR ', ') as permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
GROUP BY r.id, r.name
ORDER BY r.id;
