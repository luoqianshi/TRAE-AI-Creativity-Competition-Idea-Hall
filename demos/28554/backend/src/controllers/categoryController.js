import { getConnection } from '../config/database.js';
import { validationResult } from 'express-validator';

// 获取所有类目
export async function getAllCategories(req, res) {
  try {
    const conn = await getConnection();

    const [rows] = await conn.query(`
      SELECT * FROM categories
      WHERE is_active = 1
      ORDER BY sort_order, id
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取类目列表错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 创建类目
export async function createCategory(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: errors.array()
      });
    }

    const { name, color = '#3B82F6' } = req.body;
    const conn = await getConnection();

    // 检查类目是否已存在
    const [existing] = await conn.query(
      'SELECT id FROM categories WHERE name = ?',
      [name]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: '类目名称已存在' });
    }

    const [result] = await conn.query(
      'INSERT INTO categories (name, color) VALUES (?, ?)',
      [name, color]
    );

    // 记录操作日志
    await conn.query(
      'INSERT INTO operation_logs (operation, operator, admin_id) VALUES (?, ?, ?)',
      [`新增类目: ${name}`, req.user.admin.name, req.user.adminId]
    );

    const [newCategory] = await conn.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newCategory[0], message: '类目创建成功' });
  } catch (error) {
    console.error('创建类目错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 更新类目
export async function updateCategory(req, res) {
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
    const { name, color, sort_order, is_active } = req.body;
    const conn = await getConnection();

    // 检查类目是否存在
    const [existing] = await conn.query('SELECT id FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: '类目不存在' });
    }

    // 如果修改名称，检查是否重复
    if (name) {
      const [dup] = await conn.query(
        'SELECT id FROM categories WHERE name = ? AND id != ?',
        [name, id]
      );
      if (dup.length > 0) {
        return res.status(400).json({ success: false, message: '类目名称已存在' });
      }
    }

    await conn.query(`
      UPDATE categories
      SET name = COALESCE(?, name),
          color = COALESCE(?, color),
          sort_order = COALESCE(?, sort_order),
          is_active = COALESCE(?, is_active),
          updated_at = NOW()
      WHERE id = ?
    `, [name, color, sort_order, is_active, id]);

    // 记录操作日志
    await conn.query(
      'INSERT INTO operation_logs (operation, operator, admin_id) VALUES (?, ?, ?)',
      [`更新类目 ID:${id}`, req.user.admin.name, req.user.adminId]
    );

    const [updated] = await conn.query('SELECT * FROM categories WHERE id = ?', [id]);

    res.json({ success: true, data: updated[0], message: '类目更新成功' });
  } catch (error) {
    console.error('更新类目错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 删除类目（软删除）
export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const conn = await getConnection();

    const [result] = await conn.query(
      'UPDATE categories SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '类目不存在' });
    }

    await conn.query(
      'INSERT INTO operation_logs (operation, operator, admin_id) VALUES (?, ?, ?)',
      [`删除类目 ID:${id}`, req.user.admin.name, req.user.adminId]
    );

    res.json({ success: true, message: '类目已删除' });
  } catch (error) {
    console.error('删除类目错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

export default {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};