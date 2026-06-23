import { getConnection } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 登录
export async function login(req, res) {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: errors.array()
      });
    }

    const { phone, password } = req.body;

    const conn = await getConnection();

    // 查询管理员及其角色
    const [adminRows] = await conn.query(`
      SELECT a.id, a.name, a.phone, a.password, a.is_active,
             GROUP_CONCAT(r.name SEPARATOR ',') as roles
      FROM admins a
      LEFT JOIN admin_roles ar ON a.id = ar.admin_id
      LEFT JOIN roles r ON ar.role_id = r.id
      WHERE a.phone = ? AND a.is_active = 1
      GROUP BY a.id
    `, [phone]);

    if (adminRows.length === 0) {
      return res.status(401).json({ success: false, message: '手机号或密码错误' });
    }

    const admin = adminRows[0];

    // 验证密码
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: '手机号或密码错误' });
    }

    // 获取完整权限
    const [roles] = await conn.query(`
      SELECT r.id, r.name, r.description,
             GROUP_CONCAT(p.code ORDER BY p.code) as permissions
      FROM admin_roles ar
      JOIN roles r ON ar.role_id = r.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE ar.admin_id = ?
      GROUP BY r.id
    `, [admin.id]);

    // 更新最后登录时间
    await conn.query('UPDATE admins SET last_login_at = NOW() WHERE id = ?', [admin.id]);

    // 记录登录日志
    await conn.query(
      'INSERT INTO operation_logs (operation, operator, admin_id, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
      ['用户登录系统', admin.name, admin.id, req.ip, req.get('User-Agent')]
    );

    // 生成 JWT token
    const token = jwt.sign(
      { adminId: admin.id, phone: admin.phone },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 清理敏感信息
    delete admin.password;

    // 提取所有权限
    const allPermissions = new Set();
    roles.forEach(role => {
      if (role.permissions) {
        role.permissions.split(',').forEach(perm => allPermissions.add(perm));
      }
    });

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          phone: admin.phone,
          roles,
          permissions: Array.from(allPermissions)
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 获取当前管理员信息
export async function getCurrentAdmin(req, res) {
  try {
    const conn = await getConnection();

    const [adminRows] = await conn.query(`
      SELECT a.id, a.name, a.phone, a.is_active, a.last_login_at,
             GROUP_CONCAT(DISTINCT r.name ORDER BY r.name SEPARATOR ',') as roleNames
      FROM admins a
      LEFT JOIN admin_roles ar ON a.id = ar.admin_id
      LEFT JOIN roles r ON ar.role_id = r.id
      WHERE a.id = ? AND a.is_active = 1
      GROUP BY a.id
    `, [req.user.adminId]);

    if (adminRows.length === 0) {
      return res.status(404).json({ success: false, message: '管理员不存在' });
    }

    const admin = adminRows[0];

    res.json({
      success: true,
      data: {
        id: admin.id,
        name: admin.name,
        phone: admin.phone,
        roles: admin.roleNames ? admin.roleNames.split(',') : [],
        lastLoginAt: admin.last_login_at
      }
    });
  } catch (error) {
    console.error('获取管理员信息错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 修改密码
export async function changePassword(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: errors.array()
      });
    }

    const { oldPassword, newPassword } = req.body;
    const adminId = req.user.adminId;

    const conn = await getConnection();

    const [adminRows] = await conn.query(
      'SELECT password FROM admins WHERE id = ?',
      [adminId]
    );

    if (adminRows.length === 0) {
      return res.status(404).json({ success: false, message: '管理员不存在' });
    }

    const admin = adminRows[0];
    const validPassword = await bcrypt.compare(oldPassword, admin.password);

    if (!validPassword) {
      return res.status(401).json({ success: false, message: '原密码错误' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await conn.query(
      'UPDATE admins SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, adminId]
    );

    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

export default {
  login,
  getCurrentAdmin,
  changePassword
};