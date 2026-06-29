<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/response.php';

$keyword = $_GET['keyword'] ?? null;
$page = max(1, (int)($_GET['page'] ?? 1));
$perPage = min(50, max(1, (int)($_GET['per_page'] ?? 10)));
$offset = ($page - 1) * $perPage;

if (!$keyword) {
    Response::error('请输入搜索关键词', 400);
}

$db = Database::getInstance();

$where = '(name LIKE ? OR model LIKE ? OR description LIKE ? OR category LIKE ?)';
$params = [
    "%{$keyword}%",
    "%{$keyword}%",
    "%{$keyword}%",
    "%{$keyword}%"
];

$total = $db->count('components', $where, $params);

$params[] = $perPage;
$params[] = $offset;

$components = $db->fetchAll(
    "SELECT * FROM components WHERE {$where} ORDER BY name ASC LIMIT ? OFFSET ?",
    $params
);

Response::paginated($components, $total, $page, $perPage);
