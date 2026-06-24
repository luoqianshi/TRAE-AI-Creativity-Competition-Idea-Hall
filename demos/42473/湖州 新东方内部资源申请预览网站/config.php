<?php
/**
 * 数据库配置与初始化
 * 使用 SQLite，无需额外安装，文件自动生成于 data/db.sqlite
 */

define('DB_PATH', __DIR__ . '/data/db.sqlite');
define('DATA_DIR', __DIR__ . '/data');

if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0777, true);
}

function db() {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO('sqlite:' . DB_PATH);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        init_db($pdo);
    }
    return $pdo;
}

function init_db($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        location TEXT,
        campus TEXT DEFAULT '',
        capacity INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now','localtime'))
    )");

    // 迁移：已有表加 campus 列
    try { $pdo->exec("ALTER TABLE resources ADD COLUMN campus TEXT DEFAULT ''"); } catch(Exception $e) {}

    $pdo->exec("CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resource_id INTEGER NOT NULL,
        reserve_date TEXT NOT NULL,
        time_slot INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'reserved',
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        employee_id TEXT,
        department TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        scanned_at TEXT,
        token TEXT NOT NULL UNIQUE,
        FOREIGN KEY (resource_id) REFERENCES resources(id)
    )");

    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_res_lookup ON reservations(resource_id, reserve_date, time_slot)");
}

/**
 * 时间段定义：8 点到 22 点（晚上 10 点），每 2 小时为一个点
 */
function time_slots() {
    return [
        1 => ['08:00', '10:00'],
        2 => ['10:00', '12:00'],
        3 => ['12:00', '14:00'],
        4 => ['14:00', '16:00'],
        5 => ['16:00', '18:00'],
        6 => ['18:00', '20:00'],
        7 => ['20:00', '22:00'],
    ];
}

function slot_label($slot) {
    $slots = time_slots();
    $s = $slots[$slot] ?? ['', ''];
    return $s[0] . '-' . $s[1];
}

/**
 * 生成随机 token，用于扫码链接
 */
function gen_token() {
    return bin2hex(random_bytes(16));
}

/**
 * 自动流转：黄点（reserved）若已超过预约时段结束时间且未扫码，则变黑（missed）
 */
function refresh_status() {
    $pdo = db();
    $slots = time_slots();
    $now = time();
    $today = date('Y-m-d');
    // 处理今天及之前的 reserved 记录
    $rows = $pdo->query("SELECT id, reserve_date, time_slot FROM reservations
        WHERE status='reserved' AND reserve_date <= '$today'")->fetchAll();
    foreach ($rows as $r) {
        $end = $slots[$r['time_slot']][1] ?? '22:00';
        $endTs = strtotime($r['reserve_date'] . ' ' . $end);
        if ($now > $endTs) {
            $pdo->prepare("UPDATE reservations SET status='missed' WHERE id=?")
                ->execute([$r['id']]);
        }
    }
}

/**
 * 统一 HTML 头部
 */
function head($title) {
    refresh_status();
    echo '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">';
    echo '<meta name="apple-mobile-web-app-capable" content="yes">';
    echo '<meta name="apple-mobile-web-app-status-bar-style" content="default">';
    echo '<meta name="format-detection" content="telephone=no">';
    echo '<title>' . htmlspecialchars($title) . '</title>';
    echo '<link rel="stylesheet" href="style.css">';
    echo '</head><body>';
    echo '<header class="topbar"><div class="wrap">';
    echo '<a class="brand" href="index.php">湖州新东方 · 教室预约</a>';
    echo '</div></header><main class="wrap">';
}

function foot() {
    echo '</main>';
    echo '<script src="app.js"></script></body></html>';
}

function e($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

/**
 * 管理员账号配置
 * 默认账号 admin / 密码 xdf2026，可在此修改
 */
define('ADMIN_USER', 'admin');
define('ADMIN_PASS', 'xdf2026');

/**
 * 检查是否已登录后台
 */
function is_admin() {
    return !empty($_SESSION['admin_login']);
}

/**
 * 要求登录，未登录则跳转登录页
 */
function require_admin() {
    if (!is_admin()) {
        header('Location: login.php');
        exit;
    }
}

/**
 * 初始化 session
 */
function init_session() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}
