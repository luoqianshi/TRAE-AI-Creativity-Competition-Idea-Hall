import { getConnection } from '../config/database.js';
import { validationResult } from 'express-validator';

// 获取所有班级（活跃状态）
export async function getAllClasses(req, res) {
  try {
    const conn = await getConnection();

    const [rows] = await conn.query(`
      SELECT c.id, c.name, c.org_id, c.is_active, c.created_at,
             o.name as org_name
      FROM classes c
      JOIN organizations o ON c.org_id = o.id
      WHERE c.is_active = 1 AND o.is_active = 1
      ORDER BY c.id
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取班级列表错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 根据机构ID获取班级列表
export async function getClassesByOrg(req, res) {
  try {
    const { orgId } = req.params;
    const conn = await getConnection();

    const [rows] = await conn.query(`
      SELECT c.id, c.name, c.org_id, c.is_active, c.created_at,
             o.name as org_name
      FROM classes c
      JOIN organizations o ON c.org_id = o.id
      WHERE c.org_id = ? AND c.is_active = 1 AND o.is_active = 1
      ORDER BY c.id
    `, [orgId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取班级列表错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 创建班级
export async function createClass(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: errors.array()
      });
    }

    const { org_id, name } = req.body;
    const conn = await getConnection();

    // 检查机构是否存在
    const [orgRows] = await conn.query(
      'SELECT id FROM organizations WHERE id = ? AND is_active = 1',
      [org_id]
    );

    if (orgRows.length === 0) {
      return res.status(400).json({ success: false, message: '机构不存在或已被禁用' });
    }

    const [result] = await conn.query(
      'INSERT INTO classes (org_id, name) VALUES (?, ?)',
      [org_id, name]
    );

    // 记录操作日志
    await conn.query(
      'INSERT INTO operation_logs (operation, operator, admin_id) VALUES (?, ?, ?)',
      [`在机构 ${org_id} 中新增班级: ${name}`, req.user.admin.name, req.user.adminId]
    );

    const [newClass] = await conn.query('SELECT * FROM classes WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newClass[0], message: '班级创建成功' });
  } catch (error) {
    console.error('创建班级错误:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: '该机构下已有同名班级' });
    }
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 更新班级状态
export async function updateClass(req, res) {
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
      'UPDATE classes SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '班级不存在' });
    }

    const action = is_active ? '启用' : '禁用';
    await conn.query(
      'INSERT INTO operation_logs (operation, operator, admin_id) VALUES (?, ?, ?)',
      [`${action}班级 ID:${id}`, req.user.admin.name, req.user.adminId]
    );

    res.json({ success: true, message: '班级状态更新成功' });
  } catch (error) {
    console.error('更新班级错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

export default {
  getAllClasses,
  getClassesByOrg,
  createClass,
  updateClass
};