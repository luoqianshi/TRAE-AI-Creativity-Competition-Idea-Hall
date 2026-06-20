<?php
/**
 * FlowerSea Blog - 数据库配置文件
 * 
 * 使用说明：
 * 1. 在 InfinityFree 控制面板中找到 MySQL 数据库信息
 * 2. 修改下方的数据库连接参数
 * 3. 确保此文件不被公开访问（已放在 api/ 目录下）
 */

// 设置时区为北京时间（Asia/Shanghai）
date_default_timezone_set('Asia/Shanghai');

// 数据库配置 - 请根据你的 InfinityFree 账户信息修改
// 在控制面板 -> MySQL 数据库 中可以找到这些信息
define('DB_HOST', 'your-db-host.com');               // MySQL 主机名
define('DB_NAME', 'your_database_name');             // 数据库名称
define('DB_USER', 'your_db_username');               // MySQL 用户名
define('DB_PASS', 'your_db_password');               // MySQL 密码
define('DB_CHARSET', 'utf8mb4');

// CORS 配置 - 允许你的博客域名访问 API
$allowed_origins = [
    'https://your-domain.com',
    'http://your-domain.com',
    'http://localhost',
    'http://localhost:8080'
];

// 设置响应头
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 数据库连接函数
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            // 设置 MySQL 会话时区为北京时间 (+8:00)
            $pdo->exec("SET time_zone = '+8:00'");
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => '数据库连接失败: ' . $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}

// 统一返回 JSON 响应
function jsonResponse($success, $data = null, $message = '') {
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message
    ]);
    exit;
}

// 获取客户端 IP
function getClientIP() {
    $ip = '';
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } elseif (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        $ip = $_SERVER['HTTP_X_REAL_IP'];
    } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}

// 输入过滤
function sanitize($input) {
    if (is_array($input)) {
        return array_map('sanitize', $input);
    }
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}
