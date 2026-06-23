import { getConnection } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';

// 获取所有管理员列表
export async function getAllAdmins(req, res) {
  try {
    const conn = await getConnection();

    const [rows] = await conn.query(`
      SELECT a.id, a.name, a.phone, a.is_active, a.last_login_at, a.created_at,
             GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ',') as roles
      FROM admins a
      LEFT JOIN admin_roles ar ON a.id = ar.admin_id
      LEFT JOIN roles r ON ar.role_id = r.id
      WHERE 1=1
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);

    const admins = rows.map(admin => ({
      ...admin,
      roles: admin.roles ? admin.roles.split(',') : []
    }));

    res.json({ success: true, data: admins });
  } catch (error) {
    console.error('获取管理员列表错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 创建新管理员
export async function createAdmin(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: errors.array()
      });
    }

    const { name, phone, password, role_ids, role } = req.body;
    const conn = await getConnection();

    // 获取角色ID映射
    const [roleRows] = await conn.query('SELECT id, name FROM roles');
    const roleMap = Object.fromEntries(roleRows.map(r => [r.name, r.id]));
    const superAdminRoleId = roleMap.SuperAdmin;
    const adminRoleId = roleMap.Admin;
    const viewerRoleId = roleMap.Viewer;

    if (!superAdminRoleId) {
      return res.status(500).json({ success: false, message: '系统错误：SuperAdmin角色不存在' });
    }

    // 支持 role 字符串或 role_ids 数组；优先使用 role_ids
    let finalRoleIds = role_ids && Array.isArray(role_ids) ? role_ids : [];
    if (finalRoleIds.length === 0 && role) {
      if (role === 'SuperAdmin') {
        return res.status(403).json({ success: false, message: '不允许创建SuperAdmin账号' });
      }
      if (role === 'Admin' && adminRoleId) finalRoleIds = [adminRoleId];
      else if (role === 'Viewer' && viewerRoleId) finalRoleIds = [viewerRoleId];
    }

    if (finalRoleIds.includes(superAdminRoleId)) {
      return res.status(403).json({ success: false, message: '不允许创建SuperAdmin账号' });
    }

    // 检查手机号是否已存在
    const [existing] = await conn.query(
      'SELECT id FROM admins WHERE phone = ?',
      [phone]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: '手机号已存在' });
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await conn.query(
      'INSERT INTO admins (name, phone, password) VALUES (?, ?, ?)',
      [name, phone, hashedPassword]
    );

    // 关联角色（确保不分配SuperAdmin）
    if (finalRoleIds && finalRoleIds.length > 0) {
      for (const roleId of finalRoleIds) {
        // 再次过滤，确保不会意外分配SuperAdmin
        if (roleId !== superAdminRoleId) {
          await conn.query(
            'INSERT INTO admin_roles (admin_id, role_id) VALUES (?, ?)',
            [result.insertId, roleId]
          );
        }
      }
    }

    // 记录操作日志
    await conn.query(
      'INSERT INTO operation_logs (operation, operator, admin_id) VALUES (?, ?, ?)',
      [`创建新管理员: ${name} (${phone})`, req.user.admin.name, req.user.adminId]
    );

    const [newAdmin] = await conn.query(`
      SELECT a.*, GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ',') as roles
      FROM admins a
      LEFT JOIN admin_roles ar ON a.id = ar.admin_id
      LEFT JOIN roles r ON ar.role_id = r.id
      WHERE a.id = ?
      GROUP BY a.id
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      data: { ...newAdmin[0], roles: newAdmin[0].roles ? newAdmin[0].roles.split(',') : [] },
      message: '管理员创建成功'
    });
  } catch (error) {
    console.error('创建管理员错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 更新管理员状态
export async function updateAdminStatus(req, res) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const conn = await getConnection();

    const [result] = await conn.query(
      'UPDATE admins SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '管理员不存在' });
    }

    const action = is_active ? '启用' : '禁用';
    await conn.query(
      'INSERT INTO operation_logs (operation, operator, admin_id) VALUES (?, ?, ?)',
      [`${action}管理员 ID:${id}`, req.user.admin.name, req.user.adminId]
    );

    res.json({ success: true, message: `管理员已${action}` });
  } catch (error) {
    console.error('更新管理员状态错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 重置管理员密码
export async function resetAdminPassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const conn = await getConnection();

    // 验证管理员存在
    const [existing] = await conn.query(
      'SELECT id FROM admins WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: '管理员不存在' });
    }

    // 新密码加密
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await conn.query(
      'UPDATE admins SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, id]
    );

    await conn.query(
      'INSERT INTO operation_logs (operation, operator, admin_id) VALUES (?, ?, ?)',
      [`重置管理员密码 ID:${id}`, req.user.admin.name, req.user.adminId]
    );

    res.json({ success: true, message: '密码重置成功' });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 获取所有角色和权限
export async function getAllRolesAndPermissions(req, res) {
  try {
    const conn = await getConnection();

    const [roles] = await conn.query(`
      SELECT r.id, r.name, r.description,
             GROUP_CONCAT(p.code ORDER BY p.code) as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      GROUP BY r.id
      ORDER BY r.id
    `);

    const [permissions] = await conn.query('SELECT * FROM permissions ORDER BY id');

    res.json({
      success: true,
      data: {
        roles: roles.map(role => ({
          ...role,
          permissions: role.permissions ? role.permissions.split(',') : []
        })),
        permissions
      }
    });
  } catch (error) {
    console.error('获取角色权限错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

export default {
  getAllAdmins,
  createAdmin,
  updateAdminStatus,
  resetAdminPassword,
  getAllRolesAndPermissions
};