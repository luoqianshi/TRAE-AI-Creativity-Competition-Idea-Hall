import { getConnection } from '../config/database.js';
import { validationResult } from 'express-validator';

// 获取所有机构和班级
export async function getAllOrganizations(req, res) {
  try {
    const conn = await getConnection();

    const [orgRows] = await conn.query(`
      SELECT o.id, o.name, o.is_active, o.created_at,
             COALESCE(
               JSON_ARRAYAGG(
                 JSON_OBJECT('id', c.id, 'name', c.name, 'is_active', c.is_active)
               ),
               JSON_ARRAY()
             ) as classes
      FROM organizations o
      LEFT JOIN classes c ON o.id = c.org_id AND c.is_active = 1
      WHERE o.is_active = 1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    const organizations = orgRows.map(org => ({
      id: org.id,
      name: org.name,
      isActive: org.is_active,
      createdAt: org.created_at,
      classes: Array.isArray(org.classes) ? org.classes : (org.classes ? JSON.parse(org.classes) : [])
    }));

    res.json({ success: true, data: organizations });
  } catch (error) {
    console.error('获取机构列表错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 创建机构
export async function createOrganization(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: errors.array()
      });
    }

    const { name } = req.body;
    const conn = await getConnection();

    const [result] = await conn.query(
      'INSERT INTO organizations (name) VALUES (?)',
      [name]
    );

    // 记录操作日志
    await conn.query(
      'INSERT INTO operation_logs (operation, operator, admin_id) VALUES (?, ?, ?)',
      [`新增机构: ${name}`, req.user.admin.name, req.user.adminId]
    );

    const [newOrg] = await conn.query('SELECT * FROM organizations WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newOrg[0], message: '机构创建成功' });
  } catch (error) {
    console.error('创建机构错误:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: '机构名称已存在' });
    }
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 更新机构（激活/禁用）
export async function updateOrganization(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { is_active } = req.body;
    const conn = await getConnection();

    const [result] = await conn.query(
      'UPDATE organizations SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '机构不存在' });
    }

    // 记录操作日志
    const action = is_active ? '启用' : '禁用';
    await conn.query(
      'INSERT INTO operation_logs (operation, operator, admin_id) VALUES (?, ?, ?)',
      [`${action}机构 ID:${id}`, req.user.admin.name, req.user.adminId]
    );

    res.json({ success: true, message: '机构状态更新成功' });
  } catch (error) {
    console.error('更新机构错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

export default {
  getAllOrganizations,
  createOrganization,
  updateOrganization
};