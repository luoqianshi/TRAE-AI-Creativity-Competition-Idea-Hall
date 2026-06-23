import { getConnection } from '../config/database.js';

// 获取操作日志
export async function getOperationLogs(req, res) {
  try {
    const {
      admin_id,
      start_date,
      end_date,
      operator,
      page = 1,
      limit = 50
    } = req.query;

    const conn = await getConnection();
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (admin_id) {
      whereClause += ' AND ol.admin_id = ?';
      params.push(admin_id);
    }
    if (operator) {
      whereClause += ' AND ol.operator LIKE ?';
      params.push(`%${operator}%`);
    }
    if (start_date) {
      whereClause += ' AND DATE(ol.created_at) >= ?';
      params.push(start_date);
    }
    if (end_date) {
      whereClause += ' AND DATE(ol.created_at) <= ?';
      params.push(end_date);
    }

    const offset = (page - 1) * limit;

    // 查询总数
    const [countRows] = await conn.query(
      `SELECT COUNT(*) as total FROM operation_logs ol ${whereClause}`,
      params
    );

    // 查询数据
    const [rows] = await conn.query(`
      SELECT ol.*, a.name as admin_name, a.phone as admin_phone
      FROM operation_logs ol
      LEFT JOIN admins a ON ol.admin_id = a.id
      ${whereClause}
      ORDER BY ol.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: countRows[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countRows[0].total / limit)
      }
    });
  } catch (error) {
    console.error('获取操作日志错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

export default {
  getOperationLogs
};