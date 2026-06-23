import { getConnection } from './src/config/database.js';

async function debugStats() {
  try {
    const conn = await getConnection();
    console.log('✅ 数据库连接成功');

    const org_id = 1;
    const class_id = null;
    const start_date = null;
    const end_date = null;

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

    console.log('【调试】whereClause:', whereClause);
    console.log('【调试】params:', params);

    // 检查expenses表是否存在
    const [tables] = await conn.query("SHOW TABLES LIKE 'expenses'");
    console.log('【调试】expenses表存在:', tables.length > 0);

    if (tables.length === 0) {
      console.log('【警告】expenses表不存在!');
      return;
    }

    // 检查expenses表结构
    const [describe] = await conn.query('DESCRIBE expenses');
    console.log('【调试】expenses表结构:', describe);

    // 查询expenses表中的数据行数
    const [countRows] = await conn.query('SELECT COUNT(*) as total FROM expenses');
    console.log('【调试】expenses总行数:', countRows[0].total);

    // 总费用
    console.log('【调试】开始执行总费用查询...');
    const [totalRows] = await conn.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM expenses ${whereClause}`,
      params
    );
    console.log('【调试】总费用查询成功:', totalRows);

    // 按类目统计
    console.log('【调试】开始执行按类目统计...');
    const [categoryRows] = await conn.query(`
      SELECT category, COALESCE(SUM(amount), 0) as amount
      FROM expenses ${whereClause}
      GROUP BY category
      ORDER BY amount DESC
    `, params);
    console.log('【调试】按类目统计成功:', categoryRows);

    // 按状态统计
    console.log('【调试】开始执行按状态统计...');
    const [statusRows] = await conn.query(`
      SELECT status, COALESCE(SUM(amount), 0) as amount
      FROM expenses ${whereClause}
      GROUP BY status
    `, params);
    console.log('【调试】按状态统计成功:', statusRows);

    // 按班级统计
    console.log('【调试】开始执行按班级统计...');
    const [classRows] = await conn.query(`
      SELECT c.id, c.name, COALESCE(SUM(e.amount), 0) as total
      FROM classes c
      LEFT JOIN expenses e ON c.id = e.class_id
      ${whereClause}
      WHERE c.is_active = 1
      GROUP BY c.id, c.name
      ORDER BY total DESC
    `, params);
    console.log('【调试】按班级统计成功:', classRows);

    console.log('✅ 所有查询成功完成');

    await conn.end();
  } catch (error) {
    console.error('❌ 错误:');
    console.error('错误码:', error.code);
    console.error('错误信息:', error.message);
    console.error('堆栈:', error.stack);
  }
}

debugStats();
