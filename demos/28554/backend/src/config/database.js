import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 确定当前文件所在目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 从项目根目录加载 .env 文件
dotenv.config({ path: join(__dirname, '../../.env') });

console.log('📦 环境变量检查:');
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_PORT:', process.env.DB_PORT);
console.log('  DB_USER:', process.env.DB_USER);
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'empty');
console.log('  DB_DATABASE:', process.env.DB_DATABASE);

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'caiwu',
  charset: process.env.DB_CHARSET || 'utf8mb4',
  timezone: 'Z',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let connection = null;

export async function getConnection() {
  if (!connection) {
    try {
      console.log('🔧 尝试创建数据库连接...');
      console.log('📋 连接配置:', JSON.stringify(dbConfig, null, 2));
      connection = await mysql.createConnection(dbConfig);
      console.log('✅ 数据库连接成功');
    } catch (error) {
      console.error('❌ 创建连接失败:', error.message);
      throw error;
    }
  }
  return connection;
}

export async function closeConnection() {
  if (connection) {
    await connection.end();
    connection = null;
    console.log('✅ 数据库连接已关闭');
  }
}

// 测试连接
export async function testConnection() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query('SELECT 1 as test');
    console.log('✅ 数据库连接测试成功');
    return { success: true, data: rows[0] };
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return { success: false, error: error.message };
  }
}

export default { getConnection, closeConnection, testConnection };