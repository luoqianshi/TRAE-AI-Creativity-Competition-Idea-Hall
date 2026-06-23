import jwt from 'jsonwebtoken';
import { getConnection } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: '访问令牌缺失，请先登录' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: '访问令牌无效或已过期' });
    }

    try {
      // 从数据库验证管理员仍然存在且启用
      const conn = await getConnection();
      const [admins] = await conn.query(
        'SELECT id, name, phone, is_active FROM admins WHERE id = ? AND is_active = 1',
        [decoded.adminId]
      );

      if (admins.length === 0) {
        return res.status(401).json({ success: false, message: '管理员账户已被禁用' });
      }

      // 获取管理员的所有角色和权限
      const [roles] = await conn.query(`
        SELECT r.id, r.name, r.description,
               GROUP_CONCAT(p.code ORDER BY p.code) as permissions
        FROM admin_roles ar
        JOIN roles r ON ar.role_id = r.id
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        LEFT JOIN permissions p ON rp.permission_id = p.id
        WHERE ar.admin_id = ?
        GROUP BY r.id
      `, [decoded.adminId]);

      // 将所有权限代码提取为数组
      const allPermissions = new Set();
      roles.forEach(role => {
        if (role.permissions) {
          role.permissions.split(',').forEach(perm => allPermissions.add(perm));
        }
      });

      req.user = {
        adminId: decoded.adminId,
        admin: admins[0],
        roles: roles,
        permissions: Array.from(allPermissions)
      };

      next();
    } catch (error) {
      console.error('认证中间件错误:', error);
      return res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  });
}

// 可选认证中间件：有token则验证，无token则继续（用于家长免登录查看）
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // 无token，直接继续（家长身份）
    return next();
  }

  // 有token，进行验证
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      // token无效，继续但不设置用户信息
      return next();
    }

    try {
      const conn = await getConnection();
      const [admins] = await conn.query(
        'SELECT id, name, phone, is_active FROM admins WHERE id = ? AND is_active = 1',
        [decoded.adminId]
      );

      if (admins.length > 0) {
        // 获取管理员的所有角色和权限
        const [roles] = await conn.query(`
          SELECT r.id, r.name, r.description,
                 GROUP_CONCAT(p.code ORDER BY p.code) as permissions
          FROM admin_roles ar
          JOIN roles r ON ar.role_id = r.id
          LEFT JOIN role_permissions rp ON r.id = rp.role_id
          LEFT JOIN permissions p ON rp.permission_id = p.id
          WHERE ar.admin_id = ?
          GROUP BY r.id
        `, [decoded.adminId]);

        const allPermissions = new Set();
        roles.forEach(role => {
          if (role.permissions) {
            role.permissions.split(',').forEach(perm => allPermissions.add(perm));
          }
        });

        req.user = {
          adminId: decoded.adminId,
          admin: admins[0],
          roles: roles,
          permissions: Array.from(allPermissions)
        };
      }
    } catch (error) {
      console.error('可选认证中间件错误:', error);
    }

    next();
  });
}

export function requirePermission(permissionCode) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: '未认证' });
    }

    // SuperAdmin 拥有所有权限
    const isSuperAdmin = req.user.roles.some(role => role.name === 'SuperAdmin');
    if (isSuperAdmin) {
      return next();
    }

    // 检查是否拥有所需权限
    const hasPermission = req.user.permissions.includes(permissionCode);
    if (!hasPermission) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    next();
  };
}

export default { authenticateToken, requirePermission };