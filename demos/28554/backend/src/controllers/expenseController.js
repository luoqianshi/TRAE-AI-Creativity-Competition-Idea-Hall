import { getConnection } from '../config/database.js';
import { validationResult } from 'express-validator';

// 类目颜色映射
function getCategoryColor(category) {
  const colors = {
    '教材费用': '#1989fa',
    '玩具采购': '#ff976a',
    '伙食费': '#07c160',
    '水电费': '#6467f0',
    '活动经费': '#ee0a24',
    '其他': '#969799'
  };
  return colors[category] || '#1989fa';
}

// 获取费用记录列表（支持筛选）
export async function getExpenses(req, res) {
  try {
    const {
      org_id,
      class_id,
      category,
      status,
      start_date,
      end_date,
      page = 1,
      limit = 50
    } = req.query;

    const conn = await getConnection();
    let whereClause = 'WHERE 1=1';
    const params = [];

    // 构建筛选条件
    if (org_id) {
      whereClause += ' AND e.org_id = ?';
      params.push(org_id);
    }
    if (class_id) {
      whereClause += ' AND e.class_id = ?';
      params.push(class_id);
    }
    if (category) {
      whereClause += ' AND e.category = ?';
      params.push(category);
    }
    if (status) {
      whereClause += ' AND e.status = ?';
      params.push(status);
    }
    if (start_date) {
      whereClause += ' AND e.date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      whereClause += ' AND e.date <= ?';
      params.push(end_date);
    }

    const offset = (page - 1) * limit;

    // 查询总数
    const [countRows] = await conn.query(
      `SELECT COUNT(*) as total FROM expenses e ${whereClause}`,
      params
    );

    // 查询数据
    const [rows] = await conn.query(`
      SELECT e.*,
             o.name as org_name,
             c.name as class_name,
             a.name as created_by_name
      FROM expenses e
      LEFT JOIN organizations o ON e.org_id = o.id
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN admins a ON e.created_by = a.id
      ${whereClause}
      ORDER BY e.date DESC, e.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // 确保金额等数值字段为数字类型（防止MySQL返回字符串）
    const normalizedRows = rows.map(row => ({
      ...row,
      amount: Number(row.amount)
    }));

    res.json({
      success: true,
      data: normalizedRows,
      pagination: {
        total: countRows[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countRows[0].total / limit)
      }
    });
  } catch (error) {
    console.error('获取费用列表错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 获取单条费用记录
export async function getExpenseById(req, res) {
  try {
    const { id } = req.params;
    const conn = await getConnection();

    const [rows] = await conn.query(`
      SELECT e.*,
             o.name as org_name,
             c.name as class_name,
             a.name as created_by_name,
             app.name as approved_by_name
      FROM expenses e
      LEFT JOIN organizations o ON e.org_id = o.id
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN admins a ON e.created_by = a.id
      LEFT JOIN admins app ON e.approved_by = app.id
      WHERE e.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '费用记录不存在' });
    }

    // 确保金额为数字类型
    const expense = {
      ...rows[0],
      amount: Number(rows[0].amount)
    };

    res.json({ success: true, data: expense });
  } catch (error) {
    console.error('获取费用详情错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 创建费用记录
export async function createExpense(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: errors.array()
      });
    }

    const {
      date,
      category,
      amount,
      handler,
      status = '待审核',
      remark,
      class_id,
      org_id
    } = req.body;

    const conn = await getConnection();

    // 验证机构（如果提供）
    if (org_id) {
      const [orgRows] = await conn.query(
        'SELECT id FROM organizations WHERE id = ? AND is_active = 1',
        [org_id]
      );
      if (orgRows.length === 0) {
        return res.status(400).json({ success: false, message: '机构不存在或已被禁用' });
      }
    }

    // 验证班级（如果提供）
    if (class_id) {
      const [classRows] = await conn.query(
        'SELECT id FROM classes WHERE id = ? AND is_active = 1',
        [class_id]
      );
      if (classRows.length === 0) {
        return res.status(400).json({ success: false, message: '班级不存在或已被禁用' });
      }
    }

    const [result] = await conn.query(`
      INSERT INTO expenses (date, category, amount, handler, status, remark, class_id, org_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [date, category, amount, handler, status, remark || null, class_id || null, org_id || null, req.user.adminId]);

    // 记录操作日志
    await conn.query(
      'INSERT INTO operation_logs (operation, operator, admin_id) VALUES (?, ?, ?)',
      [`创建费用记录: ${category} ¥${amount}`, req.user.admin.name, req.user.adminId]
    );

    const [newExpense] = await conn.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);

    // 确保金额为数字类型
    const normalizedExpense = {
      ...newExpense[0],
      amount: Number(newExpense[0].amount)
    };

    res.status(201).json({ success: true, data: normalizedExpense, message: '费用记录创建成功' });
  } catch (error) {
    console.error('创建费用记录错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 更新费用记录
export async function updateExpense(req, res) {
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
    const {
      date,
      category,
      amount,
      handler,
      status,
      remark,
      class_id,
      org_id
    } = req.body;

    const conn = await getConnection();

    // 检查费用记录是否存在
    const [existing] = await conn.query('SELECT id FROM expenses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: '费用记录不存在' });
    }

    await conn.query(`
      UPDATE expenses
      SET date = COALESCE(?, date),
          category = COALESCE(?, category),
          amount = COALESCE(?, amount),
          handler = COALESCE(?, handler),
          status = COALESCE(?, status),
          remark = COALESCE(?, remark),
          class_id = ?,
          org_id = ?,
          updated_at = NOW()
      WHERE id = ?
    `, [date, category, amount, handler, status, remark, class_id || null, org_id || null, id]);

    // 记录操作日志
    await conn.query(
      'INSERT INTO operation_logs (operation, operator, admin_id) VALUES (?, ?, ?)',
      [`更新费用记录 ID:${id}`, req.user.admin.name, req.user.adminId]
    );

    const [updated] = await conn.query('SELECT * FROM expenses WHERE id = ?', [id]);

    // 确保金额为数字类型
    const normalizedExpense = {
      ...updated[0],
      amount: Number(updated[0].amount)
    };

    res.json({ success: true, data: normalizedExpense, message: '费用记录更新成功' });
  } catch (error) {
    console.error('更新费用记录错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 删除费用记录
export async function deleteExpense(req, res) {
  try {
    const { id } = req.params;
    const conn = await getConnection();

    const [result] = await conn.query(
      'DELETE FROM expenses WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '费用记录不存在' });
    }

    await conn.query(
      'INSERT INTO operation_logs (operation, operator, admin_id) VALUES (?, ?, ?)',
      [`删除费用记录 ID:${id}`, req.user.admin.name, req.user.adminId]
    );

    res.json({ success: true, message: '费用记录已删除' });
  } catch (error) {
    console.error('删除费用记录错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 统计费用数据（仪表盘）
export async function getStatistics(req, res) {
  try {
    const { org_id, class_id, start_date, end_date } = req.query;
    const conn = await getConnection();

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (org_id) {
      whereClause += ' AND e.org_id = ?';
      params.push(org_id);
    }
    if (class_id) {
      whereClause += ' AND e.class_id = ?';
      params.push(class_id);
    }
    if (start_date) {
      whereClause += ' AND e.date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      whereClause += ' AND e.date <= ?';
      params.push(end_date);
    }

    // 总费用（使用别名 e，与 whereClause 中的 e.org_id、e.class_id 等一致）
    const [totalRows] = await conn.query(
      `SELECT COALESCE(SUM(e.amount), 0) as total FROM expenses e ${whereClause}`,
      params
    );

    // 按类目统计
    const [categoryRows] = await conn.query(`
      SELECT e.category, COALESCE(SUM(e.amount), 0) as amount
      FROM expenses e ${whereClause}
      GROUP BY e.category
      ORDER BY amount DESC
    `, params);

    // 按状态统计
    const [statusRows] = await conn.query(`
      SELECT e.status, COALESCE(SUM(e.amount), 0) as amount
      FROM expenses e ${whereClause}
      GROUP BY e.status
    `, params);

    // 按班级统计
    const [classRows] = await conn.query(`
      SELECT c.id, c.name, COALESCE(SUM(e.amount), 0) as total
      FROM classes c
      LEFT JOIN expenses e ON c.id = e.class_id
      ${whereClause}
      GROUP BY c.id, c.name
      ORDER BY total DESC
    `, params);

    const totalExpense = Number(totalRows[0].total) || 0;

    // 转换类目统计数据为数组格式
    const categoryStatsArray = categoryRows.map(row => ({
      name: row.category,
      total: Number(row.amount),
      percentage: 0, // 前端计算
      color: getCategoryColor(row.category)
    }));

    // 计算每个类目的百分比
    categoryStatsArray.forEach(cat => {
      cat.percentage = totalExpense > 0 ? Math.round((cat.total / totalExpense) * 100) / 100 : 0;
    });

    // 转换状态统计数据为数组格式
    const statusStatsArray = statusRows.map(row => ({
      name: row.status,
      total: Number(row.amount),
      percentage: totalExpense > 0 ? Math.round((Number(row.amount) / totalExpense) * 100) / 100 : 0
    }));

    // 转换班级统计数据为数组格式
    const classStatsArray = classRows.map(row => ({
      id: row.id,
      name: row.name,
      total: Number(row.total)
    }));

    res.json({
      success: true,
      data: {
        total_collected: totalExpense, // 总收缴
        total_expended: totalExpense,  // 已支出
        balance: totalExpense,         // 余额（需根据实际业务逻辑计算）
        categoryStats: categoryStatsArray,
        statusStats: statusStatsArray,
        classStats: classStatsArray
      }
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

// 审批费用记录
export async function approveExpense(req, res) {
  try {
    const { id } = req.params;
    const conn = await getConnection();

    const [result] = await conn.query(`
      UPDATE expenses
      SET status = '已完成',
          approved_by = ?,
          approved_at = NOW()
      WHERE id = ? AND status != '已完成'
    `, [req.user.adminId, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '费用记录不存在或已审批' });
    }

    await conn.query(
      'INSERT INTO operation_logs (operation, operator, admin_id) VALUES (?, ?, ?)',
      [`审批通过费用记录 ID:${id}`, req.user.admin.name, req.user.adminId]
    );

    res.json({ success: true, message: '审批通过' });
  } catch (error) {
    console.error('审批费用错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

export default {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getStatistics,
  approveExpense
};